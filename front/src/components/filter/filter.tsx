import React, { useState, useEffect } from "react";
import { IFiltersProps } from "@/Interfaces/IFilter";
import { positionOptions as jobPositionOptions } from "@/helpers/jobs";

const Filters = ({
  locations,
  selectedLocation,
  onLocationChange,
  onFilterChange,
}: IFiltersProps) => {
  const [selectedContracts, setSelectedContracts] = useState<string>("");
  const [selectedPositions, setSelectedPositions] = useState<string>("");

  const contractOptions = [
    "Contrato profesional",
    "Otro tipo de contrato",
    "Contrato de patrocinio",
    "Contrato de cesión o préstamo",
    "Contrato de representación",
  ];

  const positionOptions = jobPositionOptions;

  const handleContractChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedContracts(event.target.value);
  };

  const handlePositionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedPositions(event.target.value);
  };

  const handleLocationChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onLocationChange(event.target.value);
  };

  useEffect(() => {
    onFilterChange({
      contracts: selectedContracts ? [selectedContracts] : [],
      positions: selectedPositions ? [selectedPositions] : [],
      location: selectedLocation,
      country: "",
      category: "",
    });
  }, [selectedContracts, selectedPositions, selectedLocation, onFilterChange]);

  return (
    <div className="p-6 bg-white text-black shadow-lg rounded-lg space-y-6">
      {/* Tipo de contrato */}
      <div>
        <h3 className="font-semibold text-lg text-gray-800 mb-4">
          Tipo de contrato
        </h3>
        <select
          value={selectedContracts}
          onChange={handleContractChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona un tipo de contrato</option>
          {contractOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Ubicación */}
      <div>
        <h3 className="font-semibold text-lg text-gray-800 mb-4">Ubicación</h3>
        <select
          value={selectedLocation}
          onChange={handleLocationChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona una ubicación</option>
          {locations.map((location, index) => (
            <option key={index} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {/* Puesto */}
      <div>
        <h3 className="font-semibold text-lg text-gray-800 mb-4">Puesto</h3>
        <select
          value={selectedPositions}
          onChange={handlePositionChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona un puesto</option>
          {positionOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Filters;
