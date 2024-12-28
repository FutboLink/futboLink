"use client";

import React, { useState } from "react";
import CardOffer from "../Card/cardOffer";
import offers from "@/helpers/helpersOffers"; // Helper de ofertas

const OffersSection = () => {
  // Página actual, comenzando desde la 1
  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 4; // Mostrar 8 ofertas por página

  // Calcular el índice de las ofertas que se mostrarán en la página actual
  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = offers.slice(indexOfFirstOffer, indexOfLastOffer);

  // Función para cambiar la página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(offers.length / offersPerPage);

  return (
    <section className="relative z-10 px-4 py-16 bg-white text-black">
      <h1 className="text-center text-3xl font-semibold text-gray-800 mb-8">
        Ofertas Destacadas
      </h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {currentOffers.map((offer) => (
          <CardOffer key={offer.id} offer={offer} />
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-6">
        {/* Botón Anterior */}
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Anterior
        </button>

        {/* Muestra la página actual */}
        <span className="px-4 py-2">{`Página ${currentPage} de ${totalPages}`}</span>

        {/* Botón Siguiente */}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      <hr className="border-t-2 mt-14 border-gray-300 my-4" />
    </section>
  );
};

export default OffersSection;
