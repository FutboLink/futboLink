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
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset states
    setMessage("");
    setSuccess(false);
    setError(false);

    // Form validation
    if (!email || !name || !mensaje) {
      setMessage("⚠️ Por favor, completa todos los campos.");
      setError(true);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("⚠️ Por favor, introduce un correo electrónico válido.");
      setError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await contact(email, name, mensaje);

      if (response.success) {
        setSuccess(true);
        setMessage("✅ Se ha enviado tu mensaje. Nos pondremos en contacto pronto.");
        setEmail("");
        setName("");
        setMensaje("");
      } else {
        setError(true);
        setMessage(`❌ ${response.message || "Ocurrió un error al enviar el mensaje. Por favor, intenta de nuevo más tarde."}`);
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setError(true);
      setMessage("❌ No se pudo conectar con el servidor. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 overflow-hidden">
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
              <form
                onSubmit={handleSubmit}
                className="text-gray-800 space-y-4 sm:space-y-6"
              >
                {/* Nombre */}
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
                    disabled={loading}
                  />
                </div>

                {/* Correo electrónico */}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu correo electrónico"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
                    disabled={loading}
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    rows={4}
                    placeholder="Tu mensaje"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
                    disabled={loading}
                  />
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  className="w-full py-3 bg-verde-oscuro text-white text-lg font-semibold rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : "Enviar mensaje"}
                </button>
              </form>

              {/* Mensaje de estado */}
              {message && (
                <div className={`mt-4 p-3 rounded-md ${success ? 'bg-green-100 text-green-800' : error ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                  <p className="text-center text-md font-medium">{message}</p>
                  {success && (
                    <p className="text-center text-sm mt-2">
                      Te responderemos a la brevedad a la dirección de correo proporcionada.
                    </p>
                  )}
                </div>
              )}
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
