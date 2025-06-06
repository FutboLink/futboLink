"use client";

import React, { useEffect, useState } from "react";
import CardNews from "@/components/Card/cardNotices";
import { getNews } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import { INotice } from "@/Interfaces/INews";

const NoticeSection = () => {
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
      
      // Add new news to the existing array, remove duplicates, and sort
      setNews((prev) => {
        // Combine previous and new news
        const allNews = [...prev, ...response];
        
        // Remove duplicates by creating a Map with id as key
        const uniqueNewsMap = new Map();
        allNews.forEach(item => {
          uniqueNewsMap.set(item.id, item);
        });
        
        // Convert back to array
        const uniqueNews = Array.from(uniqueNewsMap.values());
        
        // Sort newest first, using id as fallback
        return uniqueNews.sort((a, b) => {
          // Use TypeScript's type assertion to safely check for date fields
          const itemA = a as any;
          const itemB = b as any;
          
          // Try to find a date field in each item
          if (itemA.createdAt && itemB.createdAt) {
            return new Date(itemB.createdAt).getTime() - new Date(itemA.createdAt).getTime();
          }
          
          // Fallback to id (assuming higher id = newer)
          return String(b.id).localeCompare(String(a.id));
        });
      });
    } catch {
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
    <section className="relative z-10 bg-gray-100 mt-12 p-4 pt-[4rem] sm:p-6 sm:pt-[4rem] lg:p-12">
      <h1 className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white text-[1.8rem] p-2 font-semibold text-center mb-[4rem]">
        ÚLTIMAS NOTICIAS
      </h1>

      {loading && news.length === 0 ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {news.map((newsItem) => (
            <CardNews key={newsItem.id} notice={newsItem} />
          ))}
        </div>
      )}

      {/* Botón para ver más noticias */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 text-verde-oscuro hover:text-green-700 rounded-lg hover:bg-green-100 transition duration-300"
          >
            Ver Más Noticias
          </button>
        </div>
      )}

      {loading && news.length > 0 && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-700"></div>
        </div>
      )}

      <hr className="border-t-2 mt-14 border-gray-300 my-4" />
    </section>
  );
};

export default NoticeSection;
