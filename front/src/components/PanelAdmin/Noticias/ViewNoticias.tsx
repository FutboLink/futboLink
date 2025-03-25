"use client"
import React, { useEffect, useState } from 'react';
import { INotice } from '@/Interfaces/INews';
import { mockNoticias } from './MockNoticias'; // Importa el mock de noticias
import Image from 'next/image';
import EditNotice from './EditNotice';
import DeleteNoticeButton from '../Cursos/DeleteCurso';

export default function ViewNoticias() {
  const [noticias, setNoticias] = useState<INotice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<INotice | null>(null); // Estado para la noticia seleccionada
  const [isEditing, setIsEditing] = useState<boolean>(false); // Estado para manejar la visibilidad del modal de edición

  useEffect(() => {
    // Simulando la carga de noticias desde un archivo/mock
    const getNoticias = async () => {
      try {
        const response = mockNoticias; // Aquí puedes reemplazar con una llamada a un API si es necesario
        setNoticias(response);
        setLoading(false);
      } catch {
        setError("Error al obtener las noticias.");
        setLoading(false);
      }
    };

    getNoticias();
  }, []);

  const handleDelete = (noticeId: string) => {
    setNoticias(noticias.filter(noticia => noticia.id !== noticeId));
  };

  const handleEdit = (noticia: INotice) => {
    setSelectedNotice(noticia); // Guarda la noticia a editar
    setIsEditing(true); // Muestra el formulario de edición
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Oculta el formulario de edición
  };

  const handleSuccessEdit = (updatedNotice: INotice) => {
    setNoticias(noticias.map(noticia => noticia.id === updatedNotice.id ? updatedNotice : noticia)); // Actualiza la lista de noticias
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
          {isEditing && selectedNotice && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
                <EditNotice
                  noticeId={selectedNotice.id}
                  notice={selectedNotice}
                  onCancel={handleCancelEdit}
                  onSuccess={handleSuccessEdit}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-24">
            {noticias.map((noticia) => (
              <div key={noticia.id} className="bg-white p-4 rounded-lg shadow-md">
                <Image src={noticia.imageUrl} width={500} height={500} alt={noticia.title} className="w-full h-40 object-cover rounded-lg" />
                <h3 className="text-xl font-semibold mt-4 text-gray-700">{noticia.title}</h3>
                <p className="text-gray-700">{noticia.description}</p>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => handleEdit(noticia)} // Llama a handleEdit cuando se haga clic
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Editar
                  </button>
                  <DeleteNoticeButton noticeId={noticia.id} onDelete={() => handleDelete(noticia.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
