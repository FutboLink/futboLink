"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import JobApplications from "@/components/Jobs/JobApplications";

const JobApplicationsPage: React.FC = () => {
  const { id } = useParams(); // Accedemos al parámetro `id` directamente desde la URL
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    // Aseguramos que `id` sea un string antes de asignarlo a `jobId`
    if (typeof id === "string") {
      setJobId(id);
    }
  }, [id]); // Dependencia para que useEffect se ejecute cuando `id` cambie

  // Si el jobId no está disponible, mostramos un mensaje de carga
  if (!jobId) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-center text-lg text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Pasamos el jobId al componente JobApplications */}
      <JobApplications jobId={jobId} />
    </div>
  );
};

export default JobApplicationsPage;
