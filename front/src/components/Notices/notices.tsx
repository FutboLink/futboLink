// components/Notices/notices.tsx
import Image from "next/image";
import newsArticles from "@/helpers/helperNotices";

function Notices() {
  return (
    <section className="p-8 bg-white">
      <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
        Últimas Noticias
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {newsArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
          >
            <Image
              src={article.imageUrl}
              alt={article.title}
              width={400}
              height={250}
              className="object-cover w-full h-56"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold">{article.title}</h3>
              <p className="text-gray-700 mt-2">{article.description}</p>
              <button className="mt-4 text-blue-500 hover:text-blue-700">
                Leer más
              </button>
            </div>
          </div>
        ))}
      </div>
      <hr className="border-t-2 mt-14 border-gray-300 my-4" />
    </section>
  );
}

export default Notices;
