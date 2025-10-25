// JobOfferDetails.tsx

import { useRouter } from "next/navigation";
import type React from "react";
import { useContext, useEffect, useState } from "react";
import { BsFillCalendarEventFill } from "react-icons/bs";
import { FaMapMarkerAlt, FaMoneyBillWave, FaUsers, FaEdit, FaTrash, FaEye, FaCheckCircle, FaClock } from "react-icons/fa";
import type { IOfferCard } from "@/Interfaces/IOffer";
import { UserType } from "@/Interfaces/IUser";
import { UserContext } from "../Context/UserContext";
import { fetchJobOfferById } from "../Fetchs/OfertasFetch/OfertasFetchs";
import DeleteButton from "./DeleteJob";
import EditJobOffer from "./EditJobOffer"; // Importar el componente de edición
import RecruiterApplicationModal from "./RecruiterApplicationModal";

interface JobOfferDetailsProps {
  jobId: string;
}

const JobOfferDetails: React.FC<JobOfferDetailsProps> = ({ jobId }) => {
  const [jobOffer, setJobOffer] = useState<IOfferCard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false); // Estado para controlar la edición
  const [showRecruiterModal, setShowRecruiterModal] = useState<boolean>(false); // Estado para el modal de reclutador

  const router = useRouter();
  const { token, user } = useContext(UserContext);

  const handleViewApplications = () => {
    // Navegar a la ruta de aplicaciones del trabajo usando el jobId
    router.push(`/applications/jobs/${jobId}`);
  };

  const handleDeleteOffer = () => {
    // Establecer jobOffer a null para eliminarla del estado local
    setJobOffer(null);
  };

  const handleEditOffer = () => {
    setIsEditing(true); // Mostrar el formulario de edición
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Cerrar el formulario de edición
  };

  const handleEditSuccess = (updatedOffer: IOfferCard) => {
    setJobOffer(updatedOffer); // Actualizar la oferta con los datos editados
    setIsEditing(false); // Cerrar el formulario de edición
  };

  const handleOpenRecruiterModal = () => {
    setShowRecruiterModal(true);
  };

  const handleCloseRecruiterModal = () => {
    setShowRecruiterModal(false);
  };

  useEffect(() => {
    const fetchJobOffer = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchJobOfferById(jobId);
        if (!data) {
          setJobOffer(null);
        } else {
          setJobOffer(data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "Hubo un error al obtener la oferta");
        } else {
          setError("Hubo un error desconocido al obtener la oferta");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobOffer();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-6">
        <p className="text-center text-lg text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full py-6">
        <p className="text-center text-lg text-red-600">{error}</p>
      </div>
    );
  }

  if (!jobOffer) {
    return (
      <div className="flex justify-center items-center h-full py-6">
        <p className="text-center text-lg text-gray-500">
          Aún no tienes ofertas publicadas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden my-3">
      {isEditing ? (
        <div className="p-4">
          <EditJobOffer
            jobId={jobId}
            token={token || ""}
            jobOffer={jobOffer}
            onCancel={handleCancelEdit}
            onSuccess={handleEditSuccess}
          />
        </div>
      ) : (
        <>
          {/* Header de la Card - Compacto */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  {jobOffer.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <BsFillCalendarEventFill className="text-green-600" />
                  <span>
                    {new Date(jobOffer.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              {/* Badge de Estado - Compacto */}
              <div>
                {jobOffer.status === 'Activa' || jobOffer.status === 'open' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold border border-green-200">
                    <FaCheckCircle className="text-green-600 text-xs" />
                    Activa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold border border-gray-200">
                    <FaClock className="text-gray-600 text-xs" />
                    {jobOffer.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Información Principal - Compacta */}
          <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <FaMapMarkerAlt className="text-blue-600 text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 uppercase font-medium">Ubicación</p>
                <p className="text-xs font-semibold text-gray-900 truncate">{jobOffer.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm">
              <div className="p-1.5 bg-green-100 rounded-md">
                <FaMoneyBillWave className="text-green-600 text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 uppercase font-medium">Salario</p>
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {jobOffer.currencyType}{jobOffer.salary}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm">
              <div className="p-1.5 bg-purple-100 rounded-md">
                <FaUsers className="text-purple-600 text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 uppercase font-medium">Categoría</p>
                <p className="text-xs font-semibold text-gray-900 truncate">{jobOffer.category}</p>
              </div>
            </div>
          </div>

          {/* Detalles de la Oferta - Compactos */}
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 border-b pb-1">Detalles</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                <span className="text-gray-600 text-xs">Género:</span>
                <span className="font-semibold text-gray-900 text-xs">{jobOffer.sportGenres}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                <span className="text-gray-600 text-xs">Posición:</span>
                <span className="font-semibold text-gray-900 text-xs truncate ml-1">{jobOffer.position || "N/E"}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                <span className="text-gray-600 text-xs">Contrato:</span>
                <span className="font-semibold text-gray-900 text-xs truncate ml-1">{jobOffer.contractTypes}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                <span className="text-gray-600 text-xs">Duración:</span>
                <span className="font-semibold text-gray-900 text-xs truncate ml-1">{jobOffer.contractDurations}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                <span className="text-gray-600 text-xs">Edad:</span>
                <span className="font-semibold text-gray-900 text-xs">{jobOffer.minAge}-{jobOffer.maxAge}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                <span className="text-gray-600 text-xs">Pasaporte UE:</span>
                <span className="font-semibold text-gray-900 text-xs">{jobOffer.euPassport}</span>
              </div>
            </div>

            {/* Extras - Compacto */}
            {jobOffer.extra && jobOffer.extra.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1 text-xs">
                  <span className="text-blue-600">⭐</span>
                  Extras
                </h4>
                <ul className="space-y-1">
                  {jobOffer.extra.map((item, index) => (
                    <li key={index} className="flex items-start gap-1 text-xs text-gray-700">
                      <span className="text-blue-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer con Botones */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={handleViewApplications}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
              >
                <FaEye className="text-base" />
                <span>Ver Postulantes</span>
              </button>

              {/* Botón para reclutadores */}
              {user &&
                user.role === UserType.RECRUITER &&
                jobOffer.recruiter &&
                user.id !== jobOffer.recruiter.id && (
                  <button
                    onClick={handleOpenRecruiterModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    <FaUsers className="text-base" />
                    <span>Postular Jugadores</span>
                  </button>
                )}

              <button
                onClick={handleEditOffer}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
              >
                <FaEdit className="text-base" />
                <span>Modificar</span>
              </button>
              
              {token && (
                <DeleteButton
                  jobId={jobId}
                  token={token}
                  onDelete={handleDeleteOffer}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal para que reclutadores postulen jugadores */}
      {jobOffer && (
        <RecruiterApplicationModal
          isOpen={showRecruiterModal}
          onClose={handleCloseRecruiterModal}
          jobId={jobId}
          jobTitle={jobOffer.title}
        />
      )}
    </div>
  );
};

export default JobOfferDetails;
