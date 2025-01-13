"use client";

import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // Importa los estilos de AOS

import CardOffer from "@/components/OfferComponents/Offer";
import About from "@/components/AboutUs/about";
import Notices from "@/components/Notices/notices";
import Subs from "@/components/Subs/subs";
import NavbarHome from "@/components/navbar/navbarHome";

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, 
      once: false, 
    });
  }, []);

  return (
    <main className="bg-green-600 text-white relative overflow-hidden">
      <NavbarHome />
      {/* Header Section */}
      <header
        className="relative flex flex-col items-center justify-center min-h-screen text-center"
        data-aos="fade-in"
      >
        <div className="absolute top-0 left-0 w-full h-full">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            src="/video.mp4"
          ></video>
        </div>

        {/* Overlay for the Header */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Header Content */}
        <div
          className="relative z-10 flex flex-col items-center justify-center p-4"
          data-aos="zoom-in"
        >
          <h1 className="text-4xl md:text-6xl font-bold">Futbol Career</h1>
          <p className="mt-4 text-lg md:text-2xl">
            Encuentra oportunidades en el mundo del fútbol.
          </p>

          {/* Slogan */}
          <p className="mt-2 text-xl italic">
            Conectamos talento con oportunidades
          </p>

          {/* Buttons */}
          <div
            className="mt-6 flex gap-4"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300">
              Publicar Ofertas
            </button>
            <button className="bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-600 transition duration-300">
              Vacantes Laborales
            </button>
          </div>
        </div>
      </header>

      {/* Card Offer Section */}
      <section data-aos="fade-up">
        <CardOffer />
      </section>

      {/* Notices Section */}
      <section data-aos="fade-right" data-aos-delay="200">
        <Notices />
      </section>

      {/* About Section */}
      <section data-aos="fade-left" data-aos-delay="400">
        <About />
      </section>

      {/* Subs Section */}
      <section data-aos="zoom-in" data-aos-delay="600">
        <Subs />
      </section>
    </main>
  );
};

export default Home;
