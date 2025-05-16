export function Subscription() {
  return [
    {
      title: "Amateur",
      image: "/botin1.svg",
      slogan: "Construi tu carrera",
      features: [
        { text: "Página de perfil", available: true },
        { text: "Aplica a ofertas", available: false, highlight: true },
        { text: "Accede a cursos con descuento", available: false },
        { text: "Accede a entrenamientos con descuento", available: false },
        { text: "Perfil Destacado", available: false },
      ],
      monthlyPrice: "GRATIS",
      buttonLabel: "Registrate Gratis",
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      buttonColor: "bg-verde-oscuro",
      priceId: { monthly: null, yearly: null }, 
    },
    {
      title: "Semiprofesional",
      image: "/botin2.svg",
      slogan: "Sé parte del juego activo",
      features: [
        { text: "Página de perfil", available: true },
        { text: "Aplica a ofertas", available: true, highlight: true },
        { text: "Accede a cursos con descuento", available: true },
        { text: "Accede a entrenamientos con descuento", available: false },
        { text: "Perfil Destacado", available: false },
      ],
      monthlyPrice: "€3,95",
      yearlyPrice: "€37,95 Anual (-20%)",
      buttonLabel: "Contratar", 
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-verde-claro",
      buttonColor: "bg-verde-claro",
      priceId: {
        monthly: "price_1R7MaqGbCHvHfqXFimcCzvlo",
        yearly: "price_1R7MaqGbCHvHfqXFimcCzvlo",
      },
      productId: "prod_S1PP1zfIAIwheC",
    },
    {
      title: "Profesional",
      image: "/botin3.svg",
      slogan: "Profesionaliza tu carrera",
      features: [
        { text: "Página de perfil", available: true },
        { text: "Aplica a ofertas ilimitadas", available: true, highlight: true },
        { text: "Accede a cursos con descuento", available: true },
        { text: "Accede a entrenamientos con descuento", available: true },
        { text: "Perfil Destacado", available: true },
      ],
      monthlyPrice: "€9,95",
      yearlyPrice: "€95,88 Anual (-20%)",
      buttonLabel: "Contratar",
      bgColor: "bg-gradient-to-b from-[#255b2d] to-[#1d5126]",
      textColor: "text-white",
      borderColor: "border-verde-oscuro",
      buttonColor: "bg-white text-verde-oscuro hover:bg-gray-100",
      priceId: {
        monthly: "price_1RP80ZGbCHvHfqXF9CqoLtnt",
        yearly: "price_1RP80ZGbCHvHfqXF9CqoLtnt" 
      },
      productId: "prod_SJlX3qKmAGTGw6",
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
  
  // Check if the price ID matches any subscription
  for (const subscription of subscriptions) {
    if (
      (subscription.priceId.monthly === priceId) || 
      (subscription.priceId.yearly === priceId)
    ) {
      return subscription.title;
    }
  }
  
  // Default to Amateur if no match found
  return "Amateur";
}
