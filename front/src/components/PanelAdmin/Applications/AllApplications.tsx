"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import CardJobsId from "./CardJobsId";

const AllApplications: React.FC = () => {
  const [offers, setOffers] = useState<IOfferCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 12; // Reduced from 20 to 12 for better memory management

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const data = await getOfertas();
        // Limit to 50 offers initially to reduce memory usage
        // Only store essential data
        const limitedData = data.slice(0, 50).map((offer) => ({
          ...offer,
          // Truncate description at source to reduce memory
          description: offer.description?.substring(0, 200) || "",
        }));
        setOffers(limitedData);
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  // Memoize search handler to prevent unnecessary re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Filtrar y paginar ofertas usando useMemo para optimizar memoria
  const filteredOffers = useMemo(() => {
    if (!searchTerm.trim()) {
      return offers;
    }
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return offers.filter((offer) => {
      return (
        offer.contractTypes?.toLowerCase().includes(lowerSearchTerm) ||
        offer.position?.toLowerCase().includes(lowerSearchTerm) ||
        offer.location?.toLowerCase().includes(lowerSearchTerm) ||
        offer.title?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [searchTerm, offers]);

  // Paginar resultados - only compute what's needed
  const paginatedOffers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOffers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOffers, currentPage, ITEMS_PER_PAGE]);

  const totalPages = useMemo(
    () => Math.ceil(filteredOffers.length / ITEMS_PER_PAGE),
    [filteredOffers.length, ITEMS_PER_PAGE]
  );

  // Memoize pagination handlers
  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

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
            onChange={handleSearchChange}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
          />
        </div>
      </div>

      {/* Lista de ofertas paginada - Using React.memo in CardJobsId prevents unnecessary re-renders */}
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
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={handleNextPage}
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
