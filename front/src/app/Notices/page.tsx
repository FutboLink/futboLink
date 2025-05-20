"use client";

import React, { useEffect, useState } from "react";
import CardNews from "@/components/Card/cardNotices";
import { getNews } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch"; 
import { INotice } from "@/Interfaces/INews";

const AllNoticesPage = () => {
  const [news, setNews] = useState<INotice[]>([]); 
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchNews = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await getNews(pageNumber);
      if (response.length < 8) setHasMore(false);
      setNews((prev) => [...prev, ...response]);
    } catch (error) {
      setError("Error al obtener las noticias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto pt-24 pb-16 px-4">
      <h1 className="text-4xl font-bold text-verde-oscuro mb-8 text-center">
        Todas las Noticias
      </h1>

      {loading && news.length === 0 ? (
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

      {hasMore && !loading && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-verde-oscuro text-white rounded-lg hover:bg-green-700 transition duration-300"
          >
            Cargar más noticias
          </button>
        </div>
      )}

      {loading && news.length > 0 && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-700"></div>
        </div>
      )}
    </div>
  );
};

export default AllNoticesPage; 