// components/OffersSection.tsx
import React from "react";
import CardOffer from "../Card/card";
import offers from "@/helpers/helpersOffers"; // Helper de ofertas

const OffersSection = () => {
  return (
    <section className="relative z-10 px-4 py-16 bg-white text-black">
      <h1 className="text-center text-3xl font-semibold text-gray-800 mb-8">
        Ofertas Destacadas
      </h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {offers.map((offer) => (
          <CardOffer key={offer.id} offer={offer} />
        ))}
      </div>
      <hr className="border-t-2 mt-14 border-gray-300 my-4" />
    </section>
  );
};

export default OffersSection;
