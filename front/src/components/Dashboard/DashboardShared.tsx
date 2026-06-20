"use client";

import Link from "next/link";
import { useState } from "react";
import { FaBell, FaShieldAlt, FaTimes, FaTrophy } from "react-icons/fa";
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
  scroll = false,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  // Si es true, el cuerpo tiene alto máximo y scrollea adentro (no estira la página).
  scroll?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {action}
      </div>
      <div className={scroll ? "max-h-80 overflow-y-auto pr-1" : ""}>
        {children}
      </div>
    </div>
  );
}

// Fila de una postulación (logo de la oferta + título + estado).
// Clickeable: lleva al detalle de la oferta (/jobs/:id).
export function ApplicationRow({ app }: { app: DashboardApplication }) {
  const job = app.job;
  const row = (
    <div className="flex items-center gap-3 py-2.5">
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
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {job?.id ? (
        <Link
          href={`/jobs/${job.id}`}
          className="block rounded-lg px-1 transition-colors hover:bg-gray-50"
        >
          {row}
        </Link>
      ) : (
        row
      )}
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
    <SectionCard title="Avisos recientes" scroll>
      {loading ? (
        <p className="py-3 text-sm text-gray-500">Cargando...</p>
      ) : notifications.length === 0 ? (
        <p className="py-3 text-sm text-gray-500">Todavía no tenés avisos.</p>
      ) : (
        notifications.slice(0, 30).map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-2.5 border-b border-gray-100 py-2.5 last:border-b-0"
          >
            {/* Logo de la oferta si está; si no, la campanita. (Genérico: nunca
                mostramos quién vio el perfil, solo la oferta.) */}
            {n.metadata?.jobImgUrl ? (
              <div className="mt-0.5 h-6 w-6 shrink-0 overflow-hidden rounded bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={n.metadata.jobImgUrl}
                  alt={n.metadata.jobTitle ?? "Oferta"}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <span className="mt-0.5 text-verde-oscuro">
                <FaBell className="h-3.5 w-3.5" />
              </span>
            )}
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
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white px-4 py-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <FaBell className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-amber-900">
          {count} candidato{count === 1 ? "" : "s"} sin revisar
        </p>
        <p className="text-xs text-amber-700/80">
          Abrí tus ofertas para revisar a los nuevos postulantes.
        </p>
      </div>
    </div>
  );
}

// Card del plan/suscripción (respeta el diseño del mockup).
export function PlanCard({
  subscriptionType,
  expiresAt,
}: {
  subscriptionType?: string;
  expiresAt?: string | null;
}) {
  const plan = subscriptionType || "Amateur";
  const activo = plan !== "Amateur" && plan !== "";
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
      <FaTrophy className="mx-auto h-8 w-8 text-amber-500" />
      <p className="mt-2 font-bold text-gray-800">Plan {plan}</p>
      <div className="mt-3 space-y-1 text-left text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Estado</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              activo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {activo ? "Activo" : "Inactivo"}
          </span>
        </div>
        {expiresAt && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Vence el</span>
            <span className="font-medium text-gray-700">
              {new Date(expiresAt).toLocaleDateString("es-AR")}
            </span>
          </div>
        )}
      </div>
      <Link
        href="/Subs"
        className="mt-3 block rounded bg-verde-oscuro py-2 text-sm font-medium text-white hover:bg-[#143a1b]"
      >
        Mejorar plan
      </Link>
    </div>
  );
}

// Modal simple que explica cómo funcionan las postulaciones (candidato + reclutador).
export function GuiaModal({ onClose }: { onClose: () => void }) {
  const pasosCandidato = [
    ["Te postulás", 'La oferta queda como "Postulación enviada".'],
    ["En revisión", "Cuando el ofertante entra a ver los candidatos."],
    ["Perfil visto", "Cuando el ofertante abre tu perfil."],
    ["Interés", 'Cuando te marca "Me interesa".'],
  ];
  const pasosReclutador = [
    ["Publicás tu oferta", "Los jugadores se postulan y te llega un aviso."],
    ["Ves a los candidatos", 'Al abrir la lista, pasan a "En revisión".'],
    ["Abrís un perfil", 'El candidato lo ve como "Perfil visto".'],
    ["Marcás interés", 'Tocás "Me interesa" en los que te gustan.'],
  ];
  const Col = ({ titulo, pasos }: { titulo: string; pasos: string[][] }) => (
    <div className="flex-1">
      <h4 className="mb-2 font-semibold text-verde-oscuro">{titulo}</h4>
      <ol className="space-y-2">
        {pasos.map(([t, d], i) => (
          <li key={t} className="flex gap-2 text-sm">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-verde-oscuro text-xs font-bold text-white">
              {i + 1}
            </span>
            <span>
              <b className="text-gray-800">{t}.</b>{" "}
              <span className="text-gray-600">{d}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            ¿Cómo funcionan las postulaciones?
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>
        <div className="flex flex-col gap-6 md:flex-row">
          <Col titulo="Si sos candidato" pasos={pasosCandidato} />
          <div className="hidden w-px bg-gray-200 md:block" />
          <Col titulo="Si publicás ofertas" pasos={pasosReclutador} />
        </div>
        <p className="mt-5 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          En cada paso recibís un aviso. Podés seguir el estado de tus
          postulaciones desde este panel.
        </p>
      </div>
    </div>
  );
}

// Tarjetas de ayuda estáticas (texto fijo; editarlas queda para más adelante).
export function HelpCards() {
  const [guiaOpen, setGuiaOpen] = useState(false);
  return (
    <div className="space-y-4">
      {guiaOpen && <GuiaModal onClose={() => setGuiaOpen(false)} />}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <h4 className="text-sm font-semibold text-gray-800">
          ¿Cómo funciona FutboLink?
        </h4>
        <p className="mt-1 text-xs text-gray-600">
          Descubrí cómo funcionan las postulaciones.
        </p>
        <button
          type="button"
          onClick={() => setGuiaOpen(true)}
          className="mt-2 inline-block rounded border border-blue-300 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          Ver guía completa
        </button>
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
