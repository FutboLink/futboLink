"use client";

import React, { useEffect, useState } from "react";
import CardNews from "@/components/Card/cardNotices";
import { getNews } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch"; 
import { INotice } from "@/Interfaces/INews";

const AllNoticesPage = () => {
  const [news, setNews] = useState<INotice[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getNews(); 
        setNews(response);
        setLoading(false); 
      } catch (error) {
        setError("Error al obtener las noticias.");
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="container mx-auto pt-24 pb-16 px-4">
      <h1 className="text-4xl font-bold text-verde-oscuro mb-8 text-center">
        Todas las Noticias
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 text-xl py-16">{error}</div>
      ) : news.length === 0 ? (
        <div className="text-center text-gray-600 text-xl py-16">
          No hay noticias disponibles en este momento.
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {news.map((newsItem) => (
            <CardNews key={newsItem.id} notice={newsItem} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllNoticesPage; 