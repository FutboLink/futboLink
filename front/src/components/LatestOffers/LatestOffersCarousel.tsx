"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaArrowRight } from "react-icons/fa";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import type { IOfferCard } from "@/Interfaces/IOffer";

export default function LatestOffersCarousel() {
  const [offers, setOffers] = useState<IOfferCard[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getOfertas();
      setOffers(data.slice(0,8));
    })();
  }, []);

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="inline-flex rounded-full bg-green-100 text-[#1d5126] px-4 py-1 text-sm font-semibold">NUEVO</span>
          <h2 className="mt-4 text-4xl font-bold text-gray-900">Últimas oportunidades</h2>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            Descubrí las ofertas más recientes publicadas por clubes y agencias de todo el mundo.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {offers.map((offer)=>(
            <Link key={offer.id} href={`/jobs/${offer.id}`}
              className="group bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="relative">
                <span className="absolute top-3 right-3 rounded-full bg-[#1d5126] text-white text-[10px] px-3 py-1 font-semibold">
                  {offer.contractTypes}
                </span>
                <div className="h-32 bg-gray-50 flex items-center justify-center">
                  <Image src={offer.imgUrl || "/cursosYFormaciones.JPG"} alt={offer.title} width={90} height={90} className="object-contain"/>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-base leading-6 min-h-[72px]">{offer.title}</h3>

                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-[#3e7b26]"/><span>{offer.location}</span></div>
                  <div className="flex items-center gap-2"><FaBriefcase className="text-[#3e7b26]"/><span>{offer.position}</span></div>
                  <div className="flex items-center gap-2 font-semibold text-[#1d5126]"><FaMoneyBillWave/><span>{offer.currencyType} {offer.salary}</span></div>
                </div>

                <div className="mt-6 bg-[#1d5126] text-white rounded-xl py-3 flex items-center justify-center gap-2 font-semibold group-hover:bg-[#16401d] transition-colors">
                  Ver oferta <FaArrowRight className="text-xs"/>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
