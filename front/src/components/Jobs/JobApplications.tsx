"use client";
import React, { useEffect, useState, useContext } from "react";
import { fetchApplicationsByJobId } from "../Fetchs/OfertasFetch/OfertasFetchs";
import { IJobApplication, ApplicationStatus } from "@/Interfaces/IOffer";
import { BsFillClockFill, BsCheckCircle } from "react-icons/bs";
import ApplicantModal from "./ApplicationModal";
import Link from "next/link";
import { renderCountryFlag } from "../countryFlag/countryFlag";
import Image from "next/image";
import { UserContext } from "../Context/UserContext";
import { NotificationsForms } from "../Notifications/NotificationsForms";

interface JobApplicationsProps {
  jobId: string;
}

const JobApplications: React.FC<JobApplicationsProps> = ({ jobId }) => {
  const [applications, setApplications] = useState<IJobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [notification, setNotification] = useState<{ message: string; isError: boolean } | null>(null);
  const { token } = useContext(UserContext);

  useEffect(() => {
    if (!jobId) return;

    fetchApplicationsByJobId(jobId).then((data) => {
      setApplications(data);
      setLoading(false);
    });
  }, [jobId]);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedCandidates([]);
  };

  const toggleCandidateSelection = (applicationId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId) 
        : [...prev, applicationId]
    );
  };

  const shortlistCandidates = async () => {
    if (!token) {
      setNotification({
        message: "Debes iniciar sesión para realizar esta acción",
        isError: true
      });
      return;
    }

    if (selectedCandidates.length === 0) {
      setNotification({
        message: "Selecciona al menos un candidato",
        isError: true
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/shortlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ applicationIds: selectedCandidates })
      });

      if (response.ok) {
        // Actualizar el estado de las aplicaciones
        const updatedApplications = await fetchApplicationsByJobId(jobId);
        setApplications(updatedApplications);
        
        setNotification({
          message: `${selectedCandidates.length} candidato(s) seleccionado(s) para evaluación`,
          isError: false
        });
        
        // Limpiar selección
        setSelectedCandidates([]);
        setIsSelectionMode(false);
      } else {
        const error = await response.json();
        setNotification({
          message: error.message || "Error al seleccionar candidatos",
          isError: true
        });
      }
    } catch (error) {
      console.error("Error al seleccionar candidatos:", error);
      setNotification({
        message: "Error al seleccionar candidatos",
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  if (applications.length === 0)
    return (
      <div className="flex justify-center items-center h-full mt-24">
        <p className="text-center text-lg text-gray-600">
          No hay aplicaciones.
        </p>
      </div>
    );

  return (
    <div className="min-h-[80vh] mt-12 p-4 pt-[4rem] bg-gray-100 sm:p-6 sm:pt-[4rem] lg:p-12 lg:pb-16">
      <h2 className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white text-[1.8rem] p-2 font-semibold text-center">
        APLICACIONES
      </h2>

      {notification && (
        <div className="my-4">
          <NotificationsForms
            message={notification.message}
            isError={notification.isError}
          />
        </div>
      )}

      <div className="flex justify-end mb-4 mt-4">
        {isSelectionMode ? (
          <div className="flex gap-2">
            <button
              onClick={shortlistCandidates}
              disabled={selectedCandidates.length === 0}
              className={`px-4 py-2 text-white rounded-md ${
                selectedCandidates.length > 0
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Seleccionar {selectedCandidates.length} candidato(s)
            </button>
            <button
              onClick={toggleSelectionMode}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={toggleSelectionMode}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Seleccionar candidatos
          </button>
        )}
      </div>

      <div className="grid gap-6 p-6 py-[4rem] max-w-[100rem] mx-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {applications.map((app) => {
          const isSelected = selectedCandidates.includes(app.id);
          const isShortlisted = app.status === ApplicationStatus.SHORTLISTED;
          
          return (
            <div
              key={app.id}
              className={`relative flex flex-col justify-between gap-8 bg-white p-6 border-[1px] border-gray-400 border rounded-[1.25rem] shadow-lg hover:shadow-2xl transition-all duration-300 h-full ${
                isSelected ? "ring-2 ring-green-500" : ""
              } ${isShortlisted ? "bg-green-50" : ""}`}
              onClick={() => isSelectionMode && toggleCandidateSelection(app.id)}
              style={{ cursor: isSelectionMode ? "pointer" : "default" }}
            >
              {isSelectionMode && (
                <div className="absolute top-2 right-2 z-10">
                  <div
                    className={`w-6 h-6 rounded-full border ${
                      isSelected
                        ? "bg-green-500 border-green-600"
                        : "bg-white border-gray-300"
                    } flex items-center justify-center`}
                  >
                    {isSelected && (
                      <BsCheckCircle className="text-white" />
                    )}
                  </div>
                </div>
              )}
              
              {isShortlisted && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Seleccionado
                </div>
              )}
              
              {app.player?.subscriptionType === "Semiprofesional" && (
                <Image
                  className="absolute right-[1rem]"
                  src={"/botin2.svg"}
                  alt="Premium subscription badge"
                  width={50}
                  height={50}
                />
              )}
              {app.player?.subscriptionType === "Profesional" && (
                <Image
                  className="absolute right-[1rem]"
                  src={"/botin3.svg"}
                  alt="Premium subscription badge"
                  width={50}
                  height={50}
                />
              )}
              <div className="flex flex-col items-center w-full gap-2">
                <Image
                  src={
                    app.player?.imgUrl ||
                    "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"
                  }
                  alt={app.player?.name || "Foto de perfil"}
                  width={100}
                  height={100}
                  className="rounded-full w-[6rem] h-[6rem] object-cover mb-4 md:mb-0"
                />
                <h3 className="text-green-800 border-b-2 border-green-800 font-semibold uppercase text-center">
                  {app.player?.name || "Usuario"} {app.player?.lastname || ""}
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-start w-full gap-4">
                  {app.player?.nationality &&
                    renderCountryFlag(app.player.nationality)}
                  <p className="text-gray-700">
                    {app.player?.genre || "No especificado"}
                  </p>
                </div>
                <p className="text-gray-700">
                  <strong>Ubicación actual:</strong>{" "}
                  {app.player?.ubicacionActual || "No especificada"}
                </p>
                <div className="flex items-center mb-3 space-x-1 text-xs text-gray-500 opacity-75">
                  <BsFillClockFill />
                  <p>{new Date(app.appliedAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-center">
                <Link
                  href={`/user-viewer/${app.player?.id}`}
                  className="px-4 py-2 px-6 bg-white font-bold text-green-800 border-2 border-green-800 rounded-md transition-color duration-300 hover:bg-green-800 hover:text-white"
                  onClick={(e) => isSelectionMode && e.preventDefault()}
                >
                  Ver perfil
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de datos del postulante */}
      {/* <ApplicantModal
        isOpen={!!selectedApplicantId}
        onClose={() => setSelectedApplicantId(null)}
        applicantId={selectedApplicantId || ""}
      /> */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-400"></div>
        </div>
      )}
    </div>
  );
};

export default JobApplications;
