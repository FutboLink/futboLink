"use client";

import React, { useEffect, useState } from "react";
import CardNews from "../Card/cardNotices";
import Link from "next/link"; // Importar Link para redireccionar
import { getNews } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch"; 
import { INotice } from "@/Interfaces/INews";

const NoticeSection = () => {
  const [news, setNews] = useState<INotice[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getNews(); 
        
        // Ordenamos las noticias de más reciente a más antigua
        // Simplemente invertimos el orden del array asumiendo que las más recientes vienen al final
        const sortedNews = [...response].reverse();
        
        setNews(sortedNews);
        setLoading(false); 
      } catch  {
        setError("Error al obtener las noticias.");
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Solo mostrar las primeras 4 noticias (ya ordenadas por más recientes)
  const firstFourNews = news.slice(0, 4);

  return (
    <section className="relative z-10 px-4 py-16 bg-white mt-7 text-black">
      <h1 className="text-center text-3xl font-semibold text-gray-800 mb-8">
        Últimas Noticias
      </h1>

      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {firstFourNews.map((newsItem) => (
            <CardNews key={newsItem.id} notice={newsItem} />
          ))}
        </div>
      )}

      {/* Botón para ver más noticias */}
      <div className="flex justify-center mt-6">
        <Link href="/News">
          <button className="px-6 py-3 text-verde-oscuro hover:text-green-700 rounded-lg hover:bg-green-100 transition duration-300">
            Ver Todas las Noticias
          </button>
        </Link>
      </div>

      <hr className="border-t-2 mt-14 border-gray-300 my-4" />
    </section>
  );
};

export default NoticeSection;
