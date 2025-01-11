/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo } from "react";
import Filters from "../../components/filter/filter"; // Asegúrate de importar correctamente
import offers from "@/helpers/helpersOffers"; // Asegúrate de importar correctamente

const OffersList = () => {
  const [filteredOffers, setFilteredOffers] = useState(offers);

  // Crear listas únicas de ubicaciones, categorías y contratos para los filtros
  const locations = useMemo(() => {
    const uniqueLocations = new Set(offers.map((offer) => offer.country)); // Usamos country como ubicación
    return Array.from(uniqueLocations);
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(offers.map((offer) => offer.category));
    return Array.from(uniqueCategories);
  }, []);

  const contracts = useMemo(() => {
    const uniqueContracts = new Set(offers.map((offer) => offer.contract));
    return Array.from(uniqueContracts);
  }, []);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedContract, setSelectedContract] = useState<string[]>([]);

  // Esta es la función que se pasa como 'onFilterChange'
  const handleFilterChange = (filters: {
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
        filters.positions.some(
          (position) =>
            offer.title.toLowerCase().includes(position.toLowerCase()) // Filtrando por título y puesto
        );

      return (
        matchesContract && matchesCategory && matchesLocation && matchesPosition
      );
    });

    setFilteredOffers(filtered);
  };

  return (
    <div>
      <Filters
        locations={locations}
        categories={categories}
        selectedLocation={selectedLocation}
        selectedCategory={selectedCategory}
        onLocationChange={setSelectedLocation}
        onCategoryChange={setSelectedCategory}
        onFilterChange={handleFilterChange}
      />

      {filteredOffers.map((offer) => (
        <div key={offer.id}>
          <h3>{offer.title}</h3>
          <p>{offer.description}</p>
          <p>{offer.country}</p>
          <p>{offer.category}</p>
          <p>{offer.contract}</p>
        </div>
      ))}
    </div>
  );
};

export default OffersList;
