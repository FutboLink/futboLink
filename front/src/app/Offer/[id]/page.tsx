import React from "react";
import Link from "next/link";
import { IOfferCard } from "@/Interfaces/IOffer";
import { getOfertaById } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";

type JobDetailProps = {
  params: { id: string };
};

const JobDetail: React.FC<JobDetailProps> = async ({ params }) => {
  const offer: IOfferCard | null = await getOfertaById(params.id);

  if (!offer) {
    return (
      <div className="p-6 text-center mt-24">
        <h1 className="text-2xl font-bold text-red-600">Oferta no encontrada</h1>
        <p className="mt-2">Lo sentimos, no pudimos encontrar la oferta que buscabas.</p>
        <Link href="/Offer">
          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
            Volver
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 mt-36 text-black  flex gap-8">
      {/* Card de la oferta principal */}
      <div className="bg-white p-6 rounded-lg shadow-lg flex-1">
        <h1 className="text-3xl font-bold mb-4">{offer.position}</h1>
        <p className="mb-4">{offer.description}</p>

      

        <h2 className="text-2xl font-semibold mb-2">Requisitos</h2>
        <ul className="list-disc list-inside mb-4">
       
        </ul>

        <h2 className="text-2xl font-semibold mb-2">Responsabilidades</h2>
        <ul className="list-disc list-inside mb-4">
        
        </ul>

        <h2 className="text-2xl font-semibold mb-2">Habilidades</h2>
        <ul className="list-disc list-inside mb-4">
          
        </ul>
      </div>

      {/* Card con la información adicional */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-2">Información de la Oferta</h2>
        <div className="mb-4">
          <p><strong>Puesto:</strong> {offer.type}</p>
          <p><strong>Ubicación:</strong> {offer.location}</p>
          <p><strong>Contrato:</strong> {offer.offerType}</p>
        </div>

        {/* Botones de aplicar y volver */}
        <Link href={`/applications`}>
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
    </div>
  );
};

export default JobDetail;
