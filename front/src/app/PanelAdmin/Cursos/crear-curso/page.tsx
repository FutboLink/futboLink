"use client";

import { ICurso,CategoryCursos } from "@/Interfaces/ICursos";
import React, { useState } from "react";
import ImageUpload from "@/components/Cloudinary/ImageUpload";
import { fetchCreateCourse } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";

export default function Page() {
  const [course, setCourse] = useState<ICurso>({
    image: "",
    title: "",
    category: CategoryCursos.Curso,
    country: "",
    language: "",
    modality: "",
    contact: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (url: string) => {
    setCourse((prev) => ({
      ...prev,
      image: url,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetchCreateCourse(course);
      console.log("Curso creado:", response);
      setSuccessMessage("¡Curso creado exitosamente!");
      setCourse({
        image: "",
        title: "",
        category: CategoryCursos.Curso,
        country: "",
        language: "",
        modality: "",
        contact: "",
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
              value={course.title}
              onChange={handleChange}
              className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
              required
            />
          </div>
  
          {/* Categoría */}
          <div>
            <label className="block text-gray-700 font-semibold">Categoría</label>
            <select
              name="category"
              value={course.category}
              onChange={handleChange}
              className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
              required
            >
              {Object.values(CategoryCursos).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
  
          {/* País */}
          <div>
            <label className="block text-gray-700 font-semibold">País</label>
            <input
              type="text"
              name="country"
              value={course.country}
              onChange={handleChange}
              className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
              required
            />
          </div>
  
          {/* Idioma */}
          <div>
            <label className="block text-gray-700 font-semibold">Idioma</label>
            <input
              type="text"
              name="language"
              value={course.language}
              onChange={handleChange}
              className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
              required
            />
          </div>
  
          {/* Modalidad */}
          <div>
            <label className="block text-gray-700 font-semibold">Modalidad</label>
            <input
              type="text"
              name="modality"
              value={course.modality}
              onChange={handleChange}
              className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
              required
            />
          </div>
  
          {/* Contacto */}
          <div className="sm:col-span-2">
            <label className="block text-gray-700 font-semibold">Contacto</label>
            <input
              type="text"
              name="contact"
              value={course.contact}
              onChange={handleChange}
              className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
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
                "Crear Curso"
              )}
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