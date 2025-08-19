import { useCallback, useState } from "react";

interface VerificationStatus {
  isVerified: boolean;
  columnExists: boolean;
  verificationLevel?: "NONE" | "SEMIPROFESSIONAL" | "PROFESSIONAL";
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://futbolink.onrender.com";

export function useVerificationStatus(token?: string | null) {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);

  const fetchVerificationStatus = useCallback(
    async (userId: string) => {
      try {
        const response = await fetch(
          `${API_URL}/user/${userId}/verification-status`,
          {
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          },
        );

        if (response.ok) {
          const status = await response.json();
          setVerificationStatus(status);
          console.log("Estado de verificación:", status);
        } else {
          console.log("No se pudo obtener el estado de verificación");
          setVerificationStatus({ isVerified: false, columnExists: false });
        }
      } catch (error) {
        console.error("Error al obtener estado de verificación:", error);
        setVerificationStatus({ isVerified: false, columnExists: false });
      }
    },
    [token],
  );

  return { verificationStatus, fetchVerificationStatus };
}
