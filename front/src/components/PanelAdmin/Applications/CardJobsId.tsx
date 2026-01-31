import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import type { IOfferCard } from "@/Interfaces/IOffer";

// Truncate description to reduce memory usage
const truncateText = (text: string, maxLength: number = 150): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

const CardJobsId: React.FC<{ offer: IOfferCard }> = ({ offer }) => {
  // Memoize truncated description to avoid recalculating on every render
  const truncatedDescription = useMemo(
    () => truncateText(offer.description || "", 150),
    [offer.description]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:cursor-pointer h-full">
      {/* Contenedor de la imagen y el contenido */}
      <div className="flex flex-col sm:flex-row items-center p-4 sm:p-6 space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Imagen de la oferta */}
        <div className="w-28 h-28 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden relative">
          <Image
            width={80}
            height={80}
            src={offer.imgUrl || "/cursosYFormaciones.JPG"}
            alt={offer.title}
            className="w-full h-full object-cover"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQADAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            sizes="(max-width: 640px) 112px, 80px"
            quality={75}
          />
        </div>

        {/* Contenido (título, ubicación, etc.) */}
        <div className="flex flex-col justify-between flex-grow space-y-2 text-center sm:text-left">
          {/* Título */}
          <h3 className="font-semibold hover:text-green-700 text-gray-700 rounded p-2 w-full transition-colors text-lg sm:text-xl line-clamp-2">
            {offer.title}
          </h3>
        </div>
      </div>

      {/* Descripción y Salario */}
      <div className="p-4 border-t border-gray-100 flex-grow text-center sm:text-left">
        <p className="text-gray-700 text-sm mb-2 line-clamp-3">
          {truncatedDescription}
        </p>

        <div className="text-gray-700 text-sm font-semibold flex items-center justify-center sm:justify-start mb-1">
          <span className="mr-2">🌍</span>
          <span className="truncate">{offer.nationality}</span>
        </div>

        <div className="text-gray-700 text-sm font-semibold flex items-center justify-center sm:justify-start mb-1">
          <span className="mr-2">📍</span>
          <span className="truncate">{offer.location}</span>
        </div>

        <p className="text-gray-800 text-sm font-semibold mt-3">
          Salario: <span className="text-verde-oscuro">${offer.salary}</span>
        </p>
      </div>

      {/* Acciones y botones */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 text-center justify-center items-center w-full mt-auto border-t border-gray-100">
        <Link
          href={`/jobs/${offer.id}`}
          className="w-full sm:w-auto text-gray-700 border-2 border-gray-700 rounded-lg px-6 py-2 hover:text-white hover:bg-[#1d5126] font-semibold transition-colors duration-200"
        >
          Detalles
        </Link>
        <Link
          href={`/applications/jobs/${offer.id}`}
          className="w-full sm:w-auto text-white bg-[#1d5126] rounded-lg px-6 py-2 hover:text-[#1d5126] hover:border-2 hover:bg-white hover:border-[#1d5126] font-semibold transition-colors duration-200"
        >
          Postulaciones
        </Link>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(CardJobsId, (prevProps, nextProps) => {
  // Only re-render if the offer id changes or key properties change
  return (
    prevProps.offer.id === nextProps.offer.id &&
    prevProps.offer.title === nextProps.offer.title &&
    prevProps.offer.description === nextProps.offer.description &&
    prevProps.offer.imgUrl === nextProps.offer.imgUrl &&
    prevProps.offer.salary === nextProps.offer.salary &&
    prevProps.offer.location === nextProps.offer.location &&
    prevProps.offer.nationality === nextProps.offer.nationality
  );
});
