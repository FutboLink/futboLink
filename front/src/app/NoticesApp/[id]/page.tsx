import { Metadata } from "next";
import Link from "next/link"; // Importar Link de Next.js
import newsArticles from "../../../helpers/helperNotices"; // Asegúrate de que helpersNotices sea el archivo correcto para las noticias
import Image from "next/image";

// Obtener noticia por ID
const getNewsById = (id: number) => {
  return newsArticles.find((article) => article.id === id) || null;
};

// Generar Metadata para SEO dinámico
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = params; // Obtener el valor de params.id
  const news = getNewsById(Number(id));
  if (news) {
    return {
      title: news.title,
      description: news.description,
    };
  }
  return {
    title: "Noticia no encontrada",
    description: "No se encontró la noticia solicitada.",
  };
}

// Componente de la página
export default async function NewsPage({ params }: { params: { id: string } }) {
  const { id } = params; // Obtener el valor de params.id

  // Obtener la noticia de manera síncrona
  const news = getNewsById(Number(id));

  if (!news) {
    return (
      <main className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">
          Noticia no encontrada
        </h1>
        <p>Lo sentimos, no pudimos encontrar la noticia que buscabas.</p>
        <Link href="/Notices">
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
            Volver
          </button>
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 mt-36 text-black max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
      <Image
        src={news.imageUrl}
        alt={news.title}
        width={200}
        height={200}
        className="mb-4"
      />
      <p className="mb-4">{news.description}</p>

      <h2 className="text-2xl font-semibold mb-2">Más detalles</h2>
      <p className="mb-4">
        Aquí podrías poner más detalles o contenido relacionado con la noticia.
      </p>

      {/* Botones en línea con espacio entre ellos */}
      <div className="flex justify-between mt-20">
        <Link href={`/apply/${news.id}`}>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Aplicar a esta oferta (si aplica)
          </button>
        </Link>
        <Link href="/Notices">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg">
            Volver
          </button>
        </Link>
      </div>
    </main>
  );
}
