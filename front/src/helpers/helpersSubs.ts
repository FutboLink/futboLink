export function Subscription() {
  return [
    {
      title: "Amateur",
      subtitle: "Amateur",
      image: "/botin1.svg",
      features: [
        { text: "Página de perfil", available: true },
        { text: "Aplica a ofertas", available: false },
        { text: "Accede a cursos con descuento", available: false },
        { text: "Accede a entrenamientos con descuento", available: false },
        { text: "Perfil Destacado", available: false },
      ],
      price: "Gratis",
      buttonLabel: "Registrate Gratis",
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      buttonColor: "bg-verde-oscuro",
    },
    {
      title: "Semiprofesional",
      subtitle: "Semiprofesional",
      image: "/botin2.svg",
      features: [
        { text: "Página de perfil", available: true },
        { text: "Ofertas estándar", available: true },
        { text: "Accede a cursos con descuento", available: true },
        { text: "Accede a entrenamientos con descuento", available: false },
        { text: "Perfil Destacado", available: false },
      ],
      price: "€3,95 / Mes | €37,95 / Año (-20% Descuento)",
      buttonLabel: "Contratar",
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-verde-claro",
      buttonColor: "bg-verde-claro",
    },
    {
      title: "Profesional",
      subtitle: "El más contratado",
      image: "/botin3.svg",
      features: [
        { text: "Página de perfil", available: true },
        { text: "Ofertas Internacionales", available: true },
        { text: "Accede a cursos con descuento", available: true },
        { text: "Accede a entrenamientos con descuento", available: true },
        { text: "Perfil Destacado", available: true },
      ],
      price: "€7,95 / Mes | €75,95 / Año (-20% Descuento)",
      buttonLabel: "Contratar",
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-verde-oscuro",
      buttonColor: "bg-verde-oscuro",
    },
  ];
}
