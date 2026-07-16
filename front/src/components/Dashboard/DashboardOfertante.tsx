"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaHeart,
  FaSync,
  FaUsers,
} from "react-icons/fa";
import type { IProfileData } from "@/Interfaces/IUser";
import ProfileProgressBar from "@/components/ProfileUser/ProfileProgressBar";
import {
  type DashboardApplication,
  type DashboardJob,
  type DashNotification,
  getJobCandidates,
  getMyDashboard,
  getNotifications,
  getUserProfile,
  markInterest,
  markJobInReview,
  promoteStatus,
  statusLabel,
  statusStyle,
} from "./dashboardFetch";
import {
  AvisosRecientes,
  DashboardHeader,
  HelpCards,
  PlanCard,
  SectionCard,
  SinRevisarBanner,
  StatCard,
} from "./DashboardShared";

const API = process.env.NEXT_PUBLIC_API_URL;

// Igualdad "de UI" entre dos mapas de candidatos: mismas ofertas, mismos
// candidatos (id) y mismo estado (lo único que muta y que la UI pinta). Sirve
// para bailar el re-render en la revalidación silenciosa si nada cambió (evita
// recargar avatares / flash). No compara nombre/foto (rara vez cambian).
function sameCandsByJob(
  a: Record<string, DashboardApplication[]>,
  b: Record<string, DashboardApplication[]>,
): boolean {
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) return false;
  for (const k of aKeys) {
    const la = a[k];
    const lb = b[k];
    if (!lb || la.length !== lb.length) return false;
    for (let i = 0; i < la.length; i++) {
      if (la[i].id !== lb[i].id || la[i].status !== lb[i].status) return false;
    }
  }
  return true;
}

// Igualdad de la lista de ofertas para el mismo bail-out (id/título/imagen).
function sameOffers(a: DashboardJob[], b: DashboardJob[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].id !== b[i].id ||
      a[i].title !== b[i].title ||
      a[i].imgUrl !== b[i].imgUrl
    ) {
      return false;
    }
  }
  return true;
}

// Aplica `fn` a cada candidato de todas las ofertas (map inmutable por jobId).
function mapCands(
  byJob: Record<string, DashboardApplication[]>,
  fn: (c: DashboardApplication) => DashboardApplication,
): Record<string, DashboardApplication[]> {
  const next: Record<string, DashboardApplication[]> = {};
  for (const [jobId, list] of Object.entries(byJob)) {
    next[jobId] = list.map(fn);
  }
  return next;
}

