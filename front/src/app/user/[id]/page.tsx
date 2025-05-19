"use client"; // Asegúrate de que este es un componente cliente

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CardProfile from "@/components/Jobs/CardProfile";
import { IProfileData } from "@/Interfaces/IUser";
import { fetchUserId } from "@/components/Fetchs/UsersFetchs/UserFetchs";

const UserProfilePage = () => {
  const params = useParams(); // Obtiene el id de la URL
  const id = params?.id as string; // Convierte el id a string
  
  const [profile, setProfile] = useState<IProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const getUserProfile = async () => {
      try {
        const data = await fetchUserId(id);
        setProfile(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getUserProfile();
  }, [id]);

  if (loading)
    return <p className="text-center text-gray-600">Cargando perfil...</p>;
  if (!profile)
    return <p className="text-center text-red-500">No se encontró el perfil</p>;
  return (
    <div>
      <CardProfile profile={profile} />
    </div>
  );
}  

export default UserProfilePage;
