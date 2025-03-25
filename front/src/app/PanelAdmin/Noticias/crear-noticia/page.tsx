"use client";

import { INotice } from "@/Interfaces/INews";
import React, { useState } from "react";
import ImageUpload from "@/components/Cloudinary/ImageUpload";
import { fetchCreateNews } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";

export default function Page() {
  const [notice, setNotice] = useState<Omit<INotice, "id">>({
    title: "",
    description: "",
    imageUrl: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNotice({ ...notice, [e.target.name]: e.target.value });
  };

  const isValidImageUrl = (url: string) => {
    const imageRegex = /\.(jpeg|jpg|gif|png|webp|svg)$/i;
    try {
      const parsedUrl = new URL(url, window.location.href);
      return imageRegex.test(parsedUrl.pathname);
    } catch {
      return false;
    }
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

    if (!isValidImageUrl(notice.imageUrl)) {
      setError("La URL de la imagen no es válida.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetchCreateNews(notice);
      console.log("Noticia creada:", response);
      setSuccessMessage("¡Noticia creada exitosamente!");
      setNotice({ title: "", description: "", imageUrl: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 mt-12 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Crear Nueva Noticia
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-gray-700 font-semibold">Título</label>
            <input
              type="text"
              name="title"
              value={notice.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-gray-700 font-semibold">Descripción</label>
            <textarea
              name="description"
              value={notice.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
              rows={4}
              required
            />
          </div>

       

          {/* Subir Imagen */}
          <div className="flex flex-col items-center">
            <label className="text-gray-700 font-semibold mb-2">Subir Imagen</label>
            <ImageUpload onUpload={handleImageUpload} />
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            className={`w-full py-2 rounded-lg transition duration-300 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800 text-white"
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Creando...
              </div>
            ) : (
              "Crear Noticia"
            )}
          </button>

          {/* Mensajes de error o éxito */}
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
          {successMessage && <p className="text-green-700 text-center mt-2">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
}
