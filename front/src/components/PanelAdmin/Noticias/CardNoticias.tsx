import React, { useEffect } from "react";
import Image from "next/image";
import { INotice } from "@/Interfaces/INews";

const CardNoticias: React.FC<{ notice: INotice }> = ({ notice }) => {
  useEffect(() => {
    // Logging notice data for debugging
    console.log("CardNoticias received notice:", notice);
    
    // Validate required properties
    if (!notice.title || !notice.description || !notice.imageUrl) {
      console.warn("Notice is missing required properties:", {
        hasTitle: !!notice.title,
        hasDescription: !!notice.description,
        hasImageUrl: !!notice.imageUrl
      });
    }
  }, [notice]);

  // Fallback for image URL if it's missing or invalid
  const imageUrl = notice.imageUrl || 'https://dummyimage.com/600x400/000/fff&text=No+Image';

  return (
    <section className="max-w-4xl mx-auto mt-24 p-6 bg-white shadow-md rounded-lg">
      {/* Imagen destacada */}
      <div className="w-full h-96 relative mb-6">
        <Image
          src={imageUrl}
          alt={notice.title || 'Noticia'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-lg object-contain" 
          onError={() => console.error("Error loading image:", imageUrl)}
        />
      </div>

      {/* Título de la noticia */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{notice.title || 'Sin título'}</h1>

      {/* Descripción completa */}
      <p className="text-gray-700 text-base mb-6">{notice.description || 'Sin descripción'}</p>
    </section>
  );
};

export default CardNoticias;
