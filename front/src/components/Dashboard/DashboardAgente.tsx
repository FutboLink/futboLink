"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import type { IProfileData } from "@/Interfaces/IUser";
import ProfileProgressBar from "@/components/ProfileUser/ProfileProgressBar";
import {
  type DashboardApplication,
  type DashNotification,
  getMyDashboard,
  getNotifications,
  getPortfolio,
  getRecruiterApplications,
  getUserProfile,
} from "./dashboardFetch";
import DashboardOfertante from "./DashboardOfertante";
import {
  ApplicationRow,
  AvisosRecientes,
  DashboardHeader,
  HelpCards,
  PlanCard,
  SectionCard,
  StatCard,
} from "./DashboardShared";

type Tab = "ofertas" | "postulaciones" | "portafolio";

type PortfolioPlayer = {
  id: string;
  name?: string;
  lastname?: string;
  imgUrl?: string;
};

export default function DashboardAgente({
  userId,
  name,
  token,
}: {
  userId: string;
  name?: string;
  token: string;
}) {
  const [tab, setTab] = useState<Tab>("ofertas");
  const [apps, setApps] = useState<DashboardApplication[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioPlayer[]>([]);
  const [offersCount, setOffersCount] = useState(0);
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [notifs, setNotifs] = useState<DashNotification[]>([]);
  const [profile, setProfile] = useState<IProfileData | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const [a, p, dash, n, pr] = await Promise.all([
        getRecruiterApplications(userId),
        getPortfolio(userId, token),
        // UN solo request: ofertas + candidatos (antes: getMyOffers + N
        // getJobCandidates solo para los conteos).
        getMyDashboard(token),
        getNotifications(userId, token),
        getUserProfile(userId, token),
      ]);
      if (cancelled) return;
      setApps(a);
      setPortfolio(p);
      setOffersCount(dash.offers.length);
      setNotifs(n);
      setProfile(pr as IProfileData | null);
      // Conteo total de candidatos de las ofertas del agente.
      setCandidatesCount(
        Object.values(dash.candidatesByJob).reduce(
          (acc, l) => acc + l.length,
          0,
        ),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, token]);

  const tabBtn = (id: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`rounded-full px-4 py-1.5 text-sm font-medium ${
        tab === id
          ? "bg-verde-oscuro text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <DashboardHeader name={name} />

      <div className="grid grid-cols-3 gap-4">
        <StatCard value={apps.length} label="Mis postulaciones" />
        <StatCard value={offersCount} label="Ofertas activas" icon={<FaUsers />} />
        <StatCard value={candidatesCount} label="Candidatos recibidos" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
       <div className="lg:col-span-2">
        <div className="flex flex-wrap gap-2">
          {tabBtn("ofertas", "Mis ofertas")}
          {tabBtn("postulaciones", "Mis postulaciones")}
          {tabBtn("portafolio", "Mi portafolio")}
        </div>

      <div className="mt-4">
        {tab === "ofertas" && (
          // Reutiliza el panel del ofertante (mis ofertas + gestión de candidatos).
          <DashboardOfertante userId={userId} name={undefined} token={token} hideHeader />
        )}

        {tab === "postulaciones" && (
          <SectionCard title="Postulaciones que hice por mi cartera" scroll>
            {apps.length === 0 ? (
              <p className="py-4 text-sm text-gray-500">
                Todavía no postulaste jugadores de tu cartera.
              </p>
            ) : (
              apps.map((a) => <ApplicationRow key={a.id} app={a} />)
            )}
          </SectionCard>
        )}

        {tab === "portafolio" && (
          <SectionCard
            title="Mi portafolio"
            scroll
            action={
              <Link
                href={`/user-viewer/${userId}?tab=portfolio`}
                className="text-xs font-medium text-verde-oscuro hover:underline"
              >
                Ver todo
              </Link>
            }
          >
            {portfolio.length === 0 ? (
              <p className="py-4 text-sm text-gray-500">
                Tu portafolio está vacío.
              </p>
            ) : (
              portfolio.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-b-0"
                >
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100">
                    {p.imgUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imgUrl} alt={p.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <p className="flex-1 truncate text-sm font-medium text-gray-800">
                    {`${p.name ?? ""} ${p.lastname ?? ""}`.trim() || "Jugador"}
                  </p>
                  <Link
                    href={`/user-viewer/${p.id}`}
                    className="rounded border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Ver perfil
                  </Link>
                </div>
              ))
            )}
          </SectionCard>
        )}
      </div>

        <div className="mt-6">
          <AvisosRecientes notifications={notifs} loading={false} />
        </div>
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
    </div>
  );
}
