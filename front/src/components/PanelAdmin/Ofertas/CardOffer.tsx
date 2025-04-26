import React, { useContext, useState } from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import Image from "next/image";
import Link from "next/link";
import ModalApplication from "@/components/Applications/ModalApplications";
import { UserContext } from "@/components/Context/UserContext";
import Notification from "./Notification";

const CardOffer: React.FC<{ offer: IOfferCard }> = ({ offer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false); 
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

  const handleApplyClick = () => {
    if (!token) {
      setShowNotification(true); // Mostrar la notificación si no hay token
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseNotification = () => {
    setShowNotification(false); // Cerrar la notificación
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg w-full max-w-[300px] min-h-[450px] shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary">
      {/* Sección 1: Encabezado */}
      <div className="flex items-center p-4 border-b border-gray-200 flex-1">
        <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden mr-4">
          <Image
            width={80}
            height={80}
            src={offer.imgUrl || "/cursosYFormaciones.JPG"}
            alt={offer.title}
            className="w-full h-full object-contain rounded-md"
          />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800 break-words max-w-[200px] mb-2">
            {offer.title}
          </h3>
        </div>
      </div>

      {/* Sección 2: Datos en columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 p-3 gap-2 text-xs text-gray-600 flex-1">
        <div className="space-y-1">
          <p><span className="font-semibold text-gray-800">Posición:</span> {offer.position}</p>
          <p><span className="font-semibold text-gray-800">Ubicación:</span> {offer.nationality}</p>
          <p><span className="font-semibold text-gray-800">Categoría:</span> {offer.category}</p>
          <p><span className="font-semibold text-gray-800">Tipo de contrato:</span> {offer.contractTypes}</p>
          <p><span className="font-semibold text-gray-800">Tiempo de contrato:</span> {offer.contractDurations}</p>
        </div>
        <div className="space-y-1">
          <p><span className="font-semibold text-gray-800">Edad:</span> {offer.minAge} - {offer.maxAge}</p>
          <p><span className="font-semibold text-gray-800">Viajes:</span> {offer.availabilityToTravel ? "Sí" : "No"}</p>
          <p><span className="font-semibold text-gray-800">Pasaporte UE:</span> {offer.euPassport ? "Sí" : "No"}</p>
        </div>
      </div>

      {/* Sección 3: Descripción */}
      <div className="text-xs text-gray-600 px-4 text-justify overflow-hidden flex-1 flex flex-col justify-start">
        <div className="font-semibold text-xs text-gray-800 mb-1">Descripción de la oferta:</div>
        <p className="text-xs whitespace-pre-line">
          {offer.description}
        </p>
      </div>

      {/* Sección 4: Salario + botones */}
      <div className="flex flex-col justify-between flex-1 border-t border-gray-200">
        <div className="py-2 px-4 text-sm font-bold text-green-500 text-center">
          Salario: {offer.currencyType}{offer.salary}
        </div>
        <div className="flex flex-col gap-2 p-4">
          <Link
            href={`/jobs/${offer.id}`}
            className="text-center py-2 text-xs font-bold rounded-md text-white bg-[#1d5126] border-2 border-[#1d5126] hover:bg-[#245a2d] hover:text-white transition"
          >
            Ver más
          </Link>
          <button
            onClick={handleApplyClick}
            className="text-center py-2 text-xs font-bold rounded-md bg-gray-100 text-[#26441b] border-2 border-[#3e7c27] hover:bg-[#4e6d43] hover:text-white transition"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Mostrar notificación si el usuario no está logueado */}
      {showNotification && (
        <Notification
          message="Para aplicar a esta oferta, por favor inicia sesión primero."
          onClose={handleCloseNotification}
        />
      )}

      {/* Modal de aplicación */}
      {isModalOpen && userId && offer.id && (
        <ModalApplication
          jobId={offer.id.toString()}
          userId={userId.toString()}
          jobTitle={offer.title}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CardOffer;
