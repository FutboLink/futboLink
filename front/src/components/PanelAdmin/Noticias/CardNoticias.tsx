import React from "react";
import Image from "next/image";
import { INotice } from "@/Interfaces/INews";

const CardNoticias: React.FC<{ notice: INotice }> = ({ notice }) => {
  return (
    <section className="max-w-4xl mx-auto mt-24 p-6 bg-white shadow-md rounded-lg">
      {/* Imagen destacada */}
      <div className="w-full h-96 relative mb-6">
        <Image
          src={notice.imageUrl}
          alt={notice.title}
          layout="fill"
          objectFit="contain" // Usamos contain para que la imagen se ajuste sin recortarse
          className="rounded-lg"
        />
      </div>

      {/* Título de la noticia */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{notice.title}</h1>

      {/* Descripción completa */}
      <p className="text-gray-700 text-base mb-6">{notice.description}</p>

    
    </section>
  );
};


export default CardNoticias;
