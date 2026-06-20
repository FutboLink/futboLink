"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronRight, FaHeart, FaUsers } from "react-icons/fa";
import {
  type DashboardApplication,
  type DashboardJob,
  type DashNotification,
  getJobCandidates,
  getMyOffers,
  getNotifications,
  markInterest,
  markJobInReview,
  markProfileViewed,
  statusLabel,
  statusStyle,
} from "./dashboardFetch";
import {
  AvisosRecientes,
  DashboardHeader,
  SectionCard,
  SinRevisarBanner,
  StatCard,
} from "./DashboardShared";

const API = process.env.NEXT_PUBLIC_API_URL;

// Fila de candidato con acción "Me interesa" y link al perfil.
function CandidateRow({
  app,
  token,
  onInterest,
}: {
  app: DashboardApplication;
  token: string;
  onInterest: (id: string) => void;
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
          onClick={() => markProfileViewed(app.id, token)}
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
function OfferCard({
  job,
  count,
  token,
}: {
  job: DashboardJob;
  count: number;
  token: string;
}) {
  const [open, setOpen] = useState(false);
  const [cands, setCands] = useState<DashboardApplication[]>([]);
  const [loaded, setLoaded] = useState(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      // Al abrir la lista: marcamos "En revisión" y traemos los candidatos.
      await markJobInReview(job.id, token);
      const list = await getJobCandidates(job.id);
      setCands(list);
      setLoaded(true);
    }
  };

  const onInterest = async (appId: string) => {
    const ok = await markInterest(appId, token);
    if (ok) {
      setCands((prev) =>
        prev.map((c) => (c.id === appId ? { ...c, status: "INTERESTED" } : c)),
      );
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
          <p className="text-xs text-gray-500">{count} candidatos</p>
        </div>
        {open ? <FaChevronDown className="text-gray-400" /> : <FaChevronRight className="text-gray-400" />}
      </button>
      {open && (
        <div className="border-t border-gray-100 px-3 pb-2">
          {!loaded ? (
            <p className="py-3 text-sm text-gray-500">Cargando candidatos...</p>
          ) : cands.length === 0 ? (
            <p className="py-3 text-sm text-gray-500">
              Todavía no hay candidatos en esta oferta.
            </p>
          ) : (
            cands.map((c) => (
              <CandidateRow key={c.id} app={c} token={token} onInterest={onInterest} />
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
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [interested, setInterested] = useState(0);
  const [sinRevisar, setSinRevisar] = useState(0);
  const [notifs, setNotifs] = useState<DashNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      const [myOffers, n] = await Promise.all([
        getMyOffers(token),
        getNotifications(userId, token),
      ]);
      if (cancelled) return;
      setOffers(myOffers);
      setNotifs(n);
      // Conteo de candidatos por oferta (GET sin efectos secundarios).
      const lists = await Promise.all(
        myOffers.map((o) => getJobCandidates(o.id)),
      );
      if (cancelled) return;
      const c: Record<string, number> = {};
      let totalInterested = 0;
      let totalSinRevisar = 0;
      myOffers.forEach((o, i) => {
        c[o.id] = lists[i].length;
        totalInterested += lists[i].filter((a) => a.status === "INTERESTED").length;
        // "Sin revisar" = postulaciones todavía en PENDING (o sin estado).
        totalSinRevisar += lists[i].filter(
          (a) => !a.status || a.status === "PENDING",
        ).length;
      });
      setCounts(c);
      setInterested(totalInterested);
      setSinRevisar(totalSinRevisar);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, userId]);

  const totalCandidatos = Object.values(counts).reduce((a, b) => a + b, 0);

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

      <div className={hideHeader ? "" : "mt-6"}>
        <SectionCard
          title="Mis ofertas publicadas"
          action={
            <Link
              href={`/user-viewer/${userId}?tab=createOffer`}
              className="text-xs font-medium text-verde-oscuro hover:underline"
            >
              Crear oferta
            </Link>
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
                <OfferCard key={o.id} job={o} count={counts[o.id] ?? 0} token={token} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {!hideHeader && (
        <div className="mt-6">
          <AvisosRecientes notifications={notifs} loading={loading} />
        </div>
      )}
    </div>
  );
}
