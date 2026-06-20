"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaEye, FaPaperPlane, FaStar } from "react-icons/fa";
import {
  type DashboardApplication,
  getPlayerApplications,
} from "./dashboardFetch";
import {
  ApplicationRow,
  DashboardHeader,
  HelpCards,
  SectionCard,
  StatCard,
} from "./DashboardShared";

const API = process.env.NEXT_PUBLIC_API_URL;

// Cuenta las notificaciones de tipo PROFILE_VIEW del usuario (visitas al perfil).
// El endpoint requiere auth, así que mandamos el token si lo tenemos.
async function getProfileViews(userId: string, token?: string): Promise<number> {
  try {
    const res = await fetch(`${API}/notifications/user/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) return 0;
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    return list.filter((n: { type?: string }) => n.type === "PROFILE_VIEW")
      .length;
  } catch {
    return 0;
  }
}

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
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const [a, v] = await Promise.all([
        getPlayerApplications(userId),
        getProfileViews(userId, token),
      ]);
      if (cancelled) return;
      setApps(a);
      setViews(v);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, token]);

  const activas = apps.filter((a) => a.status !== "REJECTED").length;
  const interesados = apps.filter((a) => a.status === "INTERESTED").length;

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
                href="/player-search"
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
        <HelpCards />
      </div>
    </div>
  );
}
