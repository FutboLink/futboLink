import React from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import Image from "next/image";
import Link from "next/link";

const CardOffer: React.FC<{ offer: IOfferCard }> = ({ offer }) => {
  console.log(offer.imgUrl); // Verifica el valor aquí

  return (
    <div className="bg-white border hover:cursor-pointer border-gray-300 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl flex flex-col h-full">
      {/* Imagen de la oferta */}
      <Image
  width={500}
  height={500}
  src={offer.imgUrl || "/cursosYFormaciones.JPG"}
  alt={offer.title}
  className="w-full aspect-w-16 aspect-h-9 object-cover rounded-lg shadow-md"
/>



      <div className="flex flex-col p-6 gap-4 flex-grow">
        {/* Ubicación */}
        <div className="flex items-center gap-2">
          <p className="text-gray-800 text-sm font-medium">Ubicación del puesto:</p>
          <span className="text-gray-700 text-sm font-medium">{offer.location}</span>
        </div>

        {/* Título y descripción */}
        <h3 className="text-xl font-semibold text-gray-800">{offer.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3">{offer.description}</p>

        {/* Competencias */}
        <div className="flex flex-wrap gap-2 mt-4">
          {offer.competencies.map((competency, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full"
            >
              {competency}
            </span>
          ))}
        </div>

        {/* Salario */}
        <div className="mt-4">
          <p className="text-gray-800 text-sm font-semibold">
            Salario:{" "}
            <span className="text-green-600">${offer.salary}</span>
          </p>
        </div>
      </div>

      {/* Acciones y botones */}
      <div className="flex gap-7 p-3 text-center justify-between mt-auto">
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
