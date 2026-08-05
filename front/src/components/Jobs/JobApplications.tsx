"use client";
import { useUserContext } from "@/hook/useUserContext";
import { ApplicationStatus, IJobApplication } from "@/Interfaces/IOffer";
import React, { useEffect, useState } from "react";
import { fetchApplicationsByJobId } from "../Fetchs/OfertasFetch/OfertasFetchs";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import ApplicantCard from "../Applications/ApplicantCard";

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
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
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
     <div className="flex flex-wrap gap-4 mt-8 mb-8">

  {[
    {
      key: "ALL",
      label: "Todos",
      count: applications.length,
    },
    {
      key: "PENDING",
      label: "Postulados",
      count: applications.filter(a => a.status === "PENDING").length,
    },
    {
      key: "IN_REVIEW",
      label: "En revisión",
      count: applications.filter(a => a.status === "IN_REVIEW").length,
    },
    {
      key: "PROFILE_VIEWED",
      label: "Perfil visto",
      count: applications.filter(a => a.status === "PROFILE_VIEWED").length,
    },
    {
      key: "INTERESTED",
      label: "Interés",
      count: applications.filter(a => a.status === "INTERESTED").length,
    },
  ].map((filter) => (

    <button
      key={filter.key}
      onClick={() => setStatusFilter(filter.key)}
      className={`
        w-36
        rounded-2xl
        border
        p-4
        text-center
        transition-all
        duration-200
        shadow-sm
        hover:shadow-md
        hover:-translate-y-1
        ${
          statusFilter === filter.key
            ? "bg-[#3d7a26] text-white border-[#3d7a26]"
            : "bg-white border-gray-200 text-gray-700"
        }
      `}
    >
      <div className="text-3xl font-bold">
        {filter.count}
      </div>

      <div className="mt-1 text-sm font-medium">
        {filter.label}
      </div>

    </button>

  ))}

</div>

<div className="bg-gray-50 border border-gray-200 rounded-t-xl">
  <div className="grid grid-cols-[3.5fr_220px_170px_170px] items-center gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">

<div>Candidato</div>

<div className="flex justify-center">
  <span>País</span>
</div>

<div className="flex justify-center">
  <span>Estado</span>
</div>

<div className="flex justify-center">
  <span>Acciones</span>
</div>

  </div>
</div>
      
      <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-hidden mb-8">
        {applications
  .filter((app) => {
    if (statusFilter === "ALL") return true;
    return app.status === statusFilter;
  })
  .map((app) => {
          const currentUser = app.player;

          if (!currentUser) return null;

          const isShortlisted = app.status === ApplicationStatus.SHORTLISTED;
          const applicationStatus = app.status;

          return (
             <ApplicantCard
                key={app.id}
                application={app}
                currentUser={currentUser}
                t={(key: string) => key}
                isAddingToPortfolio={null}
                handleAddToPortfolio={() => {}}
                isSelectionMode={isSelectionMode}
                isSelected={selectedCandidates.includes(app.id)}
                onSelect={() => toggleCandidateSelection(app.id)}
                isShortlisted={isShortlisted}
                applicationStatus={applicationStatus}
                onStatusChange={(newStatus) => {
                setApplications((prev) =>
                  prev.map((a) =>
                   a.id === app.id
                   ? { ...a, status: newStatus as ApplicationStatus }
                     : a
                )
              );
           }}
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
