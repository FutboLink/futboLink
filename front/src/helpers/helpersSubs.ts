export function Subscription() {
  return [
    {
      title: "GRATIS",
      subtitle: "Inicio",
      features: [
        { text: "Crea tu perfil", available: true },
        { text: "Explora ofertas básicas", available: true },
        {
          text: "Sin acceso a ofertas premium ni entrenamientos",
          available: false,
        },
      ],
      price: "Gratis",
      buttonLabel: "Registrarse",
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      buttonColor: "bg-verde-oscuro",
    },
    {
      title: "BÁSICO",
      subtitle: "Amateurs",
      features: [
        { text: "Crea tu perfil y accede a ofertas estándar", available: true },
        { text: "Descuentos exclusivos en cursos", available: true },
        { text: "Sin acceso a entrenamientos con descuento", available: false },
      ],
      price: "€3,95 / Mes | €37,95 / Año (-20% Descuento)",
      buttonLabel: "Contratar",
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-yellow-500",
      buttonColor: "bg-yellow-500",
    },
    {
      title: "PREMIUM",
      subtitle: "El más contratado",
      features: [
        { text: "Accede a todas las ofertas", available: true },
        { text: "Perfil premium y visibilidad", available: true },
        { text: "Cursos y entrenamientos con descuento", available: true },
      ],
      price: "€8,95 / Mes | €85,95 / Año (-20% Descuento)",
      buttonLabel: "Contratar",
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-verde-oscuro",
      buttonColor: "bg-verde-oscuro",
    },
  ];
}
