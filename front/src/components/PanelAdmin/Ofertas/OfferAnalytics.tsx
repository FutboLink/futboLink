"use client";

import { useEffect, useState } from "react";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import { IOfferCard } from "@/Interfaces/IOffer";

export default function OfferAnalytics() {
  const [offers, setOffers] = useState<IOfferCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [topRecruiters, setTopRecruiters] = useState<any[]>([]);
  const [countriesRanking, setCountriesRanking] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const loadOffers = async () => {
      const data = await getOfertas();
      setOffers(data);
      calculateAnalytics(data);
      setLoading(false);
    };

    loadOffers();
  }, []);
  const calculateAnalytics = (offers: IOfferCard[]) => {
  const recruiters: any = {};
  const countries: any = {};

  offers.forEach((offer) => {

    // Recruiters

    const recruiterId = offer.recruiter?.id;
    if (recruiterId) {
      if (!recruiters[recruiterId]) {
        
        recruiters[recruiterId] = {
          id: recruiterId,
          name:
            `${offer.recruiter?.name || ""} ${offer.recruiter?.lastname || ""}`.trim() ||
            "Sin nombre",
          email: offer.recruiter?.email || "",
          total: 0,
        };
      }
      recruiters[recruiterId].total++;
    }
    
    // Países

    const country = offer.nationality || "Sin país";
    countries[country] = (countries[country] || 0) + 1;
  });
    const rankingRecruiters = Object.values(recruiters)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 20);
    const rankingCountries = Object.entries(countries)
    .sort((a: any, b: any) => b[1] - a[1]);
  setTopRecruiters(rankingRecruiters);
  setCountriesRanking(rankingCountries);
  setTotalUsers(Object.keys(recruiters).length);
};
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
        
          <p className="font-semibold text-gray-800">

            #{index + 1} {recruiter.name}

          </p>

          <p className="text-sm text-gray-500">

            {recruiter.email}

          </p>

        </div>

        <div className="text-right">

          <p className="font-bold text-[#3d7a26]">

            {recruiter.total}

          </p>

          <p className="text-xs text-gray-500">

            ofertas
          </p>
        </div>
      </div>
    ))}
  </div>
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
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

  <h3 className="text-xl font-bold text-gray-800 mb-5">
    🏆 Top 20 Recruiters
  </h3>

  <div className="space-y-3">

    {topRecruiters.map((recruiter, index) => (

      <div
        key={recruiter.id}
        className="flex items-center justify-between border-b border-gray-100 pb-3"
      >

        <div>
      </div>
    </div>
  );
}
