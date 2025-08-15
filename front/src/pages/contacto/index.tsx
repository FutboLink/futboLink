import AOS from "aos";
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import Footer from "@/components/Footer/footer";
import SocialButton from "@/components/SocialButton/SocialButton";
import "aos/dist/aos.css";
import ContactForm from "@/components/ContactForm/ContactForm";

export default function ContactoPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      AOS.init();
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Contacto - FutboLink</title>
        <meta
          name="description"
          content="Contacta con FutboLink para más información sobre nuestros servicios."
        />
      </Head>

      <div className="overflow-hidden">
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
                src="/logoD.png"
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
                siguiente paso en tu carrera o negocio. ¡Contáctanos y
                comencemos hoy mismo!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
              {/* Formulario de contacto */}
              <ContactForm />

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

      <SocialButton />
      <Footer />
    </div>
  );
}
