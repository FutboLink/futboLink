"use client";

import newsArticles from "../../helpers/helperNotices"; // Importar las noticias
import CardOffer from "@/components/Card/cardOffer"; // Usar el componente CardOffer para mostrar las noticias

const NoticesPage = () => {
  const articles = newsArticles;

  return (
    <main className="p-6 mt-32 text-black">
      <div className="m-10">
        <h1 className="text-3xl text-center font-bold mb-4">
          Últimas Noticias
        </h1>

      
        <div className="grid grid-cols-1 mt-20 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {articles.length > 0 ? (
            articles.map((article) => (
              <CardOffer key={article.id} offer={article} /> 
            ))
          ) : (
            <p>No se encontraron noticias.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default NoticesPage;
