"use client";
import React, { useEffect, useState, useMemo } from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import CardJobsId from "./CardJobsId";

const AllApplications: React.FC = () => {
  const [offers, setOffers] = useState<IOfferCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 20; // Limitar items por página para reducir memoria

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const data = await getOfertas();
        // Limitar a máximo 100 ofertas en memoria para reducir uso
        setOffers(data.slice(0, 100));
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  // Filtrar y paginar ofertas usando useMemo para optimizar memoria
  const filteredOffers = useMemo(() => {
    if (!searchTerm) {
      return offers;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return offers.filter((offer) => {
      return (
        offer.contractTypes?.toLowerCase().includes(lowerSearchTerm) ||
        offer.position?.toLowerCase().includes(lowerSearchTerm) ||
        offer.location?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [searchTerm, offers]);

  // Paginar resultados
  const paginatedOffers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOffers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOffers, currentPage]);

  const totalPages = Math.ceil(filteredOffers.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <p className="text-center text-gray-600 mt-28">Cargando ofertas...</p>
    );
  }

  return (
    <div className="p-4 mt-2">
      <h1 className="bg-verde-oscuro text-white p-2 font-semibold text-center">
        OFERTAS LABORALES
      </h1>
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

      {/* Lista de ofertas paginada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {paginatedOffers.length > 0 ? (
          paginatedOffers.map((offer) => (
            <CardJobsId key={offer.id} offer={offer} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">
            {searchTerm ? "No se encontraron ofertas con ese criterio" : "No hay ofertas disponibles"}
          </p>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default AllApplications;
