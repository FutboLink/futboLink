import { Metadata } from "next";
import Link from "next/link";
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
  const { id } = await params;
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
  const { id } = await params;

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
          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl">
            Volver
          </button>
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 mt-36 text-black max-w-6xl mx-auto flex gap-8">
      {/* Card de la oferta principal */}
      <div className="bg-white p-6 rounded-lg shadow-lg flex-1">
        <h1 className="text-3xl font-bold mb-4">{offer.title}</h1>
        <p className="mb-4">{offer.description}</p>

        <h2 className="text-2xl font-semibold mb-2">
          Descripción del Proyecto
        </h2>
        <p className="mb-4">{offer.projectDescription}</p>

        <h2 className="text-2xl font-semibold mb-2">Requisitos</h2>
        <ul className="list-disc list-inside mb-4">
          {offer.requirements.map((req, index) => (
            <li key={index} className="text-gray-700">
              {req}
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mb-2">Responsabilidades</h2>
        <ul className="list-disc list-inside mb-4">
          {offer.responsibilities.map((resp, index) => (
            <li key={index} className="text-gray-700">
              {resp}
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mb-2">Habilidades</h2>
        <ul className="list-disc list-inside mb-4">
          {offer.skills.map((skill, index) => (
            <li key={index} className="text-gray-700">
              {skill}
            </li>
          ))}
        </ul>
      </div>

      {/* Card con la información adicional */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-2">Información de la Oferta</h2>
        <div className="mb-4">
          <p>
            <strong>Puesto:</strong> {offer.category}
          </p>
          <p>
            <strong>Ubicación:</strong> {offer.country}
          </p>
          <p>
            <strong>Contrato:</strong> {offer.contract}
          </p>
        </div>

        {/* Botones de aplicar y volver */}
        <Link href={`/apply/${offer.id}`}>
          <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 mb-4">
            Aplicar a esta oferta
          </button>
        </Link>

        <Link href="/Offer">
          <button className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
            Volver
          </button>
        </Link>
      </div>
    </main>
  );
}
