"use client";

import React, { useState, useMemo } from "react";
import helpersOffers from "@/helpers/helpersOffers";
import CardOffer from "@/components/Card/cardOffer";
import Filters from "@/components/filter/filter"; // Importar los filtros

const OffersPage = () => {
  const offers = helpersOffers;

  // Crear listas únicas de ubicaciones y categorías para los filtros
  const locations = useMemo(() => {
    const uniqueLocations = new Set(offers.map((offer) => offer.location));
    return Array.from(uniqueLocations);
  }, [offers]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      offers.map((offer) => offer.title.split(" ")[0]) // Usamos el primer término del título como categoría simple
    );
    return Array.from(uniqueCategories);
  }, [offers]);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Filtrar ofertas según los filtros seleccionados
  const filteredOffers = offers.filter((offer) => {
    const matchesLocation =
      selectedLocation === "" || offer.location === selectedLocation;
    const matchesCategory =
      selectedCategory === "" || offer.title.includes(selectedCategory);
    return matchesLocation && matchesCategory;
  });

  return (
    <main className="p-6 mt-32 text-black">
      <div className="m-10">
        <h1 className="text-3xl text-center font-bold mb-4">
          Ofertas Disponibles
        </h1>

        {/* Filtros */}
        <Filters
          locations={locations}
          categories={categories}
          selectedLocation={selectedLocation}
          selectedCategory={selectedCategory}
          onLocationChange={setSelectedLocation}
          onCategoryChange={setSelectedCategory}
        />

        {/* Lista de ofertas filtradas */}
        <div className="grid grid-cols-1 mt-20 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <CardOffer key={offer.id} offer={offer} />
            ))
          ) : (
            <p>No se encontraron ofertas que coincidan con los filtros.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default OffersPage;
