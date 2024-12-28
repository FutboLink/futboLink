function Subs() {
  const subscriptionOptions = [
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
      buttonColor: "bg-green-600",
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
      borderColor: "border-green-600",
      buttonColor: "bg-green-600",
    },
  ];

  return (
    <section className="p-12 bg-gray-100">
      <h2 className="text-4xl font-semibold text-center text-gray-800 mb-10">
        Elige tu Plan de Membresía
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {subscriptionOptions.map((option, index) => {
          // Determinar si todas las características están disponibles
          const allAvailable = option.features.every(
            (feature) => feature.available
          );

          return (
            <div
              key={index}
              className={`rounded-lg shadow-lg p-6 border-2 ${option.borderColor} ${option.bgColor} ${option.textColor} transition-transform transform hover:scale-105`}
            >
              <h3
                className={`text-2xl font-semibold mb-4 ${
                  allAvailable ? "text-green-600" : "text-gray-800"
                }`}
              >
                {option.title}
              </h3>
              <h4 className="text-xl font-medium mb-6">{option.subtitle}</h4>
              <ul className="space-y-3 mb-6 text-base">
                {option.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span
                      className={`mr-2 ${
                        feature.available ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {feature.available ? "✔" : "✘"}
                    </span>
                    {feature.text}
                  </li>
                ))}
              </ul>
              <p className="text-xl font-semibold mb-6">{option.price}</p>
              <button
                className={`w-full py-3 rounded-md ${option.buttonColor} text-white text-lg font-semibold transition-all hover:bg-green-700`}
              >
                {option.buttonLabel}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Subs;
