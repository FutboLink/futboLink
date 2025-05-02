"use client"
import React, { useState, useEffect } from "react";
import { ICurso } from "@/Interfaces/ICursos";
import Image from "next/image";
import { getCursos } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import Link from "next/link";

const Page: React.FC = () => {
  const [cursos, setCursos] = useState<ICurso[]>([]); 
  const [loading, setLoading] = useState<boolean>(true); 
  const [loadingCurso, setLoadingCurso] = useState<boolean>(false); 
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const cursosData = await getCursos();
        setCursos(cursosData);
      } catch {
        setError("No se pudieron cargar los cursos");
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  const handleVerCursoClick = () => {
    setLoadingCurso(true);

    setTimeout(() => {
      setLoadingCurso(false);
    }, 2000); 
  };

  return (
    <div>
      <h1 className="mt-24 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white p-2 font-semibold text-center mb-4">
        CURSOS Y FORMACIONES
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 hover:cursor-pointer">
        {cursos.map((curso) => (
          <div key={curso.id} className="bg-white shadow-lg rounded-lg p-4">
            <Image
              width={300} 
              height={200} 
              src={curso.image} 
              alt={curso.title}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl text-gray-700 font-semibold">{curso.title}</h2>
            <p className="text-gray-700 mt-2">País: {curso.country}</p>
            <p className="text-gray-700 text-sm">Idioma: {curso.language}</p>
            <div className="mt-4">
              {loadingCurso ? (
                <div className="flex justify-center items-center h-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700"></div>
                </div>
              ) : (
                <Link href={`/cursos/${curso.id}`}>
                  <button
                    onClick={handleVerCursoClick}
                    className="px-6 py-2 bg-white font-bold text-green-800 border-2 border-green-800 rounded-md hover:bg-green-800 hover:text-white"
                  >
                    Ver curso
                  </button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
