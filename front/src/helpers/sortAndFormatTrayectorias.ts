export interface Trayectoria {
  club: string;
  logros?: string;
  fechaInicio: string;
  fechaFinalizacion?: string | null;
  categoriaEquipo: string;
  nivelCompetencia: string;
  nacionalidadTrayectoria?: string;
  // 1F: si el club fue elegido del autocomplete de páginas, guardamos
  // el id+slug para linkear desde la trayectoria al perfil del club.
  clubPageId?: string;
  clubPageSlug?: string;
  clubPageLogo?: string;
  // Liga cargada por el usuario (texto libre o vinculada a una página LEAGUE).
  liga?: string;
  ligaPageId?: string;
  ligaPageSlug?: string;
}

// Helper para ordenar por fecha finalización descendente
export function sortTrayectoriasByFechaDesc(
  trayectorias: Trayectoria[],
): Trayectoria[] {
  return [...trayectorias].sort((a, b) => {
    const dateA = a.fechaFinalizacion
      ? new Date(a.fechaFinalizacion)
      : new Date(); // Si es null o undefined, "Presente" = hoy
    const dateB = b.fechaFinalizacion
      ? new Date(b.fechaFinalizacion)
      : new Date();
    return dateB.getTime() - dateA.getTime();
  });
}

// Helper para formatear la Fecha sin timezone shift.
// Parseamos manualmente "YYYY-MM-DD" para evitar que new Date() lo trate
// como UTC midnight y termine mostrando el mes anterior en zonas UTC-.
export function formatearFecha(fecha: string): string {
  if (!fecha) return "";
  const match = fecha.match(/^(\d{4})-(\d{2})/);
  if (!match) return fecha;
  const year = Number(match[1]);
  const monthIdx = Number(match[2]) - 1;
  // App en español: usamos locale es-AR para que los meses salgan en español
  // ("ene", "feb", ...) y capitalizamos la inicial → "Ene 2026".
  const formatted = new Date(year, monthIdx, 1).toLocaleDateString("es-AR", {
    month: "short",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Helper para formatear los logros

export function formatAchievements(logros: string): string[] {
  if (!logros) return [];

  return logros
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && line !== "•");
}

export function getUltimoClub(
  trayectorias?: Trayectoria[],
): Trayectoria | null {
  if (!trayectorias || trayectorias.length === 0) return null;

  return [...trayectorias].sort((a, b) => {
    const fechaA = new Date(a.fechaFinalizacion || a.fechaInicio).getTime();
    const fechaB = new Date(b.fechaFinalizacion || b.fechaInicio).getTime();
    return fechaB - fechaA; // descendente → más reciente primero
  })[0];
}
