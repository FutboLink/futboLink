"use client";

import React, { useContext } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { UserContext } from "@/components/Context/UserContext";
import About from "@/components/AboutUs/about";
import Notices from "@/components/Notices/notices";
import Subs from "@/components/Subs/subs";
import NavbarAdmin from "@/components/navbar/navbarAdmin";
import Image from "next/image";
import NavbarRoles from "@/components/navbar/navbarRoles";
import ClientsSection from "@/components/Clients/client";
import { useEffect } from "react";
import LanguageToggle from "@/components/LanguageToggle/LanguageToggle";
import { useRouter } from "next/navigation";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

// Imágenes
import futA from "../../../public/buscador_ydamak.jpg";
import futB from "../../../public/publicarOfertas2.jpg";
import futC from "../../../public/cursosYformaciones2.jpg";
import LogoCarousel from "../LogoCarousel/LogoCarousel";

const Home = () => {
  const { role } = useContext(UserContext);
  const router = useRouter();

  const images = [
    {
      src: futA,
      text: "Buscador de ofertas laborales",
      link: "/jobs",
    },
    {
      src: futB,
      text: "Publicar oferta laboral",
      link: "/OptionUsers",
    },
    {
      src: futC,
      text: "Cursos y Formaciones",
      link: "/cursos",
    },
  ];

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  const handleSlideClick = (link: string) => {
    router.push(link);
  };

  return (
    <main className="bg-verde-oscuro text-white relative overflow-hidden">
      {/* Language Toggle Button */}
      <LanguageToggle />

      {/* Título principal visible para SEO */}
      <h1 className="sr-only">
        Futbolink - Conectando talento y oportunidades en el mundo del fútbol
      </h1>

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
              <div
                className="relative w-full h-full cursor-pointer"
                onClick={() => handleSlideClick(image.link)}
              >
                <Image
                  src={image.src}
                  fill
                  alt={`Futbolink - ${image.text}`}
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center hover:bg-opacity-50 transition-all duration-300">
                  <h2 className=" hidden text-white text-3xl sm:text-5xl font-bold mb-4">
                    Futbolink
                  </h2>
                  <div className="text-white text-xl sm:text-3xl font-bold bg-black bg-opacity-50 px-8 py-4 rounded-lg">
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
      <LogoCarousel />

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
