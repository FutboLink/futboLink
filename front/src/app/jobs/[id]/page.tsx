"use client"
import React, { useState, useEffect, useContext } from 'react';
import { IOfferCard } from '@/Interfaces/IOffer';
import { getOfertaById } from '@/components/Fetchs/OfertasFetch/OfertasAdminFetch';
import ModalApplication from '@/components/Applications/ModalApplications';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Usar useParams para acceder a los parámetros
import { UserContext } from '@/components/Context/UserContext';

const JobDetail: React.FC = () => {
  const params = useParams(); // Usamos useParams para obtener los parámetros de la ruta
  const [offer, setOffer] = useState<IOfferCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const { token } = useContext(UserContext);



  useEffect(() => {
    // Aseguramos que params.id sea un string
    if (params && params.id) {
      // Si params.id es un arreglo, tomamos el primer valor
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      setJobId(id);  // Asignamos el id al estado
    }
  }, [params]);

 
  console.log("Token:", token); // Verifica si el token existe

  // Función para decodificar el token sin usar librerías externas
  const decodeToken = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
  
    const decoded = JSON.parse(jsonPayload);
    console.log("Decoded token:", decoded);  // Agrega un console.log aquí
    return decoded;
  };
  
 // Verificar si el token existe antes de intentar decodificarlo
 const userId = token ? decodeToken(token).id : null;  // Cambia 'userId' por 'id'



  useEffect(() => {
    const fetchOffer = async () => {
      if (jobId) {
        const fetchedOffer = await getOfertaById(jobId);
        setOffer(fetchedOffer);
      }
    };

    fetchOffer();
  }, [jobId]);

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

  const handleApplyClick = () => {
    console.log("JobId:", jobId, "UserId:", userId); // Verifica los valores antes de abrir el modal

    console.log("Button clicked!"); // Verifica si el botón es clickeado
    setIsModalOpen(true); // Abrimos el modal cuando el usuario hace clic
  };
  
  const handleCloseModal = () => {
    console.log("Modal closed"); // Verifica si el modal se está cerrando
    setIsModalOpen(false); // Cerramos el modal cuando el usuario lo cierre
  };
  
  return (
    <div className="p-6 mt-36 text-black flex gap-8">
      {/* Card de la oferta principal */}
      <div className="bg-white p-6 rounded-lg shadow-lg flex-1">
        <h1 className="text-3xl font-bold mb-4">{offer.position}</h1>
        <p className="mb-4">{offer.description}</p>

        <h2 className="text-2xl font-semibold mb-2">Requisitos</h2>
        <ul className="list-disc list-inside mb-4">
          {/* Requisitos si es necesario */}
        </ul>

        <h2 className="text-2xl font-semibold mb-2">Responsabilidades</h2>
        <ul className="list-disc list-inside mb-4">
          {/* Responsabilidades si es necesario */}
        </ul>

        <h2 className="text-2xl font-semibold mb-2">Habilidades</h2>
        <ul className="list-disc list-inside mb-4">
          {/* Habilidades si es necesario */}
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
        <button
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 mb-4"
          onClick={handleApplyClick}
        >
          Aplicar a esta oferta
        </button>

        <Link href="/Offer">
          <button className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
            Volver
          </button>
        </Link>
      </div>

      {/* Modal para aplicar a la oferta */}
      {isModalOpen && userId && jobId && (
        <ModalApplication
          jobId={jobId}  // Aquí pasamos jobId solo si no es null
          userId={userId} // Asegúrate de pasar el userId
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default JobDetail;
