"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaArrowRight,
} from "react-icons/fa";

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
            Descubrí las ofertas más recientes publicadas por clubes y agencias
            de todo el mundo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {offers.map((offer) => (

            <Link
              key={offer.id}
              href={`/jobs/${offer.id}`}
              className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >

              <div className="bg-gray-50 flex items-center justify-center h-36">

                <Image
                  src={offer.imgUrl || "/cursosYFormaciones.JPG"}
                  alt={offer.title}
                  width={90}
                  height={90}
                  className="object-contain"
                />

              </div>

              <div className="p-5">

                <h3 className="font-bold text-gray-900 text-base leading-6 min-h-[72px]">
                  {offer.title}
                </h3>

                <div className="mt-4 space-y-2 text-sm text-gray-600">

                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[#3e7b26] text-sm" />
                    <span>{offer.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaBriefcase className="text-[#3e7b26] text-sm" />
                    <span>{offer.contractTypes}</span>
                  </div>

                  <div className="flex items-center gap-2 font-semibold text-[#1d5126]">
                    <FaMoneyBillWave className="text-sm" />
                    <span>
                      {offer.currencyType} {offer.salary}
                    </span>
                  </div>

                </div>

                <div className="mt-6">

                  <span className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-[#1d5126] py-2 text-sm font-semibold text-[#1d5126] hover:bg-[#1d5126] hover:text-white transition-all duration-300">

                    Ver oferta

                    <FaArrowRight className="text-xs" />

                  </span>

                </div>

              </div>

            </Link>

          ))}

        </div>
      </div>
    </section>
  );
};

export default LatestOffersCarousel;
