"use client";

import React, { useContext, useState } from "react";
import ImageUpload from "@/components/Cloudinary/ImageUpload";
import { fetchCreateNews } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import { ICreateNotice } from "@/Interfaces/INews";
import { UserContext } from "@/components/Context/UserContext";

export default function Page() {
  const [notice, setNotice] = useState<ICreateNotice>({
    imageUrl: "",
    title: "",
    description:""
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {token} = useContext(UserContext);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNotice({ ...notice, [e.target.name]: e.target.value });
  };
  
  const handleImageUpload = (url: string) => {
    setNotice((prev) => ({
      ...prev,
      imageUrl: url, 
    }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!token) {
        setError("Token no disponible.");
        setLoading(false);
        return;
      }

    try {
      const response = await fetchCreateNews(notice,token);
      console.log("Noticia creada:", response);
      setSuccessMessage("¡Noticia creada exitosamente!");
      setNotice({
        imageUrl:"",
      title: "",
      description:""
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col mt-12 items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-green-700 mb-4 text-center">
          Crear Nuevo Curso
        </h1>
  
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Título (Ocupa 2 columnas) */}
          <div className="sm:col-span-2">
            <label className="block text-gray-700 font-semibold">Título</label>
            <input
              type="text"
              name="title"
              value={notice.title}
              onChange={handleChange}
              className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
              required
            />
          </div>
          
          <div className="sm:col-span-2">
            <label className="block text-gray-700 font-semibold">Descripción</label>
            <textarea
                name="description"
                value={notice.description}
                onChange={handleChange}
                className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 resize-none"
                rows={4} // Define cuántas filas ocupa por defecto
                required
            />
            </div>

          
  
        
  
          {/* Subir Imagen (Ocupa 2 columnas) */}
          <div className="sm:col-span-2 flex flex-col items-center">
            <label className="text-gray-700 font-semibold mb-2">Subir Imagen</label>
            <ImageUpload onUpload={handleImageUpload} />
          </div>
  
          {/* Botón de Enviar (Ocupa 2 columnas) */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className={`w-full py-2 rounded-lg transition duration-300 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800 text-white"
              }`}
              disabled={loading}
            >
             {loading ? (
  <span className="flex items-center justify-center">
    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
    Creando...
  </span>
) : "Crear Noticia"}

            </button>
          </div>
  
          {/* Mensajes de error o éxito */}
          {error && (
            <p className="text-red-500 text-center sm:col-span-2">{error}</p>
          )}
          {successMessage && (
            <p className="text-green-700 text-center sm:col-span-2">{successMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
}  