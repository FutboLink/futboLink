export function Subscription() {
  return [
    {
      title: "Amateur",
      image: "/botin1.svg",
      slogan: "Empieza a construir tu carrera",
      features: [
        { text: "Página de perfil", available: true },
        { text: "Aplica a ofertas", available: false },
        { text: "Accede a cursos con descuento", available: false },
        { text: "Accede a entrenamientos con descuento", available: false },
        { text: "Perfil Destacado", available: false },
      ],
      monthlyPrice: "€0",
      buttonLabel: "Registrate Gratis", // Este texto es el que aparece en lugar del "Contratar"
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      buttonColor: "bg-verde-oscuro",
      priceId: { monthly: null, yearly: null }, // Gratis, sin integración de Stripe
    },
    {
      title: "Semiprofesional",
      image: "/botin2.svg",
      slogan: "Sé parte del juego activo",
      features: [
        { text: "Página de perfil", available: true },
        { text: "Ofertas estándar", available: true },
        { text: "Accede a cursos con descuento", available: true },
        { text: "Accede a entrenamientos con descuento", available: false },
        { text: "Perfil Destacado", available: false },
      ],
      monthlyPrice: "€3,95",
      yearlyPrice: "€37,95 Anual (-20%)",
      buttonLabel: "Contratar", // Este texto será el que aparece en este plan
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-verde-claro",
      buttonColor: "bg-verde-claro",
      priceId: {
        monthly: "price_1QzExaGfoNYDVs9qoxSEwlGL",
        yearly: "price_1R6zorGfoNYDVs9qaCmwW8Ik",
      },
    },
    {
      title: "Profesional",
      image: "/botin3.svg",
      slogan: "Destaca en el mercado profesional",
      features: [
        { text: "Página de perfil", available: true },
        { text: "Ofertas Internacionales", available: true },
        { text: "Accede a cursos con descuento", available: true },
        { text: "Accede a entrenamientos con descuento", available: true },
        { text: "Perfil Destacado", available: true },
      ],
      monthlyPrice: "€7,95",
      yearlyPrice: "€75,95 Anual (-20%)",
      buttonLabel: "Contratar", // Este texto será el que aparece en este plan
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-verde-oscuro",
      buttonColor: "bg-verde-oscuro",
      priceId: {
        monthly: "price_1R6znRGfoNYDVs9q8Rh8SKmK",
        yearly: "price_1R6zo8GfoNYDVs9qeEIlhdnW",
      },
    },
  ];
}
