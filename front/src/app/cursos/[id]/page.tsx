"use client"; // Asegúrate de que este es un componente cliente

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCursosById } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import { ICurso } from "@/Interfaces/ICursos";
import CardCurso from "@/components/PanelAdmin/Cursos/CardCurso";

const UserProfilePage = () => {
  const params = useParams(); // Obtiene el id de la URL
  const id = params?.id as string; // Convierte el id a string
  
  const [curso, setCurso] = useState<ICurso | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const getCursos = async () => {
      try {
        const data = await getCursosById(id);
        setCurso(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getCursos();
  }, [id]);

  if (loading) return <p className="text-center text-gray-600">Cargando curso...</p>;
  if (!curso) return <p className="text-center text-red-500">No se encontró el curso</p>;

  return (
    <div>
      <CardCurso curso={curso} />
    </div>
  );
}  

export default UserProfilePage;
