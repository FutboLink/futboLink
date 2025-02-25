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

        <h2 className="text-xl font-bold mb-4">Datos del Postulante</h2>

        {loading ? (
          <p className="text-gray-600">Cargando...</p>
        ) : applicant ? (
          <>
            <p className="text-gray-700"><strong>Nombre:</strong> {applicant.name} {applicant.lastname}</p>
            <p className="text-gray-700"><strong>Nacionalidad:</strong> {applicant.nationality}</p>
            <p className="text-gray-700"><strong>Género:</strong> {applicant.genre}</p>
            {/* Botón de Link para redirigir */}
            <div className="mt-4">
            <Link
  href={`/user/${applicantId}`}
  className="mt-4 px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition duration-300"
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
