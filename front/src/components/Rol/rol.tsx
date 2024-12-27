// components/Rol.tsx
import Image from "next/image";
import React from "react";

function Rol() {
  const roles = [
    {
      title: "Jugador",
      description:
        "Accede a ofertas de empleo, crea tu perfil y aplica a oportunidades.",
      image: "/images/jugador.png", // Ruta de la imagen
    },
    {
      title: "Reclutador",
      description:
        "Publica ofertas de empleo, gestiona aplicaciones y encuentra talento.",
      image: "/images/reclutador.png", // Ruta de la imagen
    },
    {
      title: "Agencia",
      description:
        "Gestiona múltiples perfiles, aplica a todas las ofertas y conecta con clubes.",
      image: "/images/agencia.png", // Ruta de la imagen
    },
  ];

  return (
    <section className="p-8 bg-white">
      <h2 className="text-3xl font-semibold text-center mb-8">Elige tu Rol</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((role, index) => (
          <div
            key={index}
            className={`p-6 bg-gray-100 rounded-lg shadow-md ${
              index % 2 === 0 ? "lg:col-start-1" : "lg:col-start-2"
            }`}
          >
            <Image
              src={role.image}
              alt={role.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <h3 className="text-2xl font-bold mb-2">{role.title}</h3>
            <p>{role.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Rol;
