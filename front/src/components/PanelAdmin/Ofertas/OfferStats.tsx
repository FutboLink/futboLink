"use client"
import React, { useState, useEffect } from "react";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch"; // Ruta correcta para obtener las ofertas
import { IOfferCard } from "@/Interfaces/IOffer"; // Asegúrate de que esta interfaz esté definida correctamente

const OfferStats = () => {
  const [activeTab, setActiveTab] = useState("ofertas"); // Estado para cambiar de pestaña
  const [offers, setOffers] = useState<IOfferCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>({
    offersByType: {},
    offersByLocation: {},
    offersBySalary: {},
    offersByTime: {},
    mostActiveProfile: null,
  });

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      const fetchedOffers = await getOfertas(); // Obtén las ofertas usando getOfertas
      setOffers(fetchedOffers);
      calculateStats(fetchedOffers); // Calcula estadísticas después de obtener las ofertas
      setLoading(false);
    };
    fetchOffers();
  }, []);

  // Función para calcular estadísticas
  const calculateStats = (offers: IOfferCard[]) => {
    const offersByType: { [key: string]: number } = {};
    const offersByLocation: { [key: string]: number } = {};
    const offersBySalary: { [key: string]: number } = {};
    const offersByTime: { [key: string]: number } = {};
    const profilesActivity: { [key: string]: number } = {}; // Contador de actividad por perfil

    offers.forEach((offer) => {
      // Por tipo de puesto (offerType)
      offersByType[offer.offerType] = (offersByType[offer.offerType] || 0) + 1;

      // Por ubicación (location)
      offersByLocation[offer.location] = (offersByLocation[offer.location] || 0) + 1;

      // Por salario (salary)
      const salary = parseInt(offer.salary || "0", 10); // Convertir el salario a número
      if (salary < 30000) {
        offersBySalary["<$30K"] = (offersBySalary["<$30K"] || 0) + 1;
      } else if (salary >= 30000 && salary <= 60000) {
        offersBySalary["$30K-$60K"] = (offersBySalary["$30K-$60K"] || 0) + 1;
      } else {
        offersBySalary[">$60K"] = (offersBySalary[">$60K"] || 0) + 1;
      }

      // Por tiempo (aquí podrías agregar lógica según la fecha de publicación)
      const publicationDate = new Date(offer.createdAt); // Asegúrate de que la propiedad 'createdAt' exista
      const timeDifference = Date.now() - publicationDate.getTime();
      const daysAgo = timeDifference / (1000 * 3600 * 24);
      if (daysAgo <= 30) {
        offersByTime["Últimos 30 días"] = (offersByTime["Últimos 30 días"] || 0) + 1;
      } else {
        offersByTime["Hace más de 30 días"] = (offersByTime["Hace más de 30 días"] || 0) + 1;
      }

      // Contador de actividad por perfil (reclutador o agencia)
      const profileKey = offer.recruiter?.role; // Suponiendo que el reclutador tiene un campo 'role'
      if (profileKey) {
        profilesActivity[profileKey] = (profilesActivity[profileKey] || 0) + 1;
      }
    });

    let mostActiveProfile = null;
    if (Object.keys(profilesActivity).length > 0) {
      mostActiveProfile = Object.keys(profilesActivity).reduce(
        (a, b) => profilesActivity[a] > profilesActivity[b] ? a : b
      );
    }
    
    setStats({
      offersByType,
      offersByLocation,
      offersBySalary,
      offersByTime,
      mostActiveProfile: mostActiveProfile === "RECRUITER" ? "Reclutador" : "Agencia",
    });
    
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (loading) {
    return <div className="text-center text-gray-600 mt-28">Cargando estadísticas...</div>;
  }

  return (
    <div className="mt-20 p-6">
      {/* Pestañas para filtrar */}
      <div className="flex space-x-6 mb-6">
        <button
          onClick={() => handleTabChange("ofertas")}
          className={`px-4 py-2 ${activeTab === "ofertas" ? "bg-white border-2 border-green-800 text-green-800 hover:bg-green-800 hover:text-white" : "bg-gray-200 text-gray-700"} rounded`}
        >
          Estadísticas de Ofertas
        </button>
        <button
          onClick={() => handleTabChange("perfiles")}
          className={`px-4 py-2 ${activeTab === "perfiles" ? "bg-white border-2 border-green-800 text-green-800 hover:bg-green-800 hover:text-white" : "bg-gray-200 text-gray-700"} rounded`}
        >
          Perfiles Activos
        </button>
        <button
          onClick={() => handleTabChange("postulaciones")}
          className={`px-4 py-2 ${activeTab === "postulaciones" ? "bg-white border-2 border-green-800 text-green-800 hover:bg-green-800 hover:text-white" : "bg-gray-200 text-gray-700"} rounded`}
        >
          Postulaciones por Oferta
        </button>
      </div>

      {/* Contenido según la pestaña activa */}
      <div>
        {activeTab === "ofertas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Estadísticas de ofertas */}
            <div className="bg-white border p-4 rounded shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cantidad de ofertas publicadas</h3>
              <div className="space-y-2">
                <p className="text-gray-800"><strong>Por tipo de puesto:</strong> {JSON.stringify(stats.offersByType)}</p>
                <p className="text-gray-800"><strong>Por país:</strong> {JSON.stringify(stats.offersByLocation)}</p>
                <p className="text-gray-800"><strong>Por salario:</strong> {JSON.stringify(stats.offersBySalary)}</p>
                <p className="text-gray-800"><strong>Por tiempo:</strong> {JSON.stringify(stats.offersByTime)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "perfiles" && (
          <div className="bg-white border p-4 rounded shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Perfil que publica más ofertas</h3>
            <div>
              {/* Aquí se muestra el perfil más activo */}
              <p className="text-gray-800">Perfil más activo: {stats.mostActiveProfile}</p>
            </div>
          </div>
        )}

        {activeTab === "postulaciones" && (
          <div className="bg-white border p-4 rounded shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cantidad de postulaciones por oferta</h3>
            <div>
              {/* Aquí podrías agregar las postulaciones por oferta */}
              <p><strong>Oferta A:</strong> {stats.applicationsPerOffer["Oferta A"]} postulaciones</p>
              <p><strong>Oferta B:</strong> {stats.applicationsPerOffer["Oferta B"]} postulaciones</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferStats;
