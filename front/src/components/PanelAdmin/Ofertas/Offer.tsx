"use client"
import React, { useState } from 'react';
import OfferStats from './OfferStats';
import ManageOffers from './ManageOffers';
import OfferAnalytics from "./OfferAnalytics";

export default function Offer() {
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState("stats"); // Puede ser "stats" o "manage"

  // Función para manejar el cambio de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

return (
  <div>

    {/* Pestañas */}
    <div className="flex gap-4 mb-6">

      <button
        onClick={() => handleTabChange("stats")}
        className={`px-4 py-2 ${
          activeTab === "stats"
            ? "bg-green-700 text-white"
            : "bg-gray-200 text-gray-700"
        } rounded`}
      >
        Datos de Ofertas
      </button>

      <button
        onClick={() => handleTabChange("manage")}
        className={`px-4 py-2 ${
          activeTab === "manage"
            ? "bg-green-700 text-white"
            : "bg-gray-200 text-gray-700"
        } rounded`}
      >
        Gestionar Ofertas
      </button>

      <button
        onClick={() => handleTabChange("analytics")}
        className={`px-4 py-2 ${
          activeTab === "analytics"
            ? "bg-green-700 text-white"
            : "bg-gray-200 text-gray-700"
        } rounded`}
      >
        Analytics
      </button>
    </div>

    {/* Contenido según la pestaña activa */}
    
    <div>
      {activeTab === "stats" && <OfferStats />}
      {activeTab === "manage" && <ManageOffers />}
      {activeTab === "analytics" && <OfferAnalytics />}
</div>

</div>
);
}
