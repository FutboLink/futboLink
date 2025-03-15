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

  useEffect(() => {
    if (!jobId) return;

    fetchApplicationsByJobId(jobId).then((data) => {
      setApplications(data);
      setLoading(false);
    });
  }, [jobId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full mt-24">
        <p className="text-center text-lg text-gray-600">Cargando...</p>
      </div>
    );
  if (applications.length === 0)
    return (
      <div className="flex justify-center items-center h-full mt-24">
        <p className="text-center text-lg text-gray-600">No hay aplicaciones.</p>
      </div>
    );

  return (
    <div className="mt-24"> <h2 className=" text-white text-center text-lg bg-green-600 p-4 font-semibold">
    APLICACIONES 
  </h2>
  <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-2">
  {applications.map((app) => (
     <div
     key={app.id}
     className="flex flex-col p-6 bg-gradient-to-b from-gray-100 to-gray-50 border border-gray-300 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full"
   >
      <div className="flex items-center space-x-2 mb-3">
        <BsFillFileTextFill className="text-gray-700" size={24} />
      </div>
      <p className="text-gray-800 text-base mb-3 flex-grow">{app.message}</p>
      <div className="flex items-center space-x-2 mb-3">
        
        <div className="flex items-center space-x-1 text-xs text-gray-500 opacity-75">
          <BsFillClockFill />
          <p>{new Date(app.appliedAt).toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-auto"> {/* Hace que el botón quede alineado al final */}
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 shadow-sm shadow-gray-400 font-semibold border-2 rounded-lg hover:font-bold transition"
          onClick={() => setSelectedApplicantId(app.player.id)} 
        >
          Ver datos postulante
        </button>
      </div>
    </div>
  ))}
</div>

{/* Modal de datos del postulante */}
<ApplicantModal
  isOpen={!!selectedApplicantId}
  onClose={() => setSelectedApplicantId(null)}
  applicantId={selectedApplicantId || ""}
/>

</div>
  );
};

export default JobApplications;
