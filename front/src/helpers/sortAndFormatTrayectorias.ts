export interface Trayectoria {
  club: string;
  logros?: string;
  fechaInicio: string;
  fechaFinalizacion?: string | null;
  categoriaEquipo: string;
  nivelCompetencia: string;
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

// Helper para formatear la Fecha
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
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
