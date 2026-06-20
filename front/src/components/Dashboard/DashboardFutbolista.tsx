"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaEye, FaPaperPlane, FaStar } from "react-icons/fa";
import {
  type DashboardApplication,
  type DashNotification,
  getNotifications,
  getPlayerApplications,
} from "./dashboardFetch";
import {
  ApplicationRow,
  AvisosRecientes,
  DashboardHeader,
  HelpCards,
  SectionCard,
  StatCard,
} from "./DashboardShared";

export default function DashboardFutbolista({
  userId,
  name,
  token,
}: {
  userId: string;
  name?: string;
  token?: string;
}) {
  const [apps, setApps] = useState<DashboardApplication[]>([]);
  const [notifs, setNotifs] = useState<DashNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const [a, n] = await Promise.all([
        getPlayerApplications(userId),
        getNotifications(userId, token),
      ]);
      if (cancelled) return;
      setApps(a);
      setNotifs(n);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, token]);

  const activas = apps.filter((a) => a.status !== "REJECTED").length;
  const interesados = apps.filter((a) => a.status === "INTERESTED").length;
  const views = notifs.filter((n) => n.type === "PROFILE_VIEW").length;

  return (
    <div>
      <DashboardHeader name={name} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard
          value={loading ? "—" : activas}
          label="Postulaciones activas"
          icon={<FaPaperPlane />}
        />
        <StatCard
          value={loading ? "—" : views}
          label="Visitas al perfil"
          hint="últimos avisos"
          icon={<FaEye />}
        />
        <StatCard
          value={loading ? "—" : interesados}
          label="Interesados"
          icon={<FaStar />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="Postulaciones enviadas"
            action={
              <Link
                href="/jobs"
                className="text-xs font-medium text-verde-oscuro hover:underline"
              >
                Buscar ofertas
              </Link>
            }
          >
            {loading ? (
              <p className="py-4 text-sm text-gray-500">Cargando...</p>
            ) : apps.length === 0 ? (
              <p className="py-4 text-sm text-gray-500">
                Todavía no te postulaste a ninguna oferta.
              </p>
            ) : (
              apps
                .slice(0, 8)
                .map((a) => <ApplicationRow key={a.id} app={a} />)
            )}
          </SectionCard>
        </div>
        <div className="space-y-6">
          <AvisosRecientes notifications={notifs} loading={loading} />
          <HelpCards />
        </div>
      </div>
    </div>
  );
}
