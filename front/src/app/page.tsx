// app/page.tsx
import React from "react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa"; // Importando los íconos de react-icons
import CardOffer from "@/components/Offer/Offer";
import About from "@/components/AboutUs/about";
import Notices from "@/components/Notices/notices";
import Subs from "@/components/Subs/subs";
import Navbar from "@/components/navbar/navbarHome";

const Home = () => {
  return (
    <main className="bg-green-600 text-white relative overflow-hidden">
      <Navbar />
      {/* Header Section */}
      <header className="relative flex flex-col items-center justify-center min-h-screen text-center">
        <div className="absolute top-0 left-0 w-full h-full">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            src="/video.mp4" // Ruta del video dentro de la carpeta public
          ></video>
        </div>

        {/* Overlay for the Header */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Header Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold">Futbol Career</h1>
          <p className="mt-4 text-lg md:text-2xl">
            Encuentra oportunidades en el mundo del fútbol.
          </p>

          {/* Slogan */}
          <p className="mt-2 text-xl italic">
            Conectamos talento con oportunidades
          </p>

          {/* Buttons */}
          <div className="mt-6 flex gap-4">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300">
              Publicar Ofertas
            </button>
            <button className="bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-600 transition duration-300">
              Vacantes Laborales
            </button>
          </div>
        </div>
      </header>

      <section>
        <CardOffer />
      </section>

      <section>
        <Notices />
      </section>

      <section>
        <About />
      </section>

      <section>
        <Subs />
      </section>

      {/* Fixed Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50">
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/your-phone-number"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-700 text-white rounded-full p-4 shadow-lg hover:text-green-700 hover:bg-white transition duration-300"
        >
          <FaWhatsapp size={30} /> {/* WhatsApp icon from react-icons */}
        </a>

        {/* Telegram Button */}
        <a
          href="https://t.me/your-telegram-username"
          target="_blank"
          rel="noopener noreferrer"
          className=" text-white bg-blue-700 p-4 rounded-full shadow-lg hover:bg-white hover:text-blue-700 transition duration-300"
        >
          <FaTelegramPlane size={30} /> {/* Telegram icon from react-icons */}
        </a>
      </div>
    </main>
  );
};

export default Home;
