"use client"; // Asegúrate de que este es un componente cliente

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { INotice } from "@/Interfaces/INews";
import { getNewsById } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import CardNoticias from "@/components/PanelAdmin/Noticias/CardNoticias";

const UserProfilePage = () => {
  const params = useParams(); // Obtiene el id de la URL
  const id = params?.id as string; // Convierte el id a string
  
  const [notice, setNotice] = useState<INotice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const getNoticias = async () => {
      try {
        const data = await getNewsById(id);
        setNotice(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getNoticias();
  }, [id]);

  if (loading) return <p className="text-center text-gray-600">Cargando perfil...</p>;
  if (!notice) return <p className="text-center text-red-500">No se encontró la noticia</p>;

  return (
    <div>
      <CardNoticias notice={notice} />
    </div>
  );
}  

export default UserProfilePage;
