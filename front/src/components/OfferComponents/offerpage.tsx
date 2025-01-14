/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useCallback } from "react";
import helpersOffers from "@/helpers/helpersOffers";
import CardOffer from "@/components/Card/cardOffer";
import Filters from "@/components/filter/filter";
import { IOffer } from "@/Interfaces/IOffer";
import OfferDescription from "./OfferDescription";
import OfferInit from "./OfferInit";

const OffersPage = () => {
  const offers: IOffer[] = helpersOffers;

  const locations = Array.from(new Set(offers.map((offer) => offer.country)));
  const categories = Array.from(new Set(offers.map((offer) => offer.category)));

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);

  const [filteredOffers, setFilteredOffers] = useState<IOffer[]>(offers);

  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const offersPerPage = 6; // Número de ofertas por página

  const handleFilterChange = useCallback(
    (filters: {
      contracts: string[];
      positions: string[];
      country: string;
      location: string;
      category: string;
    }) => {
      const filtered = offers.filter((offer) => {
        const matchesContract =
          filters.contracts.length === 0 ||
          filters.contracts.some((contract) =>
            offer.contract.toLowerCase().includes(contract.toLowerCase())
          );
        const matchesCategory =
          !filters.category ||
          offer.category.toLowerCase().includes(filters.category.toLowerCase());
        const matchesLocation =
          !filters.location ||
          offer.country.toLowerCase().includes(filters.location.toLowerCase());
        const matchesPosition =
          filters.positions.length === 0 ||
          filters.positions.some((position) =>
            offer.title.toLowerCase().includes(position.toLowerCase())
          );

        return (
          matchesContract &&
          matchesCategory &&
          matchesLocation &&
          matchesPosition
        );
      });

      setFilteredOffers(filtered);
    },
    [offers]
  );

  useEffect(() => {
    handleFilterChange({
      contracts: selectedContracts,
      positions: [], // Si tienes un filtro de posiciones, deberías manejarlo
      country: "", // Si tienes un filtro por país, también debes pasarlo
      location: selectedLocation,
      category: selectedCategory,
    });
  }, [
    selectedLocation,
    selectedCategory,
    selectedContracts,
    handleFilterChange,
  ]);

  // Calcular las ofertas a mostrar para la página actual
  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = filteredOffers.slice(
    indexOfFirstOffer,
    indexOfLastOffer
  );

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Total de páginas
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredOffers.length / offersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex mt-20 text-black gap-8 p-8 flex-col">
      <OfferInit />
      <h1 className="text-center text-4xl font-semibold text-gray-800 mb-4">
        Ofertas de Empleo
      </h1>
      <p className="text-center text-lg text-gray-500">
        Explora las mejores oportunidades disponibles para futbolistas,
        entrenadores y más.
      </p>

      <div className="flex">
        <div className="w-full sm:w-1/4 max-w-xs p-4">
          <Filters
            locations={locations}
            categories={categories}
            selectedLocation={selectedLocation}
            selectedCategory={selectedCategory}
            onLocationChange={setSelectedLocation}
            onCategoryChange={setSelectedCategory}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Contenedor de Ofertas */}
        <div className="flex flex-col gap-8 w-full sm:w-3/4">
          {currentOffers.map((offer: IOffer) => (
            <div key={offer.id}>
              <CardOffer offer={offer} />
            </div>
          ))}
        </div>
      </div>

      {/* Paginado */}
      <div className="flex justify-center">
        <ul className="flex space-x-2">
          {pageNumbers.map((number) => (
            <li key={number}>
              <button
                onClick={() => paginate(number)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {number}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Pasa las ofertas filtradas a OfferDescription */}
      <OfferDescription />
    </div>
  );
};

export default OffersPage;
