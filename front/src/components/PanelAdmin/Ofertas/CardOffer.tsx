import React from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import Image from "next/image";
import Link from "next/link";

const CardOffer: React.FC<{ offer: IOfferCard }> = ({ offer }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden flex flex-col max-w-sm mx-auto transition-all hover:shadow-2xl hover:scale-105 duration-300">
      {/* Contenedor de la imagen y el contenido */}
      <div className="flex items-center p-6 space-x-4">
        {/* Imagen de la oferta */}
        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            width={80}
            height={80}
            src={offer.imgUrl || "/cursosYFormaciones.JPG"}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        </div>
  
        {/* Contenido (título, ubicación, etc.) */}
        <div className="flex flex-col justify-between flex-grow space-y-3">
          {/* Título */}
          <h3 className="text-2xl font-semibold text-gray-700 hover:text-green-700 transition-colors">
            {offer.title}
          </h3>
  
          {/* Información adicional */}
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Nacionalidad:</strong> {offer.nationality}</p>
            <p><strong>Posición:</strong> {offer.position}</p>
            <p><strong>Categoría:</strong> {offer.category}</p>
            <p><strong>Géneros Deportivos:</strong> {offer.sportGenres}</p>
            <p><strong>Tipo de contrato:</strong> {offer.contractType}</p>
            <p><strong>Duración del contrato:</strong> {offer.contractDuration}</p>
          </div>
        </div>
      </div>
  
      {/* Descripción y Salario */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-gray-700 text-sm">
          {offer.description}
        </p>
        <p className="text-gray-800 text-sm font-semibold text-center mt-2">
          Salario: <span className="text-green-600">${offer.salary}</span>
        </p>
      </div>
  
      {/* Acciones y botones */}
      <div className="flex gap-4 p-1 text-center justify-between mt-auto border-t border-gray-100">
        <Link
          href={`/jobs/${offer.id}`}
          className="text-white bg-green-600 rounded-lg p-2 hover:bg-white hover:text-green-600 hover:border-2 hover:border-green-600 font-semibold transition-colors duration-200"
        >
          Ver más
        </Link>
        <Link
          href={`/jobs/${offer.id}`}
          className="text-white bg-green-600 rounded-lg p-2 hover:bg-white hover:text-green-600 hover:border-2 hover:border-green-600 font-semibold transition-colors duration-200"
        >
          Aplicar a esta oferta
        </Link>
      </div>
    </div>
  );
  
};

export default CardOffer;
