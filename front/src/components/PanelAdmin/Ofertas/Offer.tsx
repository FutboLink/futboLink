"use client"
import React, { useState } from 'react';
import OfferStats from './OfferStats';

export default function Offer() {
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState("first"); // Puede ser "first" o "second"

  // Función para manejar el cambio de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="p-4 ">
      {/* Pestañas */}
      <div className="flex space-x-4">
      
        <button
          onClick={() => handleTabChange("second")}
          className={`px-4 py-2 ${activeTab === "second" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"} rounded`}
        >
         Datos de Ofertas
        </button>
      </div>

      {/* Contenido según la pestaña activa */}
      <div>
      
          <OfferStats/>
        
      </div>
    </div>
  );
}
