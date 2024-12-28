import { Metadata } from "next";
import Link from "next/link"; // Importar Link de Next.js
import helpersOffers from "@/helpers/helpersOffers";

// Obtener oferta por ID (ya no es necesario hacerla asincrónica si es local)
const getOfferById = (id: number) => {
  return helpersOffers.find((offer) => offer.id === id) || null;
};

// Generar Metadata para SEO dinámico
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  // Debes esperar la resolución de params
  const { id } = await params; // Usamos await para obtener el valor de params.id
  const offer = getOfferById(Number(id));
  if (offer) {
    return {
      title: offer.title,
      description: offer.description,
    };
  }
  return {
    title: "Oferta no encontrada",
    description: "No se encontró la oferta solicitada.",
  };
}

// Componente de la página
export default async function OfferPage({
  params,
}: {
  params: { id: string };
}) {
  // Debes esperar la resolución de params
  const { id } = await params; // Usamos await para acceder a params.id

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
      <p className="mb-4">{offer.description}</p>
      <h2 className="text-2xl font-semibold mb-2">Detalles del Proyecto</h2>
      <p className="mb-4">{offer.projectDescription}</p>
      <h2 className="text-2xl font-semibold mb-2">Requisitos</h2>
      <ul className="list-disc list-inside mb-4">
        {offer.requirements.map((req, index) => (
          <li key={index} className="text-gray-700">
            {req}
          </li>
        ))}
      </ul>

      {/* Botones en línea con espacio entre ellos */}
      <div className="flex justify-between mt-20">
        <Link href={`/apply/${offer.id}`}>
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
