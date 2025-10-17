"use client";

import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Autoplay, EffectFade } from "swiper/modules";
// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import About from "@/components/AboutUs/about";
import ClientsSection from "@/components/Clients/client";
import LanguageToggle from "@/components/LanguageToggle/LanguageToggle";
import Notices from "@/components/Notices/notices";
import Subs from "@/components/Subs/subs";
import "swiper/css";
import "swiper/css/effect-fade";

import { useFetchUserProfile } from "@/hook/useFetchUserProfile";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
// Imágenes
import futA from "../../../public/buscador_ydamak.jpg";
import futC from "../../../public/cursosYformaciones2.jpg";
import futB from "../../../public/publicarOfertas2.jpg";
import LogoCarousel from "../LogoCarousel/LogoCarousel";

const Home = () => {
  const { fetchUserProfile } = useFetchUserProfile();
  const { isNextIntlEnabled } = useI18nMode();
  const tHome = useNextIntlTranslations('home');

  const router = useRouter();

  // Función para obtener el texto traducido o el texto original
  const getText = (originalText: string, translatedKey: string) => {
    return isNextIntlEnabled ? tHome.t(translatedKey) : originalText;
  };

  const images = [
    {
      src: futA,
      text: getText("Buscador de ofertas laborales", "jobSearcher"),
      link: "/jobs",
    },
    {
      src: futB,
      text: getText("Publicar oferta laboral", "publishJob"),
      link: "/OptionUsers",
    },
    {
      src: futC,
      text: getText("Cursos y Formaciones", "coursesTraining"),
      link: "/cursos",
    },
  ];

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  const handleSlideClick = (link: string) => {
    router.push(link);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
            <SwiperSlide key={`${image.text}-${index}`}>
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
        <ClientsSection />
      </section>
    
    </main>
  );
};

export default Home;
