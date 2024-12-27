/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useMemo } from "react";
import newsArticles from "../../helpers/helperNotices"; // Usamos helpersNotices para las noticias
import CardNews from "@/components/Card/cardNotices"; // Lo puedes renombrar a algo más adecuado, como CardNews, si prefieres
import Link from "next/link";

const NewsPage = () => {
  const articles = newsArticles;

  // Crear lista única de categorías para los filtros (por ejemplo, la categoría puede ser la primera palabra del título)
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      articles.map((article) => article.title.split(" ")[0]) // Usamos el primer término del título como categoría simple
    );
    return Array.from(uniqueCategories);
  }, [articles]);

  const [selectedCategory, setSelectedCategory] = useState("");

  // Filtrar noticias según los filtros seleccionados
  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === "" || article.title.includes(selectedCategory);
    return matchesCategory;
  });

  return (
    <main className="p-6 mt-32 text-black">
      <div className="m-10">
        <h1 className="text-3xl text-center font-bold mb-4">
          Noticias Disponibles
        </h1>

        {/* Filtros */}
        <div className="mb-6">
          <label htmlFor="category" className="mr-4 text-lg">
            Filtrar por categoría:
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="">Todas</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de noticias filtradas */}
        <div className="grid grid-cols-1 mt-20 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <div key={article.id}>
                <CardNews article={article} />{" "}
                {/* Puedes renombrar CardOffer a CardNews si prefieres */}
              </div>
            ))
          ) : (
            <p>No se encontraron noticias que coincidan con los filtros.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default NewsPage;
