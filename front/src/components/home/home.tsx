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

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

// Imágenes
import futA from "../../../public/buscador_ydamak.jpg";
import futB from "../../../public/publicarOfertas2.jpg";
import futC from "../../../public/cursosYformaciones2.jpg";
// Tipado global de Google Translate
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
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("es");

  const images = [
    {
      src: futA,
      text: "Buscador de ofertas laborales",
    },
    {
      src: futB,
      text: "Publicar oferta laboral",
    },
    {
      src: futC,
      text: "Cursos y Formaciones",
    },
  ];

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });

    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "es",
          includedLanguages: "it,es",
          autoDisplay: false,
        },
        "google_translate_element"
      );
      setIsGoogleLoaded(true);
    };
  }, []);

  const toggleLanguage = () => {
    if (!isGoogleLoaded) {
      alert("Google Translate aún no ha cargado.");
      return;
    }

    const select = document.querySelector(
      ".goog-te-combo"
    ) as HTMLSelectElement;
    if (select) {
      const newLanguage = currentLanguage === "es" ? "it" : "es";
      select.value = newLanguage;
      select.dispatchEvent(new Event("change"));
      setCurrentLanguage(newLanguage);
    }
  };

  return (
    <main className="bg-verde-oscuro text-white relative overflow-hidden">
      {role === "ADMIN" ? <NavbarAdmin /> : <NavbarRoles />}

      <div id="google_translate_element" className="hidden"></div>

      <style>
        {`
          .goog-te-banner-frame { display: none !important; }
          body { top: 0px !important; }
          .goog-te-gadget { display: none !important; }
        `}
      </style>

      <button
        onClick={toggleLanguage}
        className="fixed top-4 right-4 mt-28 bg-white text-black p-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-200 transition duration-300 z-50"
      >
        <FaGlobe size={20} />
        <span>{currentLanguage === "es" ? "Italiano" : "Español"}</span>
      </button>

      {/* Carrusel con Swiper */}
      <header
        className="relative flex flex-col items-center justify-center min-h-screen text-center"
        data-aos="fade-in"
      >
        <Swiper
          modules={[Autoplay, EffectFade]}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          effect="fade"
          loop
          className="w-full h-screen"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <Image
                  src={image.src}
                  fill
                  alt={`Imagen ${index + 1}`}
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="text-white text-2xl sm:text-4xl font-bold bg-black bg-opacity-50 px-8 py-4 rounded-lg">
                    {image.text}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </header>

      {/* Secciones */}
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
