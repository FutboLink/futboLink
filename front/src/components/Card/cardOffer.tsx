import React from "react";
import Link from "next/link";

interface Offer {
  id: number;
  title: string;
  description: string;
}

const CardOffer: React.FC<{ offer: Offer }> = ({ offer }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
        {offer.title}
      </h3>
      <p className="text-gray-600 mb-4">{offer.description}</p>
      <Link
        href={`/Offer/${offer.id}`}
        className=" text-green-600 hover:text-green-700 font-semibold"
      >
        Ver más
      </Link>
    </div>
  );
};

export default CardOffer;
