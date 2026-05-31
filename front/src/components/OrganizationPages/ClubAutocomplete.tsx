"use client";

import { useEffect, useRef, useState } from "react";
import { FaSearch, FaShieldAlt } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ClubSuggestion = {
  id: string;
  name: string;
  slug: string;
  country?: string | null;
  logoUrl?: string | null;
  type?: string | null;
};

// Etiquetas en español para cada tipo de OrganizationPage. Si el tipo no está
// en el mapa (o falta), no se renderiza el chip.
const TYPE_LABELS: Record<string, string> = {
  CLUB: "Club",
  ACADEMY: "Academia",
  FORMATION_SCHOOL: "Escuela de formación",
  AGENCY: "Agencia",
  TOURNAMENT_ORGANIZER: "Organizador de torneos",
  LEAGUE: "Liga",
  FEDERATION: "Federación",
  NATIONAL_TEAM: "Selección nacional",
};

type Props = {
  value: string;
  selectedPageId?: string | null;
  selectedPageSlug?: string | null;
  onChange: (next: {
    club: string;
    clubPageId?: string;
    clubPageSlug?: string;
    clubPageLogo?: string;
  }) => void;
  placeholder?: string;
  disabled?: boolean;
  inputId?: string;
  // Solo el rol Agente puede ver/seleccionar páginas de tipo AGENCY en la
  // trayectoria. Para el resto de los roles las agencias se ocultan.
  includeAgency?: boolean;
};

// Autocomplete para vincular trayectorias con cualquier OrganizationPage
// (CLUB, ACADEMY, AGENCY, etc.). El user puede:
//   - Tipear libre — guarda solo el nombre (sin clubPageId/Slug).
//   - Seleccionar una sugerencia — guarda nombre + clubPageId + clubPageSlug.
// El backend acepta ambos casos (los campos clubPage* son opcionales).
const ClubAutocomplete: React.FC<Props> = ({
  value,
  selectedPageId,
  selectedPageSlug,
  onChange,
  placeholder,
  disabled = false,
  inputId,
  includeAgency = false,
}) => {
  // El placeholder por defecto depende del rol: el Agente ve "agencia" como
  // opción, el resto no. Si el caller pasa un placeholder explícito, gana.
  const resolvedPlaceholder =
    placeholder ??
    (includeAgency ? "Club, agencia o institución" : "Club o institución");
  const [suggestions, setSuggestions] = useState<ClubSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Debounced search — solo dispara cuando hay >= 2 chars y el valor cambió
  // respecto del nombre ya seleccionado (para no llamar cuando el user solo
  // está mirando el resultado ya elegido).
  useEffect(() => {
    if (!API_URL) return;
    if (!open) return;
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const handler = window.setTimeout(async () => {
      setLoading(true);
      try {
        // Sin filtro de type — el backend devuelve TODOS los tipos de
        // OrganizationPage (CLUB, ACADEMY, AGENCY, etc.) ordenados por nombre.
        // Así un Agente puede vincular su propia agencia en la trayectoria.
        const res = await fetch(
          `${API_URL}/organization-pages?q=${encodeURIComponent(
            trimmed,
          )}&limit=15`,
          { signal: controller.signal },
        );
        const data = res.ok ? await res.json() : { data: [] };
        const rows = Array.isArray(data?.data) ? data.data : [];
        const flat = rows
          .map((p: {
            id: string;
            name: string;
            slug: string;
            country?: string | null;
            logoUrl?: string | null;
            type?: string | null;
          }) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            country: p.country ?? null,
            logoUrl: p.logoUrl ?? null,
            type: p.type ?? null,
          }))
          .sort((a: ClubSuggestion, b: ClubSuggestion) =>
            a.name.localeCompare(b.name),
          );
        // Solo el Agente puede ver páginas de tipo AGENCY. Para el resto, se
        // filtran del lado del cliente (por eso pedimos limit=15 y recortamos).
        const filtered = (
          includeAgency
            ? flat
            : flat.filter((s: ClubSuggestion) => s.type !== "AGENCY")
        ).slice(0, 10);
        setSuggestions(filtered);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error buscando páginas para trayectoria:", err);
        }
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      window.clearTimeout(handler);
      controller.abort();
    };
  }, [value, open, includeAgency]);

  // Cierra el dropdown al click afuera.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleSelect = (s: ClubSuggestion) => {
    onChange({
      club: s.name,
      clubPageId: s.id,
      clubPageSlug: s.slug,
      clubPageLogo: s.logoUrl ?? undefined,
    });
    setOpen(false);
  };

  const isLinked = !!selectedPageId && !!selectedPageSlug;

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          id={inputId}
          type="text"
          className={`shadow appearance-none border rounded w-full py-2 pl-9 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            isLinked ? "border-emerald-400" : "border-gray-300"
          }`}
          value={value}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          onChange={(e) => {
            onChange({
              club: e.target.value,
              clubPageId: undefined,
              clubPageSlug: undefined,
              clubPageLogo: undefined,
            });
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {isLinked && (
        <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
          <FaShieldAlt className="h-3 w-3" />
          Vinculado a la página oficial del club
        </div>
      )}

      {open && value.trim().length >= 2 && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-500">
              Buscando coincidencias...
            </div>
          )}
          {!loading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-500">
              No encontramos coincidencias. Vas a quedar con texto libre.
            </div>
          )}
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-emerald-50 transition-colors"
            >
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.logoUrl}
                  alt={s.name}
                  className="w-7 h-7 rounded object-cover bg-gray-100"
                />
              ) : (
                <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                  <FaShieldAlt className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {s.name}
                  </p>
                  {s.type && TYPE_LABELS[s.type] && (
                    <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      {TYPE_LABELS[s.type]}
                    </span>
                  )}
                </div>
                {s.country && (
                  <p className="text-xs text-gray-500 truncate">{s.country}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubAutocomplete;
