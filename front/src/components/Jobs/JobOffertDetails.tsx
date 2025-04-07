// JobOfferDetails.tsx
import React, { useContext, useEffect, useState } from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import { BsFillCalendarEventFill } from "react-icons/bs";
import { fetchJobOfferById } from "../Fetchs/OfertasFetch/OfertasFetchs";
import { useRouter } from "next/navigation";
import DeleteButton from "./DeleteJob";
import { UserContext } from "../Context/UserContext";
import EditJobOffer from "./EditJobOffer";  // Importar el componente de edición

interface JobOfferDetailsProps {
  jobId: string;
}

const JobOfferDetails: React.FC<JobOfferDetailsProps> = ({ jobId }) => {
  const [jobOffer, setJobOffer] = useState<IOfferCard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false); // Estado para controlar la edición

  const router = useRouter();
  const { token } = useContext(UserContext);

  const handleViewApplications = () => {
    // Navegar a la ruta de aplicaciones del trabajo usando el jobId
    router.push(`/applications/jobs/${jobId}`);
  };

  const handleDeleteOffer = () => {
    // Establecer jobOffer a null para eliminarla del estado local
    setJobOffer(null);
  };

  const handleEditOffer = () => {
    setIsEditing(true);  // Mostrar el formulario de edición
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Cerrar el formulario de edición
  };

  const handleEditSuccess = (updatedOffer: IOfferCard) => {
    setJobOffer(updatedOffer);  // Actualizar la oferta con los datos editados
    setIsEditing(false); // Cerrar el formulario de edición
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
        <p className="text-center text-lg text-gray-500">Aún no tienes ofertas publicadas.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md max-w-3xl mx-auto my-6">
      {isEditing ? (
        <EditJobOffer
          jobId={jobId}
          token={token || ""}
          jobOffer={jobOffer}
          onCancel={handleCancelEdit}
          onSuccess={handleEditSuccess}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">{jobOffer.title}</h2>
            <span className="text-sm text-gray-500">{jobOffer.status}</span>
          </div>
  
          <div className="text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-2">
              <BsFillCalendarEventFill className="text-xl" />
              <span>Publicado: {new Date(jobOffer.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <div className="text-gray-700 font-semibold"><span>Ubicación:</span> {jobOffer.location}</div>
            <div className="text-gray-700 font-semibold"><span>Salario:</span> {jobOffer.currencyType}{jobOffer.salary}</div>
            <div className="text-gray-700 font-semibold"><span>Género:</span> {jobOffer.sportGenres}</div>
            <div className="text-gray-700 font-semibold"><span>Países:</span> {jobOffer.nationality}</div>
            <div className="text-gray-700 font-semibold"><span>Posición:</span> {jobOffer.position}</div>
            <div className="text-gray-700 font-semibold"><span>Categoría:</span> {jobOffer.category}</div>
            <div className="text-gray-700 font-semibold"><span>Tipo de contrato:</span> {jobOffer.contractTypes}</div>
            <div className="text-gray-700 font-semibold"><span>Duración del contrato:</span> {jobOffer.contractDurations}</div>
          </div>
  
        
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <div className="text-gray-700 font-semibold"><span>Edad mínima:</span> {jobOffer.minAge} años</div>
          <div className="text-gray-700 font-semibold"><span>Edad máxima:</span> {jobOffer.maxAge} años</div>
          <div className="text-gray-700 font-semibold"><span>Disponibilidad para viajar:</span> {jobOffer.availabilityToTravel}</div>
          <div className="text-gray-700 font-semibold"><span>Pasaporte UE:</span> {jobOffer.euPassport}</div>
          <div className="text-gray-700 font-semibold"><span>Correo electrónico:</span> {jobOffer.gmail || "No disponible"}</div>
          </div>
  
          <div className="mb-4">
            <span className="font-semibold text-gray-700">Extras:</span>
            {jobOffer.extra.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {jobOffer.extra.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-700">No disponible</span>
            )}
          </div>

          
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={handleViewApplications}
              className="px-5 py-2 bg-verde-claro text-white rounded-md hover:bg-verde-oscuro transition-colors"
            >
              Ver postulantes
            </button>
            <button
              onClick={handleEditOffer}
              className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Modificar oferta
            </button>
            {token && <DeleteButton jobId={jobId} token={token} onDelete={handleDeleteOffer} />}
          </div>
        </>
      )}
    </div>
  );
  
};

export default JobOfferDetails;
