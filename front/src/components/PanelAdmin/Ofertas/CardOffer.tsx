import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { useUserContext } from "@/hook/useUserContext";
import type { IOfferCard } from "@/Interfaces/IOffer";
import Notification from "./Notification";

const CardOffer: React.FC<{
  offer: IOfferCard;
  handleApplyClick: () => void;
}> = ({ offer, handleApplyClick }) => {
  const [showNotification, setShowNotification] = useState(false);
  const { role } = useUserContext();

  const handleCloseNotification = () => {
    setShowNotification(false); // Cerrar la notificación
  };

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-2xl w-full min-h-[420px] shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#3e7b26]">
      {/* Encabezado */}
      <div className="flex items-center gap-4 p-5 border-b border-gray-100">
        <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <Image
            width={80}
            height={80}
            src={offer.imgUrl || "/cursosYFormaciones.JPG"}
            alt={offer.title}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 leading-snug">
            {offer.title}
          </h3>
        </div>
      </div>

      {/* Datos en dos columnas */}
      <div className="grid grid-cols-2 p-3 gap-2 text-xs text-gray-600">
        <div className="space-y-1">
          <p>
            <span className="font-semibold text-gray-800">Rol:</span>{" "}
            {offer.position}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Ubicación:</span>{" "}
            {offer.location}
          </p>
          <p>
            <span className="font-semibold text-gray-800">
              Países donde aplica:
            </span>{" "}
            {offer.countries ? offer.countries.join(", ") : offer.nationality}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Categoría:</span>{" "}
            {offer.category}
          </p>
          <p>
            <span className="font-semibold text-gray-800">
              Tipo de contrato:
            </span>{" "}
            {offer.contractTypes}
          </p>
        </div>
        <div className="space-y-1">
          <p>
            <span className="font-semibold text-gray-800">
              Tiempo de contrato:
            </span>{" "}
            {offer.contractDurations}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Edad:</span>{" "}
            {offer.minAge} - {offer.maxAge}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Género:</span>{" "}
            {offer.sportGenres}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Pasaporte UE:</span>{" "}
            {offer.euPassport}
          </p>
        </div>
      </div>

      {/* Descripción con altura limitada y scroll */}
      <div className="text-xs text-gray-600 px-3 pt-1 text-justify">
        <div className="font-semibold text-xs text-gray-800 mb-1">
          Descripción de la oferta:
        </div>
        <p className="text-xs whitespace-pre-line max-h-[80px] overflow-y-auto pr-1">
          {offer.description}
        </p>
      </div>

      {/* Salario + botones */}
      <div className="flex flex-col mt-auto border-t border-gray-200">
        <div className="py-2 px-3 text-sm font-bold text-green-500 text-center">
          Salario: {offer.currencyType}
          {offer.salary}
        </div>
        <div className="flex space-x-2 p-3">
          <Link
            href={`/jobs/${offer.id}`}
            className="flex-1 text-center py-1.5 text-xs font-bold rounded-md text-white bg-[#1d5126] border border-[#1d5126] hover:bg-[#245a2d] hover:text-white transition"
          >
            Ver más
          </Link>
          <button
            type="button"
            onClick={handleApplyClick}
            className="flex-1 text-center py-1.5 text-xs font-bold rounded-md bg-gray-100 text-[#26441b] border border-[#3e7c27] hover:bg-[#4e6d43] hover:text-white transition"
          >
            {role === "RECRUITER" ? "Ofrecer Candidato" : "Aplicar"}
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
    </div>
  );
};

export default CardOffer;
