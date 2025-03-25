"use client";

import React, { useEffect, useState } from "react";
import CardNews from "@/components/Card/cardNotices";
import Link from "next/link"; 
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
        setNews(response);
        setLoading(false); 
      } catch  {
        setError("Error al obtener las noticias.");
        setLoading(false); // Cambiar el estado de carga
      }
    };

    fetchNews();
  }, []);

  // Solo mostrar las primeras 4 noticias
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
        <Link href="/Notices">
          <button className="px-6 py-3 text-verde-oscuro hover:text-green-700 rounded-lg hover:bg-green-100 transition duration-300">
            Ver Más Noticias
          </button>
        </Link>
      </div>

      <hr className="border-t-2 mt-14 border-gray-300 my-4" />
    </section>
  );
};

export default NoticeSection;
