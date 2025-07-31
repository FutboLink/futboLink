"use client";
import { useUserContext } from "@/hook/useUserContext";
import { ApplicationStatus, IJobApplication } from "@/Interfaces/IOffer";
import React, { useEffect, useState } from "react";
import { fetchApplicationsByJobId } from "../Fetchs/OfertasFetch/OfertasFetchs";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import UserCard from "../PlayerSearch/UserCard";

interface JobApplicationsProps {
  jobId: string;
}

const JobApplications: React.FC<JobApplicationsProps> = ({ jobId }) => {
  const [applications, setApplications] = useState<IJobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null
  );
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);
  const { token } = useUserContext();

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
    setSelectedCandidates((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const shortlistCandidates = async () => {
    if (!token) {
      setNotification({
        message: "Debes iniciar sesión para realizar esta acción",
        isError: true,
      });
      return;
    }

    if (selectedCandidates.length === 0) {
      setNotification({
        message: "Selecciona al menos un candidato",
        isError: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/shortlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ applicationIds: selectedCandidates }),
        }
      );

      if (response.ok) {
        // Actualizar el estado de las aplicaciones
        const updatedApplications = await fetchApplicationsByJobId(jobId);
        setApplications(updatedApplications);

        setNotification({
          message: `${selectedCandidates.length} candidato(s) seleccionado(s) para evaluación`,
          isError: false,
        });

        // Limpiar selección
        setSelectedCandidates([]);
        setIsSelectionMode(false);
      } else {
        const error = await response.json();
        setNotification({
          message: error.message || "Error al seleccionar candidatos",
          isError: true,
        });
      }
    } catch (error) {
      console.error("Error al seleccionar candidatos:", error);
      setNotification({
        message: "Error al seleccionar candidatos",
        isError: true,
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {applications.map((app) => {
          const currentUser = app.player;

          if (!currentUser) return null;

          const isShortlisted = app.status === ApplicationStatus.SHORTLISTED;

          return (
            <UserCard
              key={app.id}
              currentUser={currentUser}
              t={(key: string) => key}
              isAddingToPortfolio={null}
              handleAddToPortfolio={() => {}}
              // Nuevas props para manejar selección
              isSelectionMode={isSelectionMode}
              isSelected={selectedCandidates.includes(app.id)}
              onSelect={() => toggleCandidateSelection(app.id)}
              isShortlisted={isShortlisted}
            />
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
