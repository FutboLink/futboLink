"use client";

import React, { useContext, useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { UserContext } from "@/components/Context/UserContext";
import About from "@/components/AboutUs/about";
import Notices from "@/components/Notices/notices";
import Subs from "@/components/Subs/subs";
import NavbarAdmin from "@/components/navbar/navbarAdmin";
import Link from "next/link";
import Image from "next/image";
import NavbarRoles from "@/components/navbar/navbarRoles";
import ClientsSection from "@/components/Clients/client";
import { FaGlobe } from "react-icons/fa";

// Declaramos `googleTranslateElementInit` para evitar errores de TypeScript
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: new (options: object, elementId: string) => void;
      };
    };
  }
}

const Home = () => {
  const { role } = useContext(UserContext);
  const [currentImage, setCurrentImage] = useState(0);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("es"); // Estado para el idioma actual

  const images = [
    {
      src: "/buscadorr.jpg",
      link: "/link1",
      text: "Buscador de ofertas laborales",
    },
    {
      src: "/publicarOfertas.jpg",
      link: "/link2",
      text: "Publicar oferta laboral",
    },
    {
      src: "/cursosYformaciones.jpg",
      link: "/link3",
      text: "Cursos y Formaciones",
    },
  ];

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });

    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "es",
          includedLanguages: "it,es", // Español e Italiano
          autoDisplay: false,
        },
        "google_translate_element"
      );
      setIsGoogleLoaded(true);
    };

    return () => clearInterval(interval);
  }, []);

  // Alternar entre español e italiano
  const toggleLanguage = () => {
    if (!isGoogleLoaded) {
      alert(
        "Google Translate aún no ha cargado. Intenta de nuevo en unos segundos."
      );
      return;
    }

    const select = document.querySelector(
      ".goog-te-combo"
    ) as HTMLSelectElement;
    if (select) {
      const newLanguage = currentLanguage === "es" ? "it" : "es"; // Cambia el idioma
      select.value = newLanguage;
      select.dispatchEvent(new Event("change"));
      setCurrentLanguage(newLanguage);
    }
  };

  return (
    <main className="bg-verde-oscuro text-white relative overflow-hidden">
      {role === "ADMIN" ? <NavbarAdmin /> : <NavbarRoles />}

      {/* Contenedor oculto del traductor */}
      <div id="google_translate_element" className="hidden"></div>

      {/* Ocultar la barra de Google Translate */}
      <style>
        {`
          .goog-te-banner-frame { display: none !important; }
          body { top: 0px !important; }
          .goog-te-gadget { display: none !important; }
        `}
      </style>

      {/* Botón para cambiar entre español e italiano */}
      <button
        onClick={toggleLanguage}
        className="fixed top-4 right-4 mt-28 bg-white text-black p-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-200 transition duration-300 z-50"
      >
        <FaGlobe size={20} />{" "}
        <span>{currentLanguage === "es" ? "Italiano" : "Español"}</span>
      </button>

      <header
        className="relative flex flex-col items-center justify-center min-h-screen text-center"
        data-aos="fade-in"
      >
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="relative w-full h-full overflow-hidden">
            <div className="h-full">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                    index === currentImage ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={image.src}
                      width={1920}
                      height={1080}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="text-white text-2xl sm:text-4xl font-bold bg-black bg-opacity-50 px-8 py-4 rounded-lg">
                        <Link href={image.link}>{image.text}</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section data-aos="fade-left" data-aos-delay="400">
        <About />
      </section>
      <section data-aos="zoom-in" data-aos-delay="600">
        <Subs />
      </section>
      <section data-aos="zoom-in" data-aos-delay="600">
        <ClientsSection />
      </section>
      <section data-aos="fade-right" data-aos-delay="200">
        <Notices />
      </section>
    </main>
  );
};

export default Home;
