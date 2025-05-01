import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { INotice } from "@/Interfaces/INews";

const CardNews: React.FC<{ notice: INotice }> = ({ notice }) => {
  const [loading, setLoading] = useState(false);

  const handleReadMoreClick = () => {
    setLoading(true);
  
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary hover:cursor-pointer">
      {/* Imagen destacada */}
      <Image
        src={notice.imageUrl}
        alt={""}
        width={400}
        height={250}
        className="w-full h-56 object-cover object-center"
      />

      {/* Contenido de la noticia */}
      <div className="p-6">
      <Link
            href={`/News/${notice.id}`}
            className="text-verde-oscuro hover:text-green-700 font-semibold text-sm"
            onClick={handleReadMoreClick} 
          >
        <h3 className="font-semibold text-gray-800 mb-2">{notice.title}</h3>

        {loading ? (
          <div className="flex justify-center items-center h-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700"></div>
          </div>
        ) : (
         <div>
            Leer más
            </div>
        )}
        </Link>
      </div>
    </div>
  );
};

export default CardNews;
