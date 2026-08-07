"use client";

import { useEffect, useState } from "react";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import { IOfferCard } from "@/Interfaces/IOffer";

interface RecruiterStats {
  id: string;
  name: string;
  email: string;
  total: number;
}

export default function OfferAnalytics() {
  const [offers, setOffers] = useState<IOfferCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [topRecruiters, setTopRecruiters] = useState<RecruiterStats[]>([]);
  const [countriesRanking, setCountriesRanking] = useState<
    [string, number][]
  >([]);

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
    const recruiters: Record<string, RecruiterStats> = {};
    const countries: Record<string, number> = {};

    offers.forEach((offer) => {
      const recruiter = offer.recruiter;

      if (recruiter?.id) {
        if (!recruiters[recruiter.id]) {
          recruiters[recruiter.id] = {
            id: recruiter.id,
            name:
              `${recruiter.name || ""} ${recruiter.lastname || ""}`.trim() ||
              "Sin nombre",
            email: recruiter.email || "",
            total: 0,
          };
        }

        recruiters[recruiter.id].total++;
      }

      const country = offer.nationality || "Sin país";

      countries[country] = (countries[country] || 0) + 1;
    });

    const recruiterRanking = Object.values(recruiters)
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    const countryRanking = Object.entries(countries).sort(
      (a, b) => Number(b[1]) - Number(a[1])
    );

    setTopRecruiters(recruiterRanking);

    setCountriesRanking(countryRanking);

    setTotalUsers(Object.keys(recruiters).length);
  };

  const averageOffers =
    totalUsers > 0 ? (offers.length / totalUsers).toFixed(1) : "0";

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Cargando Analytics...
      </div>
    );
  }

  return (
        <div className="space-y-8">

      <h2 className="text-3xl font-bold text-gray-800">
        Analytics de Ofertas
      </h2>

      {/* KPIs */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-2">
            Ofertas
          </p>

          <p className="text-5xl font-black text-[#3d7a26]">
            {offers.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-2">
            Recruiters
          </p>

          <p className="text-5xl font-black text-[#3d7a26]">
            {totalUsers}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-2">
            Países
          </p>

          <p className="text-5xl font-black text-[#3d7a26]">
            {countriesRanking.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-2">
            Promedio
          </p>

          <p className="text-5xl font-black text-[#3d7a26]">
            {averageOffers}
          </p>
        </div>

      </div>

      {/* Rankings */}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recruiters */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

          <h3 className="text-xl font-bold text-gray-800 mb-6">
            🏆 Top Recruiters
          </h3>

          <div className="space-y-3 max-h-[520px] overflow-y-auto">

            {topRecruiters.map((recruiter, index) => (

              <div
                key={recruiter.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition"
              >

                <div>

                  <p className="font-semibold text-gray-800">

                    {index === 0 && "🥇 "}
                    {index === 1 && "🥈 "}
                    {index === 2 && "🥉 "}

                    #{index + 1} {recruiter.name}

                  </p>

                  <p className="text-sm text-gray-500">

                    {recruiter.email}

                  </p>

                </div>

                <div className="text-right">

                  <p className="text-2xl font-bold text-[#3d7a26]">

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

        {/* Países */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

          <h3 className="text-xl font-bold text-gray-800 mb-6">
            🌍 Ranking Países
          </h3>

          <div className="space-y-3 max-h-[520px] overflow-y-auto">

            {countriesRanking.slice(0,20).map(([country,total],index)=>(

              <div
                key={country}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition"
              >

                <div>

                  <p className="font-semibold text-gray-800">

                    #{index+1} {country}

                  </p>

                </div>

                <div>

                  <p className="text-2xl font-bold text-[#3d7a26]">

                    {total}

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>

  );
}
