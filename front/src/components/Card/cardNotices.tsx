import React from "react";
import Link from "next/link";
import Image from "next/image";

interface NewsArticle {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

const CardNews: React.FC<{ article: NewsArticle }> = ({ article }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary">
      {/* Imagen destacada */}
      <Image
        src={article.imageUrl}
        alt={article.imageAlt}
        width={400}
        height={250}
        className="w-full h-56 object-cover object-center"
      />

      {/* Contenido de la noticia */}
      <div className="p-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          {article.title}
        </h3>
        <Link
          href={`/Notices/${article.id}`}
          className="text-green-600 hover:text-green-700 font-semibold text-sm"
        >
          Leer más
        </Link>
      </div>
    </div>
  );
};

export default CardNews;
