import React from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import Image from "next/image";
import Link from "next/link";

const CardOffer: React.FC<{ offer: IOfferCard }> = ({ offer }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col min-h-[500px] max-w-sm mx-auto">
      {/* Contenedor de la imagen y el contenido */}
      <div className="flex items-center p-6 space-x-4">
        {/* Imagen de la oferta */}
        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            width={100}
            height={100}
            src={offer.imgUrl || "/cursosYFormaciones.JPG"}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Contenido (título, ubicación, etc.) */}
        <div className="flex flex-col justify-between flex-grow space-y-2">
          {/* Título */}
          <h3 className="text-xl font-semibold text-gray-800 hover:text-green-600 transition-colors">
            {offer.title}
          </h3>

          {/* Información adicional */}
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Nacionalidad:</strong> {offer.nationality}</p>
            <p><strong>Posición:</strong> {offer.position}</p>
            <p><strong>Categoría:</strong> {offer.category}</p>
            <p><strong>Géneros Deportivos:</strong> {offer.sportGenres}</p>
            <p><strong>Tipo de contrato:</strong> {offer.contractTypes}</p>
            <p><strong>Duración del contrato:</strong> {offer.contractDurations}</p>
            <p><strong>Edad mínima:</strong> {offer.minAge}</p>
            <p><strong>Edad máxima:</strong> {offer.maxAge}</p>
            <p><strong>Disponibilidad para viajar:</strong> {offer.availabilityToTravel}</p>
            <p><strong>Pasaporte UE:</strong> {offer.euPassport}</p>
          </div>
          
          {/* Información extra */}
          {offer.extra && offer.extra.length > 0 && (
            <div className="text-sm text-gray-600">
              <strong>Información extra:</strong>
              <ul className="list-disc pl-5 space-y-1">
                {offer.extra.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Sección de transporte */}
      <div className="flex flex-wrap gap-2 p-4">
        {Array.isArray(offer.transport) && offer.transport.length > 0 ? (
          offer.transport.map((transport, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 flex justify-center items-center text-xs font-semibold px-3 py-1 rounded-xl shadow-sm"
            >
              {transport}
            </span>
          ))
        ) : (
          <p className="text-gray-500 text-sm"></p>
        )}
      </div>

      {/* Salario */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-gray-800 text-sm font-semibold">
          Salario: <span className="text-green-600">${offer.salary}</span>
        </p>
      </div>

      {/* Acciones y botones */}
      <div className="flex gap-4 p-4 text-center justify-between mt-auto border-t border-gray-200">
        <Link
          href={`/jobs/${offer.id}`}
          className="text-white bg-green-700 rounded-lg py-2 px-4 hover:bg-white hover:text-green-700 hover:border-2 hover:border-green-700 font-semibold transition-colors"
        >
          Ver más
        </Link>
        <Link
          href={`/jobs/${offer.id}`}
          className="text-white bg-green-700 rounded-lg py-2 px-4 hover:bg-white hover:text-green-700 hover:border-2 hover:border-green-700 font-semibold transition-colors"
        >
          Aplicar a esta oferta
        </Link>
      </div>
    </div>
  );
};

export default CardOffer;
