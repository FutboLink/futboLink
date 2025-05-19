import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { INotice } from "@/Interfaces/INews";

const CardNews: React.FC<{ notice: INotice }> = ({ notice }) => {
  const [loading, setLoading] = useState(false);

  const handleReadMoreClick = () => {
    setLoading(true);
  };

  // Limita la descripción a 100 caracteres para el extracto
  const getExcerpt = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary h-full flex flex-col">
      {/* Imagen destacada */}
      <div className="relative h-56 w-full">
        <Image
          src={notice.imageUrl}
          alt={notice.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center"
        />
      </div>

      {/* Contenido de la noticia */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-800 mb-3 text-xl">{notice.title}</h3>
        
        <p className="text-gray-600 mb-4 flex-grow">
          {getExcerpt(notice.description)}
        </p>

        <Link
          href={`/News/${notice.id}`}
          className="mt-auto inline-block text-verde-oscuro hover:text-green-700 font-semibold text-sm border-b-2 border-transparent hover:border-green-700 transition-all pb-1"
          onClick={handleReadMoreClick} 
        >
          {loading ? (
            <div className="flex justify-center items-center h-6">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-green-700"></div>
            </div>
          ) : (
            "Leer artículo completo →"
          )}
        </Link>
      </div>
    </div>
  );
};

export default CardNews;
