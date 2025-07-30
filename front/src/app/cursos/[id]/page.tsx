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

  const asd = {
    id: "139f2cc9-e1cf-40b7-b895-a76c6f738bbe",
    image:
      "https://res.cloudinary.com/dagcofbhm/image/upload/v1746620093/e8fx36diyhko5adsq4k3.jpg",
    title: "Curso de Analista Táctico en Fútbol",
    description:
      "Aprendé a analizar partidos de forma profesional utilizando herramientas como Wyscout, LongoMatch y conceptos de táctica moderna. Ideal para entrenadores, scouts y analistas de video.",
    category: "Curso",
    country: "España ",
    language: "Español",
    modality: "100% Online Virtual",
    contact: "info@escueladefutbolpro.com",
  };

  useEffect(() => {
    if (!id) return;

    const getCursos = async () => {
      try {
        const data = await getCursosById(id);
        // const data = asd;
        setCurso(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getCursos();
  }, [id]);

  if (loading)
    return <p className="text-center text-gray-600">Cargando curso...</p>;
  if (!curso)
    return <p className="text-center text-red-500">No se encontró el curso</p>;

  return (
    <div className="px-4 pt-[3rem] py-[4rem] bg-gray-100">
      <CardCurso curso={curso} />
    </div>
  );
};

export default UserProfilePage;
