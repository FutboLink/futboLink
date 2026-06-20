"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaShieldAlt } from "react-icons/fa";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";
import {
  formatearFecha,
  sortTrayectoriasByFechaDesc,
  type Trayectoria,
} from "@/helpers/sortAndFormatTrayectorias";

// Datos resueltos de la OrganizationPage del club, por slug. La trayectoria no
// guarda país ni liga, así que los resolvemos desde el endpoint de páginas.
interface ResolvedClub {
  country: string | null;
  leagueName: string | null;
  leagueLogo: string | null;
}

interface TrayectoriaTimelineProps {
  trayectorias: Trayectoria[];
  apiUrl: string;
  /** Texto del estado vacío (respeta i18n del caller). */
  emptyMessage: string;
  /** Etiqueta de la sección de la línea de tiempo (i18n del caller). */
  timelineLabel: string;
  /** Etiqueta "Presente" cuando no hay fecha de finalización. */
  presentLabel: string;
}

// Extrae el año de finalización (o inicio si está vigente) para el marcador.
function getYearMarker(t: Trayectoria): string {
  const fecha = t.fechaFinalizacion || t.fechaInicio;
  const match = fecha?.match(/^(\d{4})/);
  return match ? match[1] : "";
}

export default function TrayectoriaTimeline({
  trayectorias,
  apiUrl,
  emptyMessage,
  timelineLabel,
  presentLabel,
}: TrayectoriaTimelineProps) {
  const ordered = sortTrayectoriasByFechaDesc(trayectorias);
  const [resolved, setResolved] = useState<Record<string, ResolvedClub>>({});

  // Resolver país + liga de cada club linkeado, en PARALELO y deduplicando por
  // slug. Mismo endpoint que usa la card del "último club".
  useEffect(() => {
    const uniqueSlugs = Array.from(
      new Set(
        ordered
          .map((t) => t.clubPageSlug)
          .filter((s): s is string => Boolean(s)),
      ),
    );
    if (uniqueSlugs.length === 0 || !apiUrl) return;

    const controller = new AbortController();
    const run = async () => {
      const entries = await Promise.all(
        uniqueSlugs.map(async (slug): Promise<[string, ResolvedClub] | null> => {
          try {
            const res = await fetch(
              `${apiUrl}/organization-pages/slug/${slug}`,
              { signal: controller.signal },
            );
            if (!res.ok) return null;
            const data = await res.json();
            return [
              slug,
              {
                country: data?.country ?? null,
                leagueName: data?.league?.name ?? null,
                leagueLogo: data?.league?.logoUrl ?? null,
              },
            ];
          } catch (err) {
            if ((err as Error).name !== "AbortError") return null;
            return null;
          }
        }),
      );
      if (controller.signal.aborted) return;
      const map: Record<string, ResolvedClub> = {};
      for (const entry of entries) {
        if (entry) map[entry[0]] = entry[1];
      }
      setResolved(map);
    };
    run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, JSON.stringify(ordered.map((t) => t.clubPageSlug))]);

  if (ordered.length === 0) {
    return <p className="text-gray-600">{emptyMessage}</p>;
  }

  return (
    <div>
      {/* Encabezado de la sección de la línea de tiempo. */}
      <h4 className="text-sm font-semibold text-gray-700 mb-6">
        {timelineLabel}
      </h4>

      {/* Timeline. Línea central en md+; pegada a la izquierda en mobile. */}
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute top-0 bottom-0 left-4 md:left-1/2 md:-translate-x-1/2 w-0.5 bg-green-200" />

        <ul className="space-y-8 md:space-y-12">
          {ordered.map((t, index) => {
            const club = t.clubPageSlug
              ? resolved[t.clubPageSlug]
              : undefined;
            // Preferimos la liga y el país cargados por el usuario; si no, los
            // resolvemos desde la página del club (fallback histórico).
            const leagueName =
              t.liga || club?.leagueName || t.nivelCompetencia || "";
            const country =
              t.nacionalidadTrayectoria || club?.country || null;
            const isLeft = index % 2 === 0;
            const year = getYearMarker(t);

            return (
              <TimelineEntry
                key={`${t.club}-${index}`}
                index={index}
                isLeft={isLeft}
                year={year}
              >
                <article className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    {/* Logo del club */}
                    <div className="w-12 h-12 shrink-0 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                      {t.clubPageLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.clubPageLogo}
                          alt={t.club}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FaShieldAlt className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 break-words">
                        {t.clubPageSlug ? (
                          <Link
                            href={`/pages/${t.clubPageSlug}`}
                            className="text-green-700 hover:underline"
                          >
                            {t.club}
                          </Link>
                        ) : (
                          t.club
                        )}
                      </h4>

                      {/* Liga + país + división */}
                      <div className="mt-1 flex items-start gap-1.5 text-sm text-gray-600 min-w-0">
                        {country && (
                          <span className="shrink-0 inline-flex items-center">
                            {renderCountryFlag(country)}
                          </span>
                        )}
                        {club?.leagueLogo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={club.leagueLogo}
                            alt={leagueName}
                            className="w-4 h-4 object-contain shrink-0 mt-0.5"
                          />
                        )}
                        <span className="break-words">
                          {leagueName}
                          {t.categoriaEquipo ? ` | ${t.categoriaEquipo}` : ""}
                        </span>
                      </div>

                      {/* Rango de fechas */}
                      <p className="mt-1 text-xs text-gray-500">
                        {formatearFecha(t.fechaInicio)} -{" "}
                        {t.fechaFinalizacion
                          ? formatearFecha(t.fechaFinalizacion)
                          : presentLabel}
                      </p>
                    </div>
                  </div>
                </article>
              </TimelineEntry>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

interface TimelineEntryProps {
  index: number;
  isLeft: boolean;
  year: string;
  children: React.ReactNode;
}

// Entrada con nodo, marcador de año y animación de entrada al hacer scroll.
function TimelineEntry({ index, isLeft, year, children }: TimelineEntryProps) {
  const ref = useRef<HTMLLIElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // prefers-reduced-motion → mostrar de una, sin animación.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target); // animar una sola vez
          }
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // En desktop alternamos lados; en mobile todo a la derecha de la línea.
  const sideClasses = isLeft
    ? "md:pr-[calc(50%+2rem)] md:text-right"
    : "md:pl-[calc(50%+2rem)] md:ml-auto";

  // Dirección del slide según el lado (mobile siempre desde la derecha).
  const hiddenTransform = visible
    ? "translate-x-0"
    : isLeft
      ? "md:-translate-x-6 translate-x-6"
      : "translate-x-6";

  return (
    <li ref={ref} className={`relative pl-12 md:pl-0 ${sideClasses}`}>
      {/* Nodo sobre la línea */}
      <span className="absolute top-3 left-4 md:left-1/2 md:-translate-x-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-green-600 border-2 border-white shadow z-10" />

      {/* Marcador de año sobre la línea */}
      {year && (
        <span className="absolute -top-5 left-4 md:left-1/2 md:-translate-x-1/2 -translate-x-1/2 text-xs font-semibold text-green-700 bg-white px-1.5 z-10">
          {year}
        </span>
      )}

      <div
        className={`transition-all duration-500 ease-out ${hiddenTransform} ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: `${index * 80}ms` }}
      >
        {children}
      </div>
    </li>
  );
}
