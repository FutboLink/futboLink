"use client";
import React, { useState, useEffect } from "react";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch"; // Ruta correcta para obtener las ofertas
import { IOfferCard } from "@/Interfaces/IOffer"; // Asegúrate de que esta interfaz esté definida correctamente

interface IStats {
  offersByType: { [key: string]: number };
  offersByLocation: { [key: string]: number };
  offersBySalary: { [key: string]: number };
  offersByTime: { [key: string]: number };
  mostActiveProfile: string | null;
}

const OfferStats = () => {
  const [activeTab, setActiveTab] = useState("ofertas");
  const [offers, setOffers] = useState<IOfferCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<IStats>({
    offersByType: {},
    offersByLocation: {},
    offersBySalary: {},
    offersByTime: {},
    mostActiveProfile: null,
  });

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      const fetchedOffers = await getOfertas();
      setOffers(fetchedOffers);
      calculateStats(fetchedOffers);
      setLoading(false);
    };
    fetchOffers();
  }, []);

  const calculateStats = (offers: IOfferCard[]) => {
    const offersByType: { [key: string]: number } = {};
    const offersByLocation: { [key: string]: number } = {};
    const offersBySalary: { [key: string]: number } = {};
    const offersByTime: { [key: string]: number } = {};
    const profilesActivity: { [key: string]: number } = {};

    offers.forEach((offer) => {
      offersByType[offer.offerType] = (offersByType[offer.offerType] || 0) + 1;
      offersByLocation[offer.location] = (offersByLocation[offer.location] || 0) + 1;

      const salary = parseInt(offer.salary || "0", 10);
      if (salary < 30000) {
        offersBySalary["<$30K"] = (offersBySalary["<$30K"] || 0) + 1;
      } else if (salary >= 30000 && salary <= 60000) {
        offersBySalary["$30K-$60K"] = (offersBySalary["$30K-$60K"] || 0) + 1;
      } else {
        offersBySalary[">$60K"] = (offersBySalary[">$60K"] || 0) + 1;
      }

      const publicationDate = new Date(offer.createdAt);
      const daysAgo = (Date.now() - publicationDate.getTime()) / (1000 * 3600 * 24);
      if (daysAgo <= 30) {
        offersByTime["Últimos 30 días"] = (offersByTime["Últimos 30 días"] || 0) + 1;
      } else {
        offersByTime["Hace más de 30 días"] = (offersByTime["Hace más de 30 días"] || 0) + 1;
      }

      const profileKey = offer.recruiter?.role;
      if (profileKey) {
        profilesActivity[profileKey] = (profilesActivity[profileKey] || 0) + 1;
      }
    });

    const mostActiveProfile = Object.keys(profilesActivity).reduce(
      (a, b) => (profilesActivity[a] > profilesActivity[b] ? a : b),
      ""
    );

    setStats({
      offersByType,
      offersByLocation,
      offersBySalary,
      offersByTime,
      mostActiveProfile: mostActiveProfile === "RECRUITER" ? "Reclutador" : "Agencia",
    });
  };

  const handleTabChange = (tab: string) => setActiveTab(tab);

  if (loading) {
    return <div className="text-center text-gray-600 mt-28">Cargando estadísticas...</div>;
  }

  return (
    <div className="mt-20 p-6">
      <div className="flex space-x-6 mb-6">
        <button onClick={() => handleTabChange("ofertas")} className={`tab-button ${activeTab === "ofertas" ? "active" : ""}`}>
          Estadísticas de Ofertas
        </button>
        <button onClick={() => handleTabChange("perfiles")} className={`tab-button ${activeTab === "perfiles" ? "active" : ""}`}>
          Perfiles Activos
        </button>
      </div>

      <div>
        {activeTab === "ofertas" && (
          <>
            <h3 className="text-xl font-semibold mb-4">Ofertas Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-white border p-4 rounded shadow-md">
                  <h4 className="font-bold text-gray-800">{offer.title}</h4>
                  <p className="text-gray-600">Tipo: {offer.offerType}</p>
                  <p className="text-gray-600">Ubicación: {offer.location}</p>
                  <p className="text-gray-600">Salario: ${offer.salary}</p>
                  <p className="text-gray-600">Publicado: {new Date(offer.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "perfiles" && (
          <div className="bg-white border p-4 rounded shadow-md">
            <h3 className="text-lg font-semibold mb-4">Perfil más activo</h3>
            <p className="text-gray-800">Perfil más activo: {stats.mostActiveProfile}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferStats;
