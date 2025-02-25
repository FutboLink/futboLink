"use client";
import React, { useEffect, useState } from "react";
import { fetchApplicationsByJobId } from "../Fetchs/OfertasFetch/OfertasFetchs";
import { IJobApplication } from "@/Interfaces/IOffer";
import { BsFillFileTextFill, BsFillClockFill } from "react-icons/bs";
import ApplicantModal from "./ApplicationModal";

interface JobApplicationsProps {
  jobId: string;
}

const JobApplications: React.FC<JobApplicationsProps> = ({ jobId }) => {
  const [applications, setApplications] = useState<IJobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
 const applicantId = "1c8d8f0e-ce4b-4e2b-bc2a-f9098ffdaeb2";
  useEffect(() => {
    if (!jobId) return;

    fetchApplicationsByJobId(jobId).then((data) => {
      setApplications(data);
      setLoading(false);
    });
  }, [jobId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-center text-lg text-gray-600">Cargando...</p>
      </div>
    );
  if (applications.length === 0)
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-center text-lg text-gray-600">No hay aplicaciones.</p>
      </div>
    );

  return (
    <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {applications.map((app) => (
        <div
          key={app.id}
          className="flex flex-col p-6 bg-gradient-to-r from-green-100 via-gray-200 to-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center space-x-2 mb-3">
            <BsFillFileTextFill className="text-gray-700" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">{app.id}</h3>
          </div>
          <p className="text-gray-800 text-base mb-3">{app.message}</p>
          <div className="flex items-center space-x-2">
            <p
              className={`text-sm font-medium text-white ${
                app.status === "PENDING"
                  ? "bg-yellow-300"
                  : app.status === "OPEN"
                  ? "bg-green-500"
                  : "bg-gray-500"
              } py-1 px-2 rounded-full`}
            >
              {app.status}
            </p>
            <div className="flex items-center space-x-1 text-xs text-gray-500 opacity-75">
              <BsFillClockFill />
              <p>{new Date(app.appliedAt).toLocaleString()}</p>
            </div>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-gray-100 text-green-600 shadow-sm shadow-gray-400 border-green-600 border-2 rounded-lg hover:bg-green-600 hover:text-white transition"
            onClick={() => setSelectedApplicantId(applicantId)}
          >
            Datos postulante
          </button>
        </div>
      ))}

      {/* Modal de datos del postulante */}
      <ApplicantModal
        isOpen={!!selectedApplicantId}
        onClose={() => setSelectedApplicantId(null)}
        applicantId={selectedApplicantId}
      />
    </div>
  );
};

export default JobApplications;
