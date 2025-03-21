import React, { useState } from "react";

const SubPage = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  const plans = {
    jugadores: [
      {
        title: "GRATIS",
        subtitle: "Inicio",
        features: [
          "Crea tu perfil",
          "Sin acceso a ofertas ni entrenamientos",
          "Explora ofertas básicas",
        ],
        price: "Gratis",
      },
      {
        title: "BÁSICO",
        subtitle: "Amateurs",
        features: [
          "Accede a ofertas estándar",
          "Descuentos exclusivos en cursos",
        ],
        price: "€3,95 / Mes | €37,95 / Año (-20% Descuento)",
      },
      {
        title: "PREMIUM",
        subtitle: "El más contratado",
        features: [
          "Accede a todas las ofertas",
          "Descuentos en cursos y entrenamientos",
        ],
        price: "€8,95 / Mes | €85,95 / Año (-20% Descuento)",
      },
    ],
    representantes: [
      {
        title: "GRATIS",
        subtitle: "Intermediario",
        features: [
          "Crea tu perfil",
          "Sin acceso a ofertas ni entrenamientos",
          "Hasta 5 perfiles",
        ],
        price: "Gratis",
      },
      {
        title: "BÁSICO",
        subtitle: "Agente",
        features: [
          "Accede a ofertas Amateur",
          "Descuentos en cursos",
          "Hasta 10 perfiles",
        ],
        price: "€20,95 / Mes | €199,95 / Año (-20% Descuento)",
      },
      {
        title: "PREMIUM",
        subtitle: "El más contratado",
        features: [
          "Accede a todas las ofertas",
          "Descuentos en cursos y entrenamientos",
          "Hasta 20 perfiles",
        ],
        price: "€41,95 / Mes | €399,95 / Año (-20% Descuento)",
      },
    ],
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-verde-oscuro text-white py-16 text-center">
        <h1 className="text-4xl font-bold">Planes de Suscripción</h1>
        <p className="mt-4 text-lg">
          Elige el plan que mejor se adapte a tus necesidades.
        </p>
      </header>

      <section className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6">
            {/* Jugadores */}
            <div>
              <button
                onClick={() => toggleSection("jugadores")}
                className="w-full bg-verde-claro text-white py-4 px-6 text-left font-semibold rounded-md shadow-md"
              >
                Jugadores: Las ofertas para jugadores
              </button>
              {activeSection === "jugadores" && (
                <div className="bg-white p-6 rounded-md shadow-md mt-4">
                  {plans.jugadores.map((plan, index) => (
                    <div key={index} className="border-b last:border-none py-4">
                      <h3 className="text-xl font-bold">{plan.title}</h3>
                      <p className="text-gray-600">{plan.subtitle}</p>
                      <ul className="list-disc list-inside mt-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                      <p className="text-verde-oscuro font-semibold mt-2">
                        {plan.price}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Representantes */}
            <div>
              <button
                onClick={() => toggleSection("representantes")}
                className="w-full bg-yellow-500 text-white py-4 px-6 text-left font-semibold rounded-md shadow-md"
              >
                Representantes: Las ofertas para representantes
              </button>
              {activeSection === "representantes" && (
                <div className="bg-white p-6 rounded-md shadow-md mt-4">
                  {plans.representantes.map((plan, index) => (
                    <div key={index} className="border-b last:border-none py-4">
                      <h3 className="text-xl font-bold">{plan.title}</h3>
                      <p className="text-gray-600">{plan.subtitle}</p>
                      <ul className="list-disc list-inside mt-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                      <p className="text-yellow-600 font-semibold mt-2">
                        {plan.price}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubPage;
