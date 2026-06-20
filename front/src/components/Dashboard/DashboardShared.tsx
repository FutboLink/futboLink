"use client";

import Link from "next/link";
import { FaBell, FaShieldAlt } from "react-icons/fa";
import {
  type DashboardApplication,
  type DashNotification,
  statusLabel,
  statusStyle,
  timeAgo,
} from "./dashboardFetch";

// Tarjeta de número del resumen (postulaciones, visitas, interesados, etc.).
export function StatCard({
  value,
  label,
  hint,
  icon,
}: {
  value: number | string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        {icon && <span className="text-verde-oscuro">{icon}</span>}
      </div>
      <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// Contenedor de sección con título y "Ver todas".
export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// Fila de una postulación (logo de la oferta + título + estado).
export function ApplicationRow({ app }: { app: DashboardApplication }) {
  const job = app.job;
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-b-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
        {job?.imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.imgUrl}
            alt={job.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <FaShieldAlt className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">
          {job?.title ?? "Oferta"}
        </p>
        {job?.location && (
          <p className="truncate text-xs text-gray-500">{job.location}</p>
        )}
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(
          app.status,
        )}`}
      >
        {statusLabel(app.status)}
      </span>
    </div>
  );
}

// Feed de avisos recientes del proceso (lee las notificaciones del usuario).
export function AvisosRecientes({
  notifications,
  loading,
}: {
  notifications: DashNotification[];
  loading?: boolean;
}) {
  return (
    <SectionCard title="Avisos recientes">
      {loading ? (
        <p className="py-3 text-sm text-gray-500">Cargando...</p>
      ) : notifications.length === 0 ? (
        <p className="py-3 text-sm text-gray-500">Todavía no tenés avisos.</p>
      ) : (
        notifications.slice(0, 6).map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-2.5 border-b border-gray-100 py-2.5 last:border-b-0"
          >
            <span className="mt-0.5 text-verde-oscuro">
              <FaBell className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700">{n.message}</p>
              <p className="text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
            </div>
          </div>
        ))
      )}
    </SectionCard>
  );
}

// Banner de candidatos sin revisar (para el ofertante/agente).
export function SinRevisarBanner({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <FaBell className="h-4 w-4 shrink-0" />
      Tenés <b>{count}</b> candidato{count === 1 ? "" : "s"} sin revisar.
    </div>
  );
}

// Tarjetas de ayuda estáticas (texto fijo; editarlas queda para más adelante).
export function HelpCards() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <h4 className="text-sm font-semibold text-gray-800">
          ¿Cómo funciona FutboLink?
        </h4>
        <p className="mt-1 text-xs text-gray-600">
          Descubrí cómo potenciar tu carrera profesional.
        </p>
        <Link
          href="/Subs"
          className="mt-2 inline-block rounded border border-blue-300 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          Ver guía completa
        </Link>
      </div>
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
        <h4 className="text-sm font-semibold text-gray-800">💡 Consejos</h4>
        <p className="mt-1 text-xs text-gray-600">
          Completá tu perfil y mantenelo siempre actualizado para que clubes y
          agencias te puedan reconocer fácilmente.
        </p>
      </div>
    </div>
  );
}

// Encabezado de bienvenida del panel.
export function DashboardHeader({ name }: { name?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Bienvenido{name ? `, ${name}` : ""}!
      </h1>
      <p className="text-gray-500">
        Acá tenés un resumen de la actividad de tu perfil
      </p>
    </div>
  );
}
