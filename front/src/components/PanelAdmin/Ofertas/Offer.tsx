"use client"
import React, { useState } from 'react';
import OfferStats from './OfferStats';
import ManageOffers from './ManageOffers';

export default function Offer() {
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState("stats"); // Puede ser "stats" o "manage"

  // Función para manejar el cambio de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="p-4">
      {/* Pestañas */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => handleTabChange("stats")}
          className={`px-4 py-2 ${activeTab === "stats" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"} rounded`}
        >
          Datos de Ofertas
        </button>
        <button
          onClick={() => handleTabChange("manage")}
          className={`px-4 py-2 ${activeTab === "manage" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"} rounded`}
        >
          Gestionar Ofertas
        </button>
      </div>

      {/* Contenido según la pestaña activa */}
      <div>
        {activeTab === "stats" && <OfferStats />}
        {activeTab === "manage" && <ManageOffers />}
      </div>
    </div>
  );
}
