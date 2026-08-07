"use client";

import { useEffect, useState } from "react";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import { IOfferCard } from "@/Interfaces/IOffer";

export default function OfferAnalytics() {
  const [offers, setOffers] = useState<IOfferCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOffers = async () => {
      const data = await getOfertas();
      setOffers(data);
      setLoading(false);
    };

    loadOffers();
  }, []);

  if (loading) {
    return <div className="p-8">Cargando Analytics...</div>;
  }

  return (
    <div className="space-y-6">

      <h2 className="text-3xl font-bold text-gray-800">
        Analytics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ofertas</p>

          <p className="text-3xl font-bold text-[#3d7a26]">
            {offers.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">Usuarios</p>

          <p className="text-3xl font-bold text-[#3d7a26]">
            -
          </p>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">Países</p>

          <p className="text-3xl font-bold text-[#3d7a26]">
            -
          </p>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">Promedio</p>

          <p className="text-3xl font-bold text-[#3d7a26]">
            -
          </p>
        </div>

      </div>

    </div>
  );
}
