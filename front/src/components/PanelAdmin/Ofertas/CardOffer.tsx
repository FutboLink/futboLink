import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { useUserContext } from "@/hook/useUserContext";
import type { IOfferCard } from "@/Interfaces/IOffer";
import Notification from "./Notification";
import { FaMoneyBillWave } from "react-icons/fa";
import { LuSend } from "react-icons/lu";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";

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
    <div className="flex flex-col bg-white border border-gray-200 rounded-2xl w-full min-h-[320px] shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#3e7b26]">
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
          <h3 className="text-[1.05rem] font-semibold leading-6 text-gray-900 break-words">
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
          <p className="flex items-center gap-1.5">
  <span className="font-semibold text-gray-800">
    País:
  </span>

  {offer.countries && offer.countries.length > 0 ? (
    <span className="flex items-center gap-2 flex-wrap">
      {offer.countries.map((country) => (
        <span key={country} className="inline-flex items-center gap-1 leading-none">
          {renderCountryFlag(country)}
          <span>{country}</span>
        </span>
      ))}
    </span>
  ) : (
      <span className="inline-flex items-center gap-1 leading-none">
      {renderCountryFlag(offer.nationality)}
      <span>{offer.nationality}</span>
    </span>
  )}
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

      {/* Salario + botones */}
      <div className="flex flex-col mt-auto border-t border-gray-200">
        <div className="flex justify-center py-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 font-semibold shadow-sm">
          
        <FaMoneyBillWave className="text-green-600" />
          
   <span>
      {offer.currencyType}
      {offer.salary}
    </span>
          
  </div>
</div>
        <div className="flex space-x-2 p-3">
          <Link
            href={`/jobs/${offer.id}`}
            className="flex-1 flex items-center justify-center py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all duration-200"
          >
            Ver más
          </Link>
          <button
            type="button"
            onClick={handleApplyClick}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#15803d] text-white font-semibold text-sm shadow-md hover:bg-[#166534] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <>
  <LuSend size={16} />

  <span>
    {role === "RECRUITER" || role === "AGENCY"
      ? "Ofrecer Candidato"
      : "Aplicar ahora"}
  </span>
</>
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
