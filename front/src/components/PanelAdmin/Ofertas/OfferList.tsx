"use client";
import React, { useContext, useEffect, useState } from "react";
import CardOffer from "./CardOffer";
import { IOfferCard } from "@/Interfaces/IOffer";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import { UserContext } from "@/components/Context/UserContext";
import ModalApplication from "@/components/Applications/ModalApplications";

const OfferList: React.FC = () => {
  const [offers, setOffers] = useState<IOfferCard[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<IOfferCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [contractTypeFilter, setContractTypeFilter] = useState<string>("");
  const [positionFilter, setPositionFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToken, setIsTokene] = useState(false);
  const [isOffer, setIsOffer] = useState<IOfferCard>();
  const { token } = useContext(UserContext);

  const decodeToken = (token: string) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  const userId = token ? decodeToken(token).id : null;

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
    "Abogado",
    "Administrativo",
    "Agente",
    "Árbitro",
    "Analista",
    "Científico Deportivo",
    "Coordinador",
    "Comercial",
    "Delegado",
    "Director Deportivo",
    "Director de Negocio",
    "Director Técnico",
    "Diseñador Gráfico",
    "Editor Multimedia",
    "Entrenador",
    "Entrenador de Porteros",
    "Ejecutivo",
    "Fisioterapeuta",
    "Finanzas",
    "Gerente",
    "Inversor",
    "Jefe de Reclutamiento",
    "Jugador",
    "Marketing Digital",
    "Médico",
    "Nutricionista",
    "Ojeador Scout",
    "Periodista",
    "Preparador Físico",
    "Profesor",
    "Psicólogo",
    "Recursos Humanos",
    "Representante",
    "Terapeuta",
    "Utillero",
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

  const sortedOffers = filteredOffers.slice().sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleApplyClick = (offer: string | undefined) => {
    const findOffer = sortedOffers.find((el) => el.id === offer);
    setIsOffer(findOffer);

    if (token) {
      setIsModalOpen(true); // Mostrar la notificación si no hay token
      setIsTokene(false);
      return;
    }
    setIsModalOpen(true);
    setIsTokene(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-[80vh] mt-12 p-4 pt-[4rem] sm:p-6 sm:pt-[4rem] lg:p-12">
      <h1 className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white text-[1.8rem] p-2 font-semibold text-center">
        OFERTAS LABORALES
      </h1>

      <div className="flex flex-col gap-4 justify-between w-full py-[1.5rem] max-w-[100rem] mx-auto md:flex-row">
        {/* Filtros */}
        <div className="flex flex-wrap justify-end gap-4 lg:flex-nowrap">
          {/* Filtro por tipo de contrato */}

          <select
            value={contractTypeFilter}
            onChange={(e) => setContractTypeFilter(e.target.value)}
            className="w-full md:max-w-[15rem] md:min-w-[12rem] p-2 border border-gray-300 rounded-md text-gray-700"
          >
            <option value="">Tipo de contrato</option>
            {contractTypes.map((contractType) => (
              <option key={contractType} value={contractType}>
                {contractType}
              </option>
            ))}
          </select>

          {/* Filtro por posición */}

          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="w-full md:max-w-[15rem] md:min-w-[12rem] p-2 border border-gray-300 rounded-md text-gray-700"
          >
            <option value="">Posición</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex justify-center items-center w-full md:max-w-[20rem] sm:text-xs md:text-md lg:text-md">
          <input
            type="text"
            placeholder="Buscar por oferta por título, posición o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 max-w-[100rem] mx-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-4">
        {sortedOffers.length > 0 ? (
          sortedOffers.map((offer) => (
            <CardOffer
              handleApplyClick={() => handleApplyClick(offer.id)}
              key={offer.id}
              offer={offer}
            />
          ))
        ) : (
          <p className="text-gray-700 text-[1.2rem]">
            No se encontraron ofertas.
          </p>
        )}
        {/* Modal de aplicación */}
        {isModalOpen && isOffer?.id && (
          <ModalApplication
            jobId={isOffer?.id?.toString()}
            userId={userId ? userId.toString() : ""}
            jobTitle={isOffer?.title}
            isOffer={isOffer}
            typeMessage={isToken}
            onClose={handleCloseModal}
          />
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-400"></div>
        </div>
      )}
    </div>
  );
};

export default OfferList;
