"use client";

import Image from "next/image";
import logo from "../../../public/logoD.png";
import Head from "next/head";
import AOS from "aos";
import "aos/dist/aos.css"; 
import React, { useState } from "react";
import { contact } from "../Fetchs/UsersFetchs/UserFetchs";

function Contact() {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      AOS.init();
    }
  }, []);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !name || !mensaje) {
      setMessage("⚠️ Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);
    setMessage(""); 

    const { success } = await contact(email, name, mensaje);

    setLoading(false);

    if (success) {
      setSuccess(true);
      setMessage("✅ Se ha enviado tu mensaje.");
    } else {
      setMessage("❌ Ocurrió un error al enviar el mensaje.");
    }
  };

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
              ¡Bienvenido a FutboLink!
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
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-semibold text-verde-oscuro mb-6">
              Contáctanos
            </h2>
            <form onSubmit={handleSubmit} className="text-gray-800 space-y-4 sm:space-y-6">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={name} // Vinculamos el estado de `name` con el input
                  onChange={(e) => setName(e.target.value)} // Actualizamos el estado con el valor del input
                  placeholder="Tu nombre"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
                />
              </div>

              {/* Correo electrónico */}
              <div>
                <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email} // Vinculamos el estado de `email` con el input
                  onChange={(e) => setEmail(e.target.value)} // Actualizamos el estado con el valor del input
                  placeholder="Tu correo electrónico"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
                />
              </div>

              {/* Mensaje */}
              <div>
                <label htmlFor="message" className="block text-lg font-medium text-gray-700">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  value={mensaje} 
                  onChange={(e) => setMensaje(e.target.value)} 
                  rows={4}
                  placeholder="Tu mensaje"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
                />
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                className="w-full py-3 bg-verde-oscuro text-white text-lg font-semibold rounded-md hover:bg-green-700 transition-colors"
                disabled={loading} 
              >
                {loading ? "Enviando..." : "Enviar mensaje"}
              </button>
            </form>

            {/* Mensaje de estado */}
            {message && <p className="text-gray-800 mt-4 text-center text-xl">{message}</p>}
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
              <div className="relative rounded-lg overflow-hidden shadow-lg">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12578.187595244646!2d18.174808!3d40.350853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sit!4v1714500000000!5m2!1ses!2sit"
    width="600"
    height="400"
    allowFullScreen
    loading="lazy"
    className="w-full h-[400px] rounded-lg border-0"
  ></iframe>
</div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold text-verde-oscuro">
                  Dirección:
                </h3>
                <p className="text-lg text-gray-700">
                Lecce, Apulia, Italia, 73100
                </p>

                <h3 className="text-xl font-semibold text-verde-oscuro mt-4">
                  Teléfono:
                </h3>
                <p className="text-lg text-gray-700">+393715851071</p>

                <h3 className="text-xl font-semibold text-verde-oscuro mt-4">
                  Correo electrónico:
                </h3>
                <p className="text-lg text-gray-700">
                futbolink.contacto@gmail.com
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
