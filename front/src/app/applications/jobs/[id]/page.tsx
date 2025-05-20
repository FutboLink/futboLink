"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import JobApplications from "@/components/Jobs/JobApplications";

const JobApplicationsPage: React.FC = () => {
  const { id } = useParams();
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    if (typeof id === "string") {
      setJobId(id);
      setLoading(false);
    }
  }, [id]);

  return (
    <div className="min-h-[80vh]">
      {jobId && <JobApplications jobId={jobId} />}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-400"></div>
        </div>
      )}
    </div>
  );
};

export default JobApplicationsPage;