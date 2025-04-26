"use client";
import React, { useEffect, useState } from "react";
import CardOffer from "./CardOffer";
import { IOfferCard } from "@/Interfaces/IOffer";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";

const OfferList: React.FC = () => {
  const [offers, setOffers] = useState<IOfferCard[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<IOfferCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [contractTypeFilter, setContractTypeFilter] = useState<string>("");
  const [positionFilter, setPositionFilter] = useState<string>("");

  // Opciones de tipo de contrato
  const contractTypes = [
    "Contrato Profesional",
    "Semiprofesional",
    "Amateur",
    "Contrato de cesión",
    "Prueba",
  ];

  // Opciones de posición
  const positions = [
    "Abogado", "Administrativo", "Agente", "Árbitro", "Analista", "Científico Deportivo",
    "Coordinador", "Comercial", "Delegado", "Director Deportivo", "Director de Negocio",
    "Director Técnico", "Diseñador Gráfico", "Editor Multimedia", "Entrenador",
    "Entrenador de Porteros", "Ejecutivo", "Fisioterapeuta", "Finanzas", "Gerente",
    "Inversor", "Jefe de Reclutamiento", "Jugador", "Marketing Digital", "Médico",
    "Nutricionista", "Ojeador Scout", "Periodista", "Preparador Físico", "Profesor",
    "Psicólogo", "Recursos Humanos", "Representante", "Terapeuta", "Utillero",
  ];

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      const data = await getOfertas();
      setOffers(data);
      setFilteredOffers(data);
      setLoading(false);
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    let filtered = offers;

    // Filtro por tipo de contrato
    if (contractTypeFilter) {
      filtered = filtered.filter((offer) =>
        offer.contractTypes?.includes(contractTypeFilter)
      );
    }

    // Filtro por posición
    if (positionFilter) {
      filtered = filtered.filter((offer) =>
        offer.position?.includes(positionFilter)
      );
    }

    // Filtro por términos de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((offer) => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          offer.contractTypes?.toLowerCase().includes(lowerSearchTerm) ||
          offer.position?.toLowerCase().includes(lowerSearchTerm) ||
          offer.title?.toLowerCase().includes(lowerSearchTerm) ||
          offer.location?.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }

    setFilteredOffers(filtered);
  }, [searchTerm, contractTypeFilter, positionFilter, offers]);

  if (loading) {
    return (
      <p className="text-center text-gray-600 mt-28">Cargando ofertas...</p>
    );
  }

  const sortedOffers = filteredOffers.slice().sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="mt-12 p-4 sm:p-6 lg:p-12">
    <h1 className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white p-2 font-semibold text-center">
      OFERTAS LABORALES
    </h1>
    
    {/* Barra de búsqueda */}
    <div className="flex justify-center items-center sm:text-xs md:text-md lg:text-md mb-6">
      <div className="w-full sm:w-4/6 md:w-3/6 lg:w-2/6 p-4">
        <input
          type="text"
          placeholder="Buscar por oferta por título, posición o ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
        />
      </div>
    </div>

    {/* Filtros */}
    <div className="flex flex-wrap justify-center gap-4 mb-6">
      {/* Filtro por tipo de contrato */}
      <div className="w-full sm:w-2/6 md:w-2/6 lg:w-2/6 p-4">
        <select
          value={contractTypeFilter}
          onChange={(e) => setContractTypeFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
        >
          <option value="">Seleccionar tipo de contrato</option>
          {contractTypes.map((contractType) => (
            <option key={contractType} value={contractType}>
              {contractType}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por posición */}
      <div className="w-full sm:w-2/6 md:w-2/6 lg:w-2/6 p-4">
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
        >
          <option value="">Seleccionar posición</option>
          {positions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </div>
</div>



      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {sortedOffers.length > 0 ? (
          sortedOffers.map((offer) => <CardOffer key={offer.id} offer={offer} />)
        ) : (
          <p>No se encontraron ofertas.</p>
        )}
      </div>
    </div>
  );
};

export default OfferList;
