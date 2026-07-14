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

  {offers.map((offer) => (
    <Link
      key={offer.id}
      href={`/jobs/${offer.id}`}
      className="block rounded-2xl border border-gray-200 p-4 hover:shadow-md transition"
    >
      <h3 className="font-semibold text-lg">
        {offer.title}
      </h3>

      <p className="text-sm text-gray-500">
        {offer.location}
      </p>
    </Link>
  ))}

</div>

      </div>
    </section>
  );
};

export default LatestOffersCarousel;
