// Helpers de fetch para el panel de usuarios (módulo 3 / dashboard).
// Reutilizan los endpoints del módulo de Applications/Jobs/Notifications.

const API = process.env.NEXT_PUBLIC_API_URL;

export interface DashboardJob {
  id: string;
  title: string;
  location?: string;
  status?: string;
  imgUrl?: string;
  createdAt?: string;
}

export interface DashboardApplication {
  id: string;
  status: string;
  appliedAt: string;
  message?: string;
  job?: DashboardJob;
  player?: {
    id: string;
    name?: string;
    lastname?: string;
    email?: string;
    imgUrl?: string;
    role?: string;
  };
}

// Etiqueta visible del estado para el lado del candidato.
export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Postulación enviada",
  IN_REVIEW: "En revisión",
  PROFILE_VIEWED: "Perfil visto",
  INTERESTED: "Interés",
  // Legacy / internos:
  SHORTLISTED: "Preseleccionado",
  ACCEPTED: "Aceptado",
  REJECTED: "Oferta cerrada",
};

export const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-blue-100 text-blue-700",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  PROFILE_VIEWED: "bg-indigo-100 text-indigo-700",
  INTERESTED: "bg-emerald-100 text-emerald-700",
  SHORTLISTED: "bg-emerald-100 text-emerald-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-gray-100 text-gray-500",
};

export function statusLabel(status?: string): string {
  if (!status) return STATUS_LABELS.PENDING;
  return STATUS_LABELS[status] ?? status;
}

export function statusStyle(status?: string): string {
  if (!status) return STATUS_STYLES.PENDING;
  return STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600";
}

// Perfil completo del usuario (para la barra de % de perfil del panel).
export async function getUserProfile(
  userId: string,
  token?: string,
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${API}/user/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface DashNotification {
  id: string;
  message: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
  metadata?: {
    jobId?: string;
    jobTitle?: string;
    jobImgUrl?: string;
    [k: string]: unknown;
  };
}

// Avisos (notificaciones) del usuario, más recientes primero. Requiere token.
export async function getNotifications(
  userId: string,
  token?: string,
): Promise<DashNotification[]> {
  try {
    const res = await fetch(`${API}/notifications/user/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    return list as DashNotification[];
  } catch {
    return [];
  }
}

// Tiempo relativo simple en español ("hace 3 h", "hace 2 d").
export function timeAgo(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const min = Math.floor(ms / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString("es-AR");
}

// Postulaciones de un jugador (las que hizo él, o las que le hizo su agente).
export async function getPlayerApplications(
  playerId: string,
): Promise<DashboardApplication[]> {
  try {
    const res = await fetch(`${API}/applications/player/${playerId}`);
    if (!res.ok) return [];
    return (await res.json()) as DashboardApplication[];
  } catch {
    return [];
  }
}

// Postulaciones que hizo el agente/reclutador por jugadores de su cartera.
export async function getRecruiterApplications(
  recruiterId: string,
): Promise<DashboardApplication[]> {
  try {
    const res = await fetch(`${API}/applications/recruiter/${recruiterId}`);
    if (!res.ok) return [];
    return (await res.json()) as DashboardApplication[];
  } catch {
    return [];
  }
}

// Jugadores del portafolio del agente/reclutador (requiere token).
export async function getPortfolio(
  userId: string,
  token: string,
): Promise<
  Array<{ id: string; name?: string; lastname?: string; imgUrl?: string }>
> {
  try {
    const res = await fetch(`${API}/user/${userId}/portfolio`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.portfolioPlayers ?? data?.data ?? []);
  } catch {
    return [];
  }
}

// Mis ofertas publicadas (requiere token). Devuelve { data, total, ... }.
export async function getMyOffers(token: string): Promise<DashboardJob[]> {
  try {
    const res = await fetch(`${API}/jobs/my?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data ?? []);
  } catch {
    return [];
  }
}

// Candidatos de una oferta. Al traerlos, marca a los PENDING como "En revisión".
export async function getJobCandidates(
  jobId: string,
): Promise<DashboardApplication[]> {
  try {
    const res = await fetch(`${API}/applications/jobs/${jobId}`);
    if (!res.ok) return [];
    return (await res.json()) as DashboardApplication[];
  } catch {
    return [];
  }
}

// Dispara "En revisión" para todos los candidatos de la oferta (al abrir la lista).
export async function markJobInReview(
  jobId: string,
  token: string,
): Promise<void> {
  try {
    await fetch(`${API}/applications/jobs/${jobId}/review`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    /* best-effort */
  }
}

// "Perfil visto" al abrir el perfil de un candidato.
export async function markProfileViewed(
  applicationId: string,
  token: string,
): Promise<void> {
  try {
    await fetch(`${API}/applications/${applicationId}/profile-viewed`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    /* best-effort */
  }
}

// Botón "Me interesa" sobre un candidato.
export async function markInterest(
  applicationId: string,
  token: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API}/applications/${applicationId}/interest`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
