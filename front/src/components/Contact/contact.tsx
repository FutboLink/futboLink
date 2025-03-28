"use client";

import Image from "next/image";
import logo from "../../../public/logoD.png";
import Head from "next/head";
import AOS from "aos"; // Importamos AOS
import "aos/dist/aos.css"; // Importamos los estilos de AOS
import React from "react";

function Contact() {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      AOS.init();
    }
  }, []);

  return (
    <div className="mt-16 overflow-x-hidden">
      <Head>
        <title>Contacto - Futbolink</title>
        <meta
          name="description"
          content="Conéctate con Futbolink, la agencia que conecta jugadores, representantes y agencias de fútbol de todo el mundo. ¡Contáctanos hoy!"
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <section
        className="bg-gray-100 py-8 sm:py-12"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        <div className="container mx-auto px-4 sm:px-8 max-w-full">
          <div
            className="flex justify-center mb-8 sm:mb-12"
            data-aos="fade-down"
            data-aos-duration="1000"
          >
            <Image
              src={logo}
              alt="Futbolink Logo"
              width={120}
              height={120}
              className="rounded-lg"
            />
          </div>

          <div
            className="text-center mb-8 sm:mb-12"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            <h1 className="text-3xl sm:text-4xl font-semibold text-green-700">
              ¡Bienvenido a Futbolink!
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mt-4">
              Somos una agencia con sede en Italia, dedicada a conectar
              jugadores, representantes y agencias de fútbol de todo el mundo.
              Nuestro equipo de profesionales está aquí para ayudarte a dar el
              siguiente paso en tu carrera o negocio. ¡Contáctanos y comencemos
              hoy mismo!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            {/* Formulario de contacto */}
            <div
              className="bg-white p-6 sm:p-8 rounded-lg shadow-lg"
              data-aos="fade-right"
              data-aos-duration="1000"
            >
              <h2 className="text-2xl sm:text-3xl font-semibold text-verde-oscuro mb-6">
                Contáctanos
              </h2>
              <form className="space-y-4 sm:space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Nombre
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Tu correo electrónico"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Tu mensaje"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-verde-oscuro text-white text-lg font-semibold rounded-md hover:bg-green-700 transition-colors"
                >
                  Enviar mensaje
                </button>
              </form>
            </div>

            {/* Sección de ubicación */}
            <div
              className="bg-white p-6 sm:p-8 rounded-lg shadow-lg"
              data-aos="fade-left"
              data-aos-duration="1000"
            >
              <h2 className="text-2xl sm:text-3xl font-semibold text-verde-oscuro mb-6">
                Ubicación
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                Nuestra sede se encuentra en Italia, pero trabajamos con
                jugadores, representantes y agencias de todo el mundo.
              </p>
              <div className="relative">
                {/* Imagen del mapa con ajuste */}
                <Image
                  src="https://img.freepik.com/vector-gratis/mapas-ubicacion-telefono-icono-dibujos-animados-ilustracion-concepto-icono-tecnologia-transporte-aislado-estilo-dibujos-animados-plana_138676-2157.jpg?t=st=1735405761~exp=1735409361~hmac=ebe3cbf4045191e5a98a73bc3241205ae252bed98ae1188fa14a2e924f012c67&w=826"
                  alt="Ubicación de Futbolink"
                  layout="responsive"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold text-verde-oscuro">
                  Dirección:
                </h3>
                <p className="text-lg text-gray-700">
                  Via Roma, 123, 00100 Roma, Italia
                </p>

                <h3 className="text-xl font-semibold text-verde-oscuro mt-4">
                  Teléfono:
                </h3>
                <p className="text-lg text-gray-700">+39 06 1234 5678</p>

                <h3 className="text-xl font-semibold text-verde-oscuro mt-4">
                  Correo electrónico:
                </h3>
                <p className="text-lg text-gray-700">
                  contacto@futbolcareer.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-verde-oscuro text-white py-6 sm:py-8 text-center"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        <p className="text-lg sm:text-xl font-semibold">
          ¿Tienes alguna pregunta o quieres saber más? ¡No dudes en ponerte en
          contacto con nosotros!
        </p>
      </section>
    </div>
  );
}

export default Contact;
