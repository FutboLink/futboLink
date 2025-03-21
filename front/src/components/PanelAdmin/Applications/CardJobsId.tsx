import React from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import Image from "next/image";
import Link from "next/link";

const CardJobsId: React.FC<{ offer: IOfferCard }> = ({ offer }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-w-sm mx-auto transition-all hover:shadow-2xl shadow:gray-200 hover:cursor-pointer h-full">
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
        <div className="flex flex-col justify-between flex-grow space-y-2">
          {/* Título */}
          <h3 className="font-semibold  hover:text-green-700 text-gray-700 rounded p-2 w-full transition-colors">
            {offer.title}
          </h3>
        </div>
      </div>

      {/* Descripción y Salario */}
      <div className="p-4 border-t border-gray-100 flex-grow">
        <p className="text-gray-700 text-sm">
          {offer.description}
        </p>

        <div className="text-gray-700 text-sm font-semibold flex items-center">
          <span className="mr-2">🌍</span>
          {offer.nationality}
        </div>

        <div className="text-gray-700 text-sm font-semibold flex items-center">
          <span className="mr-2">📍</span>
          {offer.location}
        </div>

        <p className="text-gray-800 text-sm font-semibold text-center mt-2">
          Salario: <span className="text-verde-oscuro">${offer.salary}</span>
        </p>
      </div>

      {/* Acciones y botones */}
      <div className="flex gap-4 p-1 text-center justify-between mt-auto border-t border-gray-100">
  <Link
    href={`/jobs/${offer.id}`}
    className="text-gray-700 border-2 border-gray-700 rounded-lg px-3 py-1 hover:border-2 hover:text-white hover:bg-gray-700 font-semibold transition-colors duration-200"
  >
    Detalles
  </Link>
  <Link 
  href={`/applications/jobs/${offer.id}`} 
  className="text-white bg-gray-700 rounded-lg px-3 py-1 hover:text-gray-700 hover:border-2 hover:bg-white hover:border-gray-700 font-semibold transition-colors duration-200"
>
  Postulaciones
</Link>

</div>

    </div>
  );
};

export default CardJobsId;
