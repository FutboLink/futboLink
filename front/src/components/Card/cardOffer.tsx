import React from "react";
import Link from "next/link";
import CountryFlag from "react-country-flag";
import { IOfferCard } from "@/Interfaces/IOffer";

const CardOffer: React.FC<{ offer: IOfferCard }> = ({ offer }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary p-6 flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2 mb-4">
        <CountryFlag
          countryCode={offer.flagCode.toUpperCase()}
          svg
          style={{ width: "24px", height: "18px" }}
          title={offer.country}
        />
        <span className="text-gray-700 text-sm font-medium">
          {offer.country}
        </span>
      </div>
      {/* Contenedor de contenido */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {offer.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">{offer.description}</p>

        {/* Información adicional */}

        {/* Salario */}
        <p className="text-gray-800 text-sm font-semibold">
          Salario:{" "}
          <span className=" bg-green-500 rounded-xl p-2 text-primary">
            {offer.salary}
          </span>
        </p>
      </div>
      <div className="flex gap-7">
        <Link
          href={`/Offer/${offer.id}`}
          className="text-green-600 hover:text-green-700 font-semibold self-start"
        >
          Ver más
        </Link>
        <Link
          href={`/Offer/${offer.id}`}
          className="text-green-600 hover:text-green-700 font-semibold self-start"
        >
          Aplicar a esta oferta
        </Link>
      </div>
    </div>
  );
};

export default CardOffer;