// Fila de candidato con acción "Me interesa" y link al perfil.
function CandidateRow({
  app,
  onInterest,
  onView,
}: {
  app: DashboardApplication;
  onInterest: (appId: string) => void;
  onView: (playerId: string) => void;
}) {
  const p = app.player;
  const fullName = `${p?.name ?? ""} ${p?.lastname ?? ""}`.trim() || "Candidato";
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-b-0">
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100">
        {p?.imgUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imgUrl} alt={fullName} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">{fullName}</p>
        <span
          className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyle(
            app.status,
          )}`}
        >
          {statusLabel(app.status)}
        </span>
      </div>
      {p?.id && (
        <Link
          href={`/user-viewer/${p.id}`}
          // Solo refresco optimista local de la UI. El marcado real en el back
          // lo hace el mount effect de /user-viewer (cubre clic izquierdo, clic
          // central y nueva pestaña), así evitamos la doble llamada de red.
          onClick={() => onView(p.id)}
          className="shrink-0 rounded border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          Ver perfil
        </Link>
      )}
      <button
        type="button"
        onClick={() => onInterest(app.id)}
        disabled={app.status === "INTERESTED"}
        className={`flex shrink-0 items-center gap-1 rounded px-2.5 py-1 text-xs font-medium ${
          app.status === "INTERESTED"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-verde-oscuro text-white hover:bg-[#143a1b]"
        }`}
      >
        <FaHeart className="h-3 w-3" /> Me interesa
      </button>
    </div>
  );
}

// Tarjeta de una oferta publicada, expandible para ver/gestionar candidatos.
// Controlada por el padre: los candidatos (`cands`) y su estado viven arriba
// (fuente única de verdad) para que StatCards/banner y todas las cards del
// mismo jugador queden sincronizados sin recargar.
function OfferCard({
  job,
  cands,
  onOpen,
  onInterest,
  onView,
}: {
  job: DashboardJob;
  cands: DashboardApplication[];
  onOpen: (jobId: string) => void;
  onInterest: (appId: string) => void;
  onView: (playerId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // Al abrir por primera vez: el padre marca "En revisión" (back + optimista).
    if (next && !reviewed) {
      setReviewed(true);
      onOpen(job.id);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-gray-100">
          {job.imgUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.imgUrl} alt={job.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-800">{job.title}</p>
          <p className="text-xs text-gray-500">{cands.length} candidatos</p>
        </div>
        {open ? <FaChevronDown className="text-gray-400" /> : <FaChevronRight className="text-gray-400" />}
      </button>
      {open && (
        <div className="border-t border-gray-100 px-3 pb-2">
          {cands.length === 0 ? (
            <p className="py-3 text-sm text-gray-500">
              Todavía no hay candidatos en esta oferta.
            </p>
          ) : (
            cands.map((c) => (
              <CandidateRow
                key={c.id}
                app={c}
                onInterest={onInterest}
                onView={onView}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardOfertante({
  userId,
  name,
  token,
  hideHeader = false,
}: {
  userId: string;
  name?: string;
  token: string;
  // Cuando se reutiliza dentro del panel del Agente, ocultamos el encabezado y
  // las tarjetas de resumen (el agente ya tiene los suyos).
  hideHeader?: boolean;
}) {
  const [offers, setOffers] = useState<DashboardJob[]>([]);
  // Fuente única de verdad: candidatos por oferta. StatCards, banner y las
  // cards se derivan de acá, así los optimistic updates se reflejan sin reload.
  const [candsByJob, setCandsByJob] = useState<
    Record<string, DashboardApplication[]>
  >({});
  const [notifs, setNotifs] = useState<DashNotification[]>([]);
  const [profile, setProfile] = useState<IProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  // Timestamp (ms) del último fetch de candidatos, para throttlear la
  // revalidación por foco/visibilidad y no spamear el back.
  const lastCandsFetchRef = useRef(0);
  // Timestamp (ms) de la última mutación optimista (onView/onInterest/onOpen).
  // Si es reciente, saltamos la revalidación para no pisar el optimista con
  // data del back que quizás todavía no reflejó el cambio (ej. el marcado de
  // "Visto" lo hace la pestaña del perfil y puede no haber llegado aún).
  const lastMutationRef = useRef(0);
  // Estado del botón manual "Actualizar": ícono girando + disabled mientras
  // corre. NO blanquea la vista (la lista actual queda en pantalla).
  const [refreshing, setRefreshing] = useState(false);

  // Trae ofertas + candidatos por oferta (GET sin efectos secundarios). Es la
  // fuente de verdad y se reutiliza tanto en el mount como en la revalidación
  // (visibilitychange/focus), sin duplicar la lógica de armado del mapa.
  const fetchOffersAndCands = async (): Promise<{
    offers: DashboardJob[];
    byJob: Record<string, DashboardApplication[]>;
  }> => {
    // UN solo request al endpoint consolidado (antes: getMyOffers + N
    // getJobCandidates). El back lo resuelve con una única query SQL.
    const { offers, candidatesByJob } = await getMyDashboard(token);
    lastCandsFetchRef.current = Date.now();
    return { offers, byJob: candidatesByJob };
  };

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      const [n, pr] = await Promise.all([
        getNotifications(userId, token),
        getUserProfile(userId, token),
      ]);
      if (cancelled) return;
      setProfile(pr as IProfileData | null);
      setNotifs(n);
      // Semilla del estado: ofertas + candidatos por oferta.
      const { offers: myOffers, byJob } = await fetchOffersAndCands();
      if (cancelled) return;
      setOffers(myOffers);
      setCandsByJob(byJob);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, userId]);

  // Revalidación al volver a la pestaña: cuando el ofertante abre un perfil en
  // otra pestaña, el back marca "Visto" pero este dashboard quedaría con el
  // estado viejo. Al recuperar visibilidad/foco refetcheamos los candidatos
  // (fuente de verdad → StatCards, banner y badges se actualizan solos).
  // Throttle de 12s para no refetchear si el usuario alterna pestañas rápido.
  useEffect(() => {
    if (!token) return;
    const THROTTLE_MS = 12_000;
    const MUTATION_GRACE_MS = 8_000;
    const revalidate = async () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastCandsFetchRef.current < THROTTLE_MS) return;
      // No pisar un optimista recién aplicado con data que el back quizás aún
      // no reflejó (evita revertir "Visto"/"Me interesa" y su flash).
      if (Date.now() - lastMutationRef.current < MUTATION_GRACE_MS) return;
      const { offers: myOffers, byJob } = await fetchOffersAndCands();
      // Merge suave: si nada cambió, devolvemos el mismo ref → React bailea el
      // re-render (sin recargar avatares ni tocar el DOM). Solo reemplazamos
      // cuando de verdad cambió algo. El estado local de las OfferCards (open/
      // reviewed) sobrevive porque la key es el jobId (no se remontan).
      setOffers((prev) => (sameOffers(prev, myOffers) ? prev : myOffers));
      setCandsByJob((prev) => (sameCandsByJob(prev, byJob) ? prev : byJob));
    };
    document.addEventListener("visibilitychange", revalidate);
    window.addEventListener("focus", revalidate);
    return () => {
      document.removeEventListener("visibilitychange", revalidate);
      window.removeEventListener("focus", revalidate);
    };
  }, [token, userId]);

  // Al abrir una oferta: optimista IN_REVIEW inmediato + PATCH al back + resync
  // con la fuente de verdad (refetch de esa oferta).
  const onOpenJob = async (jobId: string) => {
    lastMutationRef.current = Date.now();
    setCandsByJob((prev) => ({
      ...prev,
      [jobId]: (prev[jobId] ?? []).map((c) => ({
        ...c,
        status: promoteStatus(c.status, "IN_REVIEW"),
      })),
    }));
    await markJobInReview(jobId, token);
    const fresh = await getJobCandidates(jobId);
    setCandsByJob((prev) => ({ ...prev, [jobId]: fresh }));
  };

  // "Me interesa": aplica el optimista solo si el PATCH devolvió OK.
  const onInterest = async (appId: string) => {
    const ok = await markInterest(appId, token);
    if (!ok) return;
    lastMutationRef.current = Date.now();
    setCandsByJob((prev) =>
      mapCands(prev, (c) =>
        c.id === appId ? { ...c, status: "INTERESTED" } : c,
      ),
    );
  };

  // "Perfil visto": optimista local que promueve PROFILE_VIEWED en TODAS las
  // postulaciones de ese jugador (puede estar en varias ofertas → todas las
  // cards se sincronizan). El marcado real en el back lo hace el mount effect
  // de /user-viewer. promoteStatus respeta la escalera (no pisa INTERESTED).
  const onView = (playerId: string) => {
    lastMutationRef.current = Date.now();
    setCandsByJob((prev) =>
      mapCands(prev, (c) =>
        c.player?.id === playerId
          ? { ...c, status: promoteStatus(c.status, "PROFILE_VIEWED") }
          : c,
      ),
    );
  };

  // Botón manual "Actualizar": refetch inmediato del endpoint consolidado,
  // IGNORANDO el throttle de 12s (el usuario lo aprieta a propósito). El
  // `refreshing` hace de debounce contra doble-click. Reusa el mismo bail-out de
  // igualdad que la auto-revalidación: si nada cambió, mismo ref → sin re-render
  // (no recarga avatares ni resetea acordeones/scroll; la key jobId conserva el
  // estado open/reviewed de cada OfferCard). El fetch trae el estado ya
  // persistido en el back, así que no pisa optimistas previos.
  const onRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const { offers: myOffers, byJob } = await fetchOffersAndCands();
      setOffers((prev) => (sameOffers(prev, myOffers) ? prev : myOffers));
      setCandsByJob((prev) => (sameCandsByJob(prev, byJob) ? prev : byJob));
    } finally {
      setRefreshing(false);
    }
  };

  // Conteos derivados de la fuente de verdad (se recalculan en cada render).
  const allCands = Object.values(candsByJob).flat();
  const totalCandidatos = allCands.length;
  const interested = allCands.filter((a) => a.status === "INTERESTED").length;
  const sinRevisar = allCands.filter(
    (a) => !a.status || a.status === "PENDING",
  ).length;

  return (
    <div>
      {!hideHeader && (
        <>
          <DashboardHeader name={name} />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatCard
              value={loading ? "—" : offers.length}
              label="Ofertas activas"
              icon={<FaUsers />}
            />
            <StatCard
              value={loading ? "—" : totalCandidatos}
              label="Candidatos recibidos"
            />
            <StatCard value={loading ? "—" : interested} label="Interesados" />
          </div>
        </>
      )}

      {!loading && <SinRevisarBanner count={sinRevisar} />}

      {(() => {
        const offersSection = (
          <SectionCard
            title="Mis ofertas publicadas"
            scroll
            action={
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={refreshing || loading}
                  className="flex items-center gap-1.5 text-xs font-medium text-verde-oscuro hover:underline disabled:opacity-60"
                >
                  <FaSync
                    className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Actualizar
                </button>
                <Link
                  href={`/user-viewer/${userId}?tab=createOffer`}
                  className="text-xs font-medium text-verde-oscuro hover:underline"
                >
                  Crear oferta
                </Link>
              </div>
            }
          >
            {loading ? (
              <p className="py-4 text-sm text-gray-500">Cargando...</p>
            ) : offers.length === 0 ? (
              <p className="py-4 text-sm text-gray-500">
                Todavía no publicaste ofertas.
              </p>
            ) : (
              <div className="space-y-2">
                {offers.map((o) => (
                  <OfferCard
                    key={o.id}
                    job={o}
                    cands={candsByJob[o.id] ?? []}
                    onOpen={onOpenJob}
                    onInterest={onInterest}
                    onView={onView}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        );

        // Reusado dentro del Agente: solo las ofertas (sin columna derecha).
        if (hideHeader) return offersSection;

        return (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {offersSection}
              <AvisosRecientes notifications={notifs} loading={loading} />
            </div>
            <div className="space-y-6">
              <PlanCard
                subscriptionType={profile?.subscriptionType}
                expiresAt={
                  (profile as { subscriptionExpiresAt?: string | null })
                    ?.subscriptionExpiresAt
                }
              />
              <HelpCards />
              {profile && <ProfileProgressBar profile={profile} />}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
