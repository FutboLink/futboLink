interface SubscriptionFeature {
  text: string;
  available: boolean;
  highlight?: boolean;
}

/**
 * PLACEHOLDER — precio del plan Trimestral aún NO definido (decisión de negocio pendiente).
 * Se deja como constante única y fácil de encontrar/editar cuando el precio real se cierre.
 * NO representa un precio real, no debe usarse para cobrar (el priceId de Stripe trimestral
 * tampoco existe todavía — ver `priceId.quarterly: null` en los planes de abajo).
 */
export const QUARTERLY_PRICE_PLACEHOLDER = "A confirmar";

export function Subscription() {
  return [
    {
      title: "Amateur",
      image: "/botin1.svg",
      slogan: "Ideal para empezar en FutboLink",
     features: [
  { text: "Página de perfil profesional", available: true },
  { text: "Aparece en el buscador", available: true },
  { text: "Visible para clubes y reclutadores", available: true },
  { text: "Aplicar a ofertas", available: false },
  { text: "Perfil destacado", available: false },
  { text: "Prioridad en búsquedas", available: false },
] as SubscriptionFeature[],
      monthlyPrice: "GRATIS",
      buttonLabel: "Registrate Gratis",
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      buttonColor: "bg-verde-oscuro",
      priceId: { monthly: null, yearly: null, quarterly: null },
    },
    {
      title: "Semiprofesional",
      image: "/botin2.svg",
      slogan: "Empezá a generar oportunidades reales",
features: [
  { text: "Página de perfil", available: true },
  { text: "Aplica a ofertas", available: true, highlight: true },
  { text: "Accede a cursos con descuento", available: true },
  { text: "Accede a entrenamientos con descuento", available: false },
  { text: "Perfil Destacado", available: false },
],
      monthlyPrice: "€3,95",
      yearlyPrice: "€37,95 Anual (-20%)",
      quarterlyPrice: `${QUARTERLY_PRICE_PLACEHOLDER} Trimestral`,
      buttonLabel: "Contratar",
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-verde-claro",
      buttonColor: "bg-verde-claro",
      priceId: {
        monthly: "price_1R7MPlGbCHvHfqXFNjW8oj2k",
        yearly: "price_1R7MPlGbCHvHfqXFapD8MeOw",
        // Trimestral: priceId real pendiente de creación en Stripe (decisión de negocio abierta).
        // null intencional — mismo criterio que el backend (resolvePlanByPriceId): sin priceId
        // configurado, el plan trimestral queda inactivo sin romper mensual/anual.
        quarterly: null,
      },
      productId: "prod_S1PExFzjXvaE7E",
    },
    {
      title: "Profesional",
      image: "/botin3.svg",
      slogan: "Profesionaliza tu carrera",
features: [
  { text: "Página de perfil profesional", available: true },
  { text: "Aplica a todas las ofertas (Basic + Premium)", available: true, highlight: true },
  { text: "Perfil destacado", available: true },
  { text: "Prioridad en el buscador", available: true },
  { text: "Máxima visibilidad ante clubes y reclutadores", available: true },
],
      monthlyPrice: "€7,95",
      yearlyPrice: "€75,95 Anual (-20%)",
      quarterlyPrice: `${QUARTERLY_PRICE_PLACEHOLDER} Trimestral`,
      buttonLabel: "Contratar",
      bgColor: "bg-gradient-to-b from-[#255b2d] to-[#1d5126]",
      textColor: "text-white",
      borderColor: "border-verde-oscuro",
      buttonColor: "bg-white text-verde-oscuro hover:bg-gray-100",
      priceId: {
        monthly: "price_1R7MaqGbCHvHfqXFimcCzvlo",
        yearly: "price_1R7MbgGbCHvHfqXFYECGw8S9",
        // Trimestral: priceId real pendiente de creación en Stripe (decisión de negocio abierta).
        quarterly: null,
      },
      productId: "prod_S1PP1zfIAIwheC",
      recommended: true,
    },
  ];
}

/**
 * Returns the subscription name based on price ID
 * @param priceId Stripe price ID
 * @returns Subscription name (Amateur, Semiprofesional, or Profesional)
 */
export function getSubscriptionName(priceId: string): string {
  const subscriptions = Subscription();
  
  // Check if the price ID matches any subscription (incluye trimestral cuando se configure)
  for (const subscription of subscriptions) {
    if (
      (subscription.priceId.monthly === priceId) ||
      (subscription.priceId.yearly === priceId) ||
      (subscription.priceId.quarterly === priceId)
    ) {
      return subscription.title;
    }
  }
  
  // Default to Amateur if no match found
  return "Amateur";
}
