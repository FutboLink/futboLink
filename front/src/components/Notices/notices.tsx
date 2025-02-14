"use client";

import React from "react";
import CardNews from "../Card/cardNotices";
import offers from "@/helpers/helperNotices"; // Helper de noticias
import Link from "next/link"; // Importar Link para redireccionar

const NoticeSection = () => {
  // Solo mostrar las primeras 4 noticias
  const firstFourOffers = offers.slice(0, 4);

  return (
    <section className="relative z-10 px-4 py-16 bg-white mt-7 text-black">
      <h1 className="text-center text-3xl font-semibold text-gray-800 mb-8">
        Últimas Noticias
      </h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {firstFourOffers.map((offer) => (
          <CardNews key={offer.id} article={offer} />
        ))}
      </div>

      {/* Botón para ver más noticias */}
      <div className="flex justify-center mt-6">
        <Link href="/Notices">
          <button className="px-6 py-3 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-100 transition duration-300">
            Ver Más Noticias
          </button>
        </Link>
      </div>

      <hr className="border-t-2 mt-14 border-gray-300 my-4" />
    </section>
  );
};

export default NoticeSection;
