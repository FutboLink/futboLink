/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import newsArticles from "../../helpers/helperNotices"; // Usamos helpersNotices para las noticias
import CardNews from "@/components/Card/cardNotices"; // Lo puedes renombrar a algo más adecuado, como CardNews, si prefieres
import "aos/dist/aos.css"; // Importa los estilos de AOS
import AOS from "aos"; // Importa AOS

const NewsPage = () => {
  const articles = newsArticles;

  // Inicializar AOS al cargar el componente
  useEffect(() => {
    AOS.init({
      duration: 1000, // Duración de la animación
      easing: "ease-in-out", // Estilo de transición
      once: false, // Asegura que las animaciones se ejecuten solo una vez
    });
  }, []);

  return (
    <main className="p-6 mt-32 text-black">
      <div className="m-10">
        <h1 className="text-4xl text-center font-bold mb-8 text-gray-800">
          Noticias Disponibles
        </h1>

        {/* Lista de noticias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {articles.length > 0 ? (
            articles.map((article, index) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105"
                data-aos="fade-up" // Agregar la animación de AOS
                data-aos-delay={index * 100} // Para que aparezcan con un pequeño retraso
              >
                <CardNews article={article} />
              </div>
            ))
          ) : (
            <p>No se encontraron noticias.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default NewsPage;
