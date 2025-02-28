import React from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import Image from "next/image";
import Link from "next/link";

const CardOffer: React.FC<{ offer: IOfferCard }> = ({ offer }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden flex flex-col min-h-[400px]"> {/* Añadido min-h */}
      {/* Contenedor de la imagen y el contenido */}
      <div className="flex items-center p-4 space-x-4">
        {/* Imagen de la oferta */}
        <div className="w-24 h-24 flex-shrink-0">
          <Image
            width={100}
            height={100}
            src={offer.imgUrl || "/cursosYFormaciones.JPG"}
            alt={offer.title}
            className="w-full h-full object-cover rounded-lg" 
          />
        </div>

        {/* Contenido (título, ubicación, etc.) */}
        <div className="flex flex-col justify-between flex-grow">
          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-800">{offer.title}</h3>

          {/* Ubicación */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Ubicación:</span>
            <span>{offer.location}</span>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="px-4 py-2 flex-grow">
        <p className="text-gray-600 text-sm line-clamp-2">{offer.description}</p>
      </div>

      {/* Competencias */}
      <div className="flex flex-wrap gap-2 p-4 flex-grow">
        {offer.competencies.map((competency, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 flex justify-center items-center text-xs font-semibold px-2 py-1 rounded-xl"
          >
            {competency}
          </span>
        ))}
      </div>

      {/* Salario */}
      <div className="p-4">
        <p className="text-gray-800 text-sm font-semibold">
          Salario: <span className="text-green-600">${offer.salary}</span>
        </p>
      </div>

      {/* Acciones y botones */}
      <div className="flex gap-4 p-4 text-center justify-between mt-auto">
        <Link
          href={`/jobs/${offer.id}`}
          className="text-white bg-green-700 rounded p-2 hover:text-green-700 hover:bg-white hover:border-2 hover:border-green-700 font-semibold self-start"
        >
          Ver más
        </Link>
        <Link
          href={`/jobs/${offer.id}`}
          className="text-white bg-green-700 rounded p-2 hover:text-green-700 hover:bg-white hover:border-2 hover:border-green-700 font-semibold self-start"
        >
          Aplicar a esta oferta
        </Link>
      </div>
    </div>
  );
};

export default CardOffer;
