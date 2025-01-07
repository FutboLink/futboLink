import React from "react";
import Link from "next/link";

interface Offer {
  id: number;
  title: string;
  description: string;
}

const CardOffer: React.FC<{ offer: Offer }> = ({ offer }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary p-6 flex flex-col gap-4 w-full">
      {/* Contenedor de contenido */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {offer.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
      </div>
      <Link
        href={`/Offer/${offer.id}`}
        className="text-green-600 hover:text-green-700 font-semibold self-start"
      >
        Ver más
      </Link>
    </div>
  );
};

export default CardOffer;
