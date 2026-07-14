// Clasificación de usuarios por rol/puesto. Fuente única compartida entre el
// panel (`front/src/app/dashboard/page.tsx`) y la vista de perfil
// (`front/src/pages/user-viewer/[id].tsx`) para que ambos criterios no se
// desincronicen nunca. Trabaja sobre strings crudos (rol/puesto del JWT o del
// contexto) porque es lo que tienen a mano ambos callsites.

// "Jugador puro": role PLAYER sin puesto (o puesto === "jugador").
export function isFootballer(role?: string, puesto?: string): boolean {
  const p = (puesto || "").toLowerCase();
  return role === "PLAYER" && (p === "" || p === "jugador");
}

// "Ofertante": publica ofertas y gestiona candidatos. Incluye agencias,
// reclutadores y clubes, y también los PLAYER de Cuerpo Técnico / Dirección /
// Comunicación (todo lo que NO es jugador puro ni admin). Espeja qué usuarios
// ven un panel con candidatos en el dashboard (DashboardAgente / DashboardOfertante).
export function isOfertante(role?: string, puesto?: string): boolean {
  if (!role || role === "ADMIN") return false;
  return !isFootballer(role, puesto);
}
