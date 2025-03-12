"use client";
import React, { useEffect, useState } from "react";
import CardOffer from "./CardOffer";
import { IOfferCard } from "@/Interfaces/IOffer";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import { mockOffers } from "./mockOfferts";

const OfferList: React.FC = () => {
  const [offers, setOffers] = useState<IOfferCard[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<IOfferCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      const data = await getOfertas();
      setOffers(data);
      setFilteredOffers(data); // Mostrar todas las ofertas al inicio
      setLoading(false);
    };
    fetchOffers();
  }, []);

  // Filtrar ofertas en tiempo real
  useEffect(() => {
    const filtered = offers.filter((offer) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        offer.contractTypes?.toLowerCase().includes(lowerSearchTerm) ||
        offer.position?.toLowerCase().includes(lowerSearchTerm) ||
        offer.location?.toLowerCase().includes(lowerSearchTerm)
      );
    });
    setFilteredOffers(filtered);
  }, [searchTerm, offers]);

  if (loading) {
    return (
      <p className="text-center text-gray-600 mt-28">Cargando ofertas...</p>
    );
  }

  return (
    <div className="mt-12 p-12">
      <h1 className="bg-green-600 text-white p-2 font-semibold text-center">OFERTAS LABORALES</h1>
      {/* Input de búsqueda */}
      <div className="flex justify-center items-center mb-6">
        <div className="w-full sm:w-4/6 md:w-3/6 lg:w-2/6 p-4">
          <input
            type="text"
            placeholder="Buscar por tipo de oferta, posición o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
          />
        </div>
      </div>


      {/* Lista de ofertas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {filteredOffers.length > 0
          ? filteredOffers.map((offer) => (
              <CardOffer key={offer.id} offer={offer} />
            ))
          : mockOffers.map((offer, index) => (
              <CardOffer key={index} offer={offer} />
            ))}
      </div>
    </div>
  );
};

export default OfferList;
