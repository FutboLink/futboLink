"use client"
import React, { useContext, useEffect, useState } from 'react';
import { INotice } from '@/Interfaces/INews';
import Image from 'next/image';
import EditNotice from './EditNotice';
import { getNews } from '@/components/Fetchs/AdminFetchs/AdminUsersFetch';
import { UserContext } from '@/components/Context/UserContext';
import DeleteNotice from './DeleteNotice';

export default function ViewNoticias() {
  const [noticias, setNoticias] = useState<INotice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<INotice | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { token } = useContext(UserContext);

  useEffect(() => {
    const getNoticias = async () => {
      try {
        const response = await getNews();
        // Ordenamos las noticias de más reciente a más antigua
        // Asumiendo que las más recientes vienen al final del array
        const sortedNoticias = [...response].reverse();
        setNoticias(sortedNoticias);
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
    setSelectedNotice(noticia);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSuccessEdit = (updatedNotice: INotice) => {
    // Actualiza la noticia y mantiene el orden actual
    const updatedNoticias = noticias.map(noticia => 
      noticia.id === updatedNotice.id ? updatedNotice : noticia
    );
    setNoticias(updatedNoticias);
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
          {isEditing && selectedNotice && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
                <EditNotice
                  token={token} // Se asegura de que el token no sea null
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
                <Image
                  src={noticia.imageUrl}
                  width={500}
                  height={500}
                  alt={noticia.title}
                  className="w-full h-40 object-cover rounded-lg"
                  loading="lazy"
                />
                <h3 className="text-xl font-semibold mt-4 text-gray-700">{noticia.title}</h3>
                <p className="text-gray-700">{noticia.description}</p>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => handleEdit(noticia)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Editar
                  </button>
                  <DeleteNotice
                    noticeId={noticia.id}
                    onDelete={() => handleDelete(noticia.id)}
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
