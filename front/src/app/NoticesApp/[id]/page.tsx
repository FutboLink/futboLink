import { Metadata } from "next";
import Link from "next/link"; // Importar Link de Next.js
import helpersOffers from "@/helpers/helperNotices";
import { News, NewsPageProps } from "../../../Interfaces/news"; // Importar las interfaces necesarias
import Image from "next/image";

// Obtener oferta por ID (ya no es necesario hacerla asincrónica si es local)
const getOfferById = (id: number): News | null => {
  return helpersOffers.find((offer: News) => offer.id === id) || null;
};

// Generar Metadata para SEO dinámico
export async function generateMetadata({
  params,
}: NewsPageProps): Promise<Metadata> {
  const { id } = params; // Obtener el ID desde los parámetros
  const offer = getOfferById(Number(id));
  if (offer) {
    return {
      title: offer.title,
      description: offer.description,
    };
  }
  return {
    title: "Noticia no encontrada",
    description: "No se encontró la Noticia solicitada.",
  };
}

// Componente de la página
export default async function OfferPage({ params }: NewsPageProps) {
  const { id } = params; // Obtener el ID desde los parámetros

  // Obtener la oferta de manera síncrona, ya que helpersOffers está disponible localmente
  const offer = getOfferById(Number(id));

  if (!offer) {
    return (
      <main className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">
          Oferta no encontrada
        </h1>
        <p>Lo sentimos, no pudimos encontrar la oferta que buscabas.</p>
        <Link href="/Offer">
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
            Volver
          </button>
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 mt-36 text-black max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{offer.title}</h1>
      <Image
        src={offer.imageUrl}
        alt={offer.imageAlt}
        width={360}
        height={240}
        className="mb-4 rounded-lg"
      />
      <p className="mb-4">{offer.description}</p>

      {/* Botones en línea con espacio entre ellos */}
      <div className="flex justify-between mt-20">
        <Link href={`/NoticesApp/${offer.id}`}>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Aplicar a esta oferta
          </button>
        </Link>
        <Link href="/Offer">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg">
            Volver
          </button>
        </Link>
      </div>
    </main>
  );
}
