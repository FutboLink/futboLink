import React, { useEffect, useState } from "react";

import { fetchUserId } from "../Fetchs/UsersFetchs/UserFetchs";
import Link from "next/link";

interface Applicant {
  name: string;
  lastname: string;
  nationality: string;
  genre: string;
}

interface ApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantId: string;
}

const ApplicantModal: React.FC<ApplicantModalProps> = ({ isOpen, onClose, applicantId }) => {
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !applicantId) return;

    const fetchApplicant = async () => {
      setLoading(true);
      try {
        const data = await fetchUserId(applicantId);
        setApplicant(data);
      } catch {
        setApplicant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicant();
  }, [isOpen, applicantId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        {/* Botón de cierre */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 bg-verde-oscuro text-center mt-2 text-white p-2 rounded">Datos del Postulante</h2>

        {loading ? (
          <p className="text-gray-600">Cargando...</p>
        ) : applicant ? (
          <>
            <p className="text-gray-700"><strong>Nombre:</strong> {applicant.name} {applicant.lastname}</p>
            <p className="text-gray-700"><strong>Nacionalidad:</strong> {applicant.nationality}</p>
            <p className="text-gray-700"><strong>Género:</strong> {applicant.genre}</p>
            {/* Botón de Link para redirigir */}
            <div className="mt-4 text-center">
            <Link
  href={`/user/${applicantId}`}
  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-sm shadow-gray-400 font-semibold border-2 rounded-lg hover:font-bold transition"
>
  Ver perfil
</Link>


            </div>
          </>
        ) : (
          <p className="text-red-500">Error al cargar los datos.</p>
        )}
      </div>
    </div>
  );
};

export default ApplicantModal;
