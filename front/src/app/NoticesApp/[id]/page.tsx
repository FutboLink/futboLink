import { Metadata } from "next";
import Link from "next/link";
import helpersNotices from "@/helpers/helperNotices";
import { INews, INewsPageProps } from "../../../Interfaces/INews"; // Importar las interfaces necesarias
import Image from "next/image";

// Obtener noticia por ID
const getNewsById = (id: number): INews | null => {
  return helpersNotices.find((article: INews) => article.id === id) || null;
};

// Generar Metadata para SEO dinámico
export async function generateMetadata({
  params,
}: INewsPageProps): Promise<Metadata> {
  const { id } = await params; // Espera a que 'params' se resuelva
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
export default async function NewsPage({ params }: INewsPageProps) {
  const { id } = await params; // Espera a que 'params' se resuelva

  // Obtener la noticia de manera síncrona, ya que helpersNotices está disponible localmente
  const news = getNewsById(Number(id));

  if (!news) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white shadow-xl rounded-lg p-8 text-center max-w-md mx-auto">
          <h1 className="text-3xl font-semibold text-red-600 mb-6">
            Noticia no encontrada
          </h1>
          <p className="text-gray-600 mb-6">
            Lo sentimos, no pudimos encontrar la noticia que buscabas.
          </p>
          <Link
            href="/NoticesApp"
            className="inline-block px-6 py-3 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-300"
          >
            Volver
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mt-16 bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden flex items-center">
        {/* Imagen a la izquierda */}
        <div className="relative w-1/2 h-64 sm:h-80 md:h-96">
          <Image
            src={news.imageUrl}
            alt={news.imageAlt}
            layout="fill" // Usar layout para un tamaño responsivo
            objectFit="cover" // Ajustar la imagen para que se adapte
            className="rounded-l-lg p-3 rounded-2xl"
          />
        </div>

        {/* Contenido de la noticia a la derecha */}
        <div className="p-8 w-1/2">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            {news.title}
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed mb-8">
            {news.description}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/NoticesApp"
              className="px-6 py-3 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-300"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
