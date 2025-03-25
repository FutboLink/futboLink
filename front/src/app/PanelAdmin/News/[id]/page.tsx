"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Importa useRouter para obtener el ID
import { getNewsById } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import { INotice } from "@/Interfaces/INews";
import Image from "next/image";

export default function NewsDetail() {
  const router = useRouter();
  const { id } = router.query; // Obtiene el ID de la URL
  const [noticia, setNoticia] = useState<INotice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return; // Si no hay ID, no hacer la petición

    const fetchNotice = async () => {
      try {
        const response = await getNewsById(id as string); // Llama al servicio para obtener la noticia
        setNoticia(response);
      } catch {
        setError("Error al cargar la noticia.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      {noticia ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold">{noticia.title}</h1>
          <p className="text-gray-700">{noticia.description}</p>
          <Image src={noticia.imageUrl} width={50} height={50} alt={noticia.title} className="w-full h-64 object-cover rounded-lg mt-4" />
        </div>
      ) : (
        <p>No se encontró la noticia.</p>
      )}
    </div>
  );
}
