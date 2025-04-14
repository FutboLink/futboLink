"use client";
import React, { useContext, useEffect, useState } from "react";
import { ICurso } from "@/Interfaces/ICursos";
import Image from "next/image";
import DeleteCursoButton from "./DeleteCurso";
import EditCourse from "./EditCourse";
import { UserContext } from "@/components/Context/UserContext";
import { getCursos } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";

export default function ViewCursos() {
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurso, setSelectedCurso] = useState<ICurso | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { token } = useContext(UserContext);

  useEffect(() => {
    const fetchCursos = async () => { // Renombramos la función para evitar conflicto
      try {
        const response = await getCursos();
        setCursos(response);
      } catch  {
        setError("Error al obtener los cursos.");
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, []);

  const handleDelete = (cursoId: string) => {
    setCursos(cursos.filter(curso => curso.id !== cursoId));
  };

  const handleEdit = (curso: ICurso) => {
    setSelectedCurso(curso);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSuccessEdit = (updatedCurso: ICurso) => {
    setCursos(cursos.map(curso => curso.id === updatedCurso.id ? updatedCurso : curso));
    setIsEditing(false);
  };

  if (token === null) {
    return <div>Error: El token no está disponible.</div>;
  }

  return (
    <div className="p-6">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div>
          {isEditing && selectedCurso && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
                <EditCourse
                  courseId={selectedCurso.id}
                  token={token}
                  course={selectedCurso}
                  onCancel={handleCancelEdit}
                  onSuccess={handleSuccessEdit}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-24">
            {cursos.map((curso) => (
              <div key={curso.id} className="bg-white p-4 rounded-lg shadow-md">
                <Image
                  src={curso.image}
                  width={500}
                  height={500}
                  alt={curso.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <h3 className="text-xl font-semibold mt-4 text-gray-700">
                  {curso.title}
                </h3>
                <p className="text-gray-700">Categoria:{curso.category}</p>
                <p className="mt-2 text-gray-700">País:{curso.country}</p>
                <p className="text-sm text-gray-700">Idioma:
                  {curso.language} - Modalidad: {curso.modality}
                </p>
                <p className="mt-4 text-gray-700">Contacto: {curso.contact}</p>
                <p className="mt-4 text-gray-700">Descripción del curso: {curso.description}</p>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => handleEdit(curso)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Editar
                  </button>
                  <DeleteCursoButton
                    cursoId={curso.id}
                    onDelete={() => handleDelete(curso.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
