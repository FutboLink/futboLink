"use client"
import React, { useState, useEffect, useContext } from 'react';
import { IOfferCard } from '@/Interfaces/IOffer';
import { getOfertaById } from '@/components/Fetchs/OfertasFetch/OfertasAdminFetch';
import ModalApplication from '@/components/Applications/ModalApplications';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
        <Link href="/jobs">
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
    <div className="flex flex-col md:flex-row gap-12 justify-center mt-20 px-4 sm:px-6 lg:px-8">
      {/* Card de la oferta principal */}
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full transition-all duration-300">
        <h1 className="text-4xl font-extrabold mb-6 bg-green-600 text-white text-center p-2 rounded">{offer.title}</h1>
        <h2 className="text-2xl p-2 font-extrabold bg-gray-600 text-white rounded mb-6  text-center mx-auto">
  {offer.position}
</h2>

  
        {/* Requisitos */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{offer.description}</h2>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Requisitos:</h2>
          <ul className="list-inside space-y-2 text-gray-700">
            <li><strong>Géneros Deportivos:</strong> {offer.sportGenres}</li>
            <li><strong>Disponibilidad para viajar:</strong> {offer.availabilityToTravel}</li>
            <li><strong>Pasaporte Europeo:</strong> {offer.euPassport}</li>
            <li><strong>Edad mínima:</strong> {offer.minAge}</li>
            <li><strong>Edad máxima:</strong> {offer.maxAge}</li>
            <li><strong>Experiencia mínima:</strong> {offer.minExperience}</li>
            <li><strong>Deporte:</strong> {offer.sport}</li>
            <li><strong>Tipo de contrato:</strong> {offer.contractTypes}</li>
            <li><strong>Fecha de creación:</strong> {offer.createdAt}</li>
          </ul>
        </div>
      </div>
  
      {/* Card con la información adicional */}
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg transition-all hover:scale-105 hover:shadow-2xl duration-300">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Información de la Oferta</h2>
        <div className="space-y-4 text-gray-700">
          <p><strong>Puesto:</strong> {offer.position}</p>
          <p><strong>País:</strong> {offer.nationality}</p>
          <p><strong>Ciudad:</strong> {offer.location}</p>
          <p><strong>Contrato:</strong> {offer.contractTypes}</p>
          <p><strong>Duración del contrato:</strong> {offer.contractDurations}</p>
          <p className="text-green-500 text-center font-bold text-lg border-2 border-green-500 rounded p-2">
            <strong>Salario:</strong> ${offer.salary}
          </p>
        </div>
  
        {/* Botones de aplicar y volver */}
        <div className="mt-8 space-y-4">
          <button
            className="w-full px-3 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-200"
            onClick={handleApplyClick}
          >
            Aplicar a esta oferta
          </button>
  
          <Link href="/jobs">
            <button className="w-full px-3 mt-2 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200">
              Volver
            </button>
          </Link>
        </div>
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
