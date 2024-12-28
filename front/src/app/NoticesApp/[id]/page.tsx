import { Metadata } from "next";
import Link from "next/link";
import helpersNotices from "@/helpers/helperNotices";
import { News, NewsPageProps } from "../../../Interfaces/news"; // Importar las interfaces necesarias
import Image from "next/image";

// Obtener noticia por ID
const getNewsById = (id: number): News | null => {
  return helpersNotices.find((article: News) => article.id === id) || null;
};

// Generar Metadata para SEO dinámico
export async function generateMetadata({
  params,
}: NewsPageProps): Promise<Metadata> {
  const { id } = params; // Obtener el ID desde los parámetros
  const news = getNewsById(Number(id));
  if (news) {
    return {
      title: news.title,
      description: news.description,
    };
  }
  return {
    title: "Noticia no encontrada",
    description: "No se encontró la Noticia solicitada.",
  };
}

// Componente de la página
export default async function NewsPage({ params }: NewsPageProps) {
  const { id } = params; // Obtener el ID desde los parámetros

  // Obtener la noticia de manera síncrona, ya que helpersNotices está disponible localmente
  const news = getNewsById(Number(id));

  if (!news) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Noticia no encontrada
          </h1>
          <p className="text-gray-600 mb-6">
            Lo sentimos, no pudimos encontrar la noticia que buscabas.
          </p>
          <Link
            href="/NoticesApp"
            className="inline-block px-6 py-3 -500 text-green-600 hover:text-green-700 text-lg font-semibold rounded-lg hover:-600 transition"
          >
            Volver
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mt-28 bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="relative w-full h-64 md:h-80">
          <Image
            src={news.imageUrl}
            alt={news.imageAlt}
            layout="fill" // Usar layout para un tamaño responsivo
            objectFit="cover" // Ajustar la imagen para que se adapte
            className="rounded-t-lg"
          />
        </div>
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {news.title}
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {news.description}
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              href="/NoticesApp"
              className="px-6 py-3 -500 text-green-600 hover:text-green-700 bg-white border-green-600 border-solid text-lg font-semibold rounded-lg hover:-600 transition"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
