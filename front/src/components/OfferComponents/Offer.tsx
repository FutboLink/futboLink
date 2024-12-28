"use client";

import React from "react";
import CardOffer from "../Card/cardOffer";
import offers from "@/helpers/helpersOffers"; // Helper de ofertas
import Link from "next/link"; // Importar Link para redireccionar

const OffersSection = () => {
  // Solo mostrar las primeras 4 ofertas
  const firstFourOffers = offers.slice(0, 4);

  return (
    <section className="relative z-10 px-4 py-16 bg-white text-black">
      <h1 className="text-center text-3xl font-semibold text-gray-800 mb-8">
        Ofertas Destacadas
      </h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {firstFourOffers.map((offer) => (
          <CardOffer key={offer.id} offer={offer} />
        ))}
      </div>

      {/* Botón para ver más ofertas */}
      <div className="flex justify-center mt-6">
        <Link href="/offer/page">
          <button className="px-6 py-3 -600 text-green-600 hover:text-green-700 rounded-lg hover:-700 transition duration-300">
            Ver Más Ofertas
          </button>
        </Link>
      </div>

      <hr className="border-t-2 mt-14 border-gray-300 my-4" />
    </section>
  );
};

export default OffersSection;
