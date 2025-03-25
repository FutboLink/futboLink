"use client"
import React, { useEffect, useState } from 'react';
import { ICurso } from '@/Interfaces/ICursos';
import { fetchCursos } from './MockCursos';
import Image from 'next/image';
import DeleteCursoButton from './DeleteCurso';
import EditCourse from './EditCourse'; // Importa el componente EditCourse

export default function ViewCursos() {
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurso, setSelectedCurso] = useState<ICurso | null>(null); // Estado para el curso seleccionado
  const [isEditing, setIsEditing] = useState<boolean>(false); // Estado para manejar la visibilidad del modal de edición

  useEffect(() => {
    const getCursos = async () => {
      try {
        const response = await fetchCursos();
        setCursos(response);
        setLoading(false);
      } catch {
        setError("Error al obtener los cursos.");
        setLoading(false);
      }
    };

    getCursos();
  }, []);

  const handleDelete = (cursoId: string) => {
    setCursos(cursos.filter(curso => curso.id !== cursoId));
  };

  const handleEdit = (curso: ICurso) => {
    setSelectedCurso(curso); // Guarda el curso a editar
    setIsEditing(true); // Muestra el formulario de edición
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Oculta el formulario de edición
  };

  const handleSuccessEdit = (updatedCurso: ICurso) => {
    setCursos(cursos.map(curso => curso.id === updatedCurso.id ? updatedCurso : curso)); // Actualiza la lista de cursos con los cambios
    setIsEditing(false); // Oculta el formulario de edición
  };

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
                  courseId={selectedCurso.id!} // Asegúrate de que `id` no sea null
                  token="your-token" // Pasa el token aquí
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
                <Image src={curso.image} width={500} height={500} alt={curso.title} className="w-full h-40 object-cover rounded-lg" />
                <h3 className="text-xl font-semibold mt-4 text-gray-700">{curso.title}</h3>
                <p className="text-gray-700">{curso.category}</p>
                <p className="mt-2 text-gray-700">{curso.country}</p>
                <p className="text-sm text-gray-700">{curso.language} - {curso.modality}</p>
                <p className="mt-4 text-gray-700">Contacto: {curso.contact}</p>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => handleEdit(curso)} // Llama a handleEdit cuando se haga clic
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Editar
                  </button>
                  <DeleteCursoButton cursoId={curso.id} onDelete={() => handleDelete(curso.id!)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
