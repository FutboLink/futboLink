import { useState } from "react";
import { useUserContext } from "./useUserContext";

export const useFetchUserProfile = () => {
  const { user, updateUserFields } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://futbolink.onrender.com";

  // Función para convertir el rol a un texto más amigable
  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: string } = {
      PLAYER: "Jugador",
      COACH: "Entrenador",
      RECRUITER: "Reclutador",
      ADMIN: "Administrador",
    };
    return roleMap[role] || role;
  };

  const fetchUserProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const url = `${API_URL}/user/${user.id}`;
      console.log("Realizando solicitud a:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error al cargar el perfil: ${response.status}`);
      }

      const data = await response.json();
      console.log("Datos recibidos:", data);

      // Ajustes de suscripción
      if (!data.subscriptionType && data.subscription) {
        data.subscriptionType = data.subscription;
      } else if (!data.subscriptionType) {
        data.subscriptionType = "Amateur";
      }

      // Ajuste de puesto
      if (data.role) {
        data.puesto = getRoleDisplay(data.role);
      } else if (data.posicion) {
        data.puesto = data.posicion;
      }

      // Actualizar campos en contexto
      updateUserFields({
        imgUrl: data.imgUrl,
        name: data.name,
        lastname: data.lastname,
        role: data.role,
        applications: data.applications || [],
        jobs: data.jobs || [],
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return { fetchUserProfile, loading, error };
};
