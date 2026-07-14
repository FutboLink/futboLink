"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import type { IOfferCard } from "@/Interfaces/IOffer";

const LatestOffersCarousel = () => {
  const [offers, setOffers] = useState<IOfferCard[]>([]);
  useEffect(() => {
  const loadOffers = async () => {
    const data = await getOfertas();

    setOffers(data.slice(0, 8));
  };

  loadOffers();
}, []);
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-12">

          <span className="inline-flex items-center rounded-full bg-green-100 text-[#1d5126] px-4 py-1 text-sm font-semibold">
            NUEVO
          </span>

          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Últimas oportunidades
          </h2>

          <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            Descubrí las ofertas más recientes publicadas por clubes y agencias de todo el mundo.
          </p>

        </div>

        <div className="space-y-4">

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {offers.map((offer) => (
    <Link
      key={offer.id}
      href={`/jobs/${offer.id}`}
      className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <img
        src={offer.imgUrl || "/cursosYFormaciones.JPG"}
        alt={offer.title}
        className="w-full h-40 object-contain p-6 bg-gray-50"
      />

      <div className="p-5">

        <h3 className="font-bold text-gray-900 text-lg line-clamp-2 min-h-[56px]">
          {offer.title}
        </h3>

        <div className="mt-4 space-y-2 text-sm text-gray-600">

          <p>
            📍 {offer.location}
          </p>

          <p>
            💼 {offer.contractTypes}
          </p>

          <p className="font-semibold text-[#1d5126]">
            💶 {offer.currencyType} {offer.salary}
          </p>

        </div>

        <div className="mt-5 font-semibold text-[#1d5126]">
          Ver oferta →
        </div>

      </div>
    </Link>
  ))}
</div>

</div>

      </div>
    </section>
  );
};

export default LatestOffersCarousel;
