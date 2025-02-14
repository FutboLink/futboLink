"use client";

import React, { useContext, useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { UserContext } from "@/components/Context/UserContext";
import About from "@/components/AboutUs/about";
import Notices from "@/components/Notices/notices";
import Subs from "@/components/Subs/subs";
import NavbarHome from "@/components/navbar/navbarHome";
import NavbarAdmin from "@/components/navbar/navbarAdmin";
import Link from "next/link";
import Image from "next/image";

const Home = () => {
  const { role } = useContext(UserContext);
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    {
      src: "/buscador.jpg",
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

    // Cambio automático de imagen cada 2 segundos
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <main className="bg-green-600 text-white relative overflow-hidden">
      {role === "ADMIN" ? <NavbarAdmin /> : <NavbarHome />}
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
      {/* Notices Section (visible only on large screens) */}
      <section data-aos="fade-right" data-aos-delay="200">
        <Notices />
      </section>
      {/* About Section (visible only on large screens) */}
      <section data-aos="fade-left" data-aos-delay="400">
        <About />
      </section>
      {/* Subs Section (visible only on large screens) */}
      <section data-aos="zoom-in" data-aos-delay="600">
        <Subs />
      </section>
    </main>
  );
};

export default Home;
