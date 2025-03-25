"use client";
import React, { useState, useEffect } from "react";
import { fetchEditCourse } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import { ICurso, CategoryCursos } from "@/Interfaces/ICursos";
import ImageUpload from "@/components/Cloudinary/ImageUpload";

interface EditCourseProps {
  courseId: string;
  token: string;
  course: ICurso;
  onCancel: () => void;
  onSuccess: (updatedCourse: ICurso) => void;
}

const categories = Object.values(CategoryCursos);

const EditCourse: React.FC<EditCourseProps> = ({ courseId, token, course, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: course.title,
    image: course.image,
    country: course.country,
    language: course.language,
    modality: course.modality,
    category: course.category,
    contact: course.contact
  });

  useEffect(() => {
    setFormData({
      title: course.title,
      image: course.image,
      country: course.country,
      language: course.language,
      modality: course.modality,
      category: course.category,
      contact: course.contact
    });
  }, [course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl, // Se actualiza la URL de la imagen
    }));
  };

  const handleSave = async () => {
    try {
      const updatedCourse: ICurso = {
        id: course.id,
        ...formData
      };
      const result = await fetchEditCourse(token, courseId, updatedCourse);
      onSuccess(result);
    } catch (error) {
      console.error("Error al actualizar el curso:", error);
    }
  };

  return (
    <div className="mt-16 bg-gray-100 rounded-lg max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Editar Curso</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-700">Título:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 text-gray-700 border border-gray-300 rounded-md mb-4"
          />
        </div>

        

        <div>
          <label className="block text-gray-700">Categoría:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border text-gray-700 border-gray-300 rounded-md mb-4"
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700">País:</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full p-2 border text-gray-700 border-gray-300 rounded-md mb-4"
          />
        </div>

        <div>
          <label className="block text-gray-700">Idioma:</label>
          <input
            type="text"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full p-2 border text-gray-700 border-gray-300 rounded-md mb-4"
          />
        </div>

        <div>
          <label className="block text-gray-700">Modalidad:</label>
          <input
            type="text"
            name="modality"
            value={formData.modality}
            onChange={handleChange}
            className="w-full p-2 border text-gray-700 border-gray-300 rounded-md mb-4"
          />
        </div>

        <div>
          <label className="block text-gray-700">Contacto:</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="w-full p-2 border text-gray-700 border-gray-300 rounded-md mb-4"
          />
        </div>

        {/* Reemplazar el campo de la URL por el componente ImageUpload */}
        <div className="sm:col-span-2 flex flex-col items-center">
          <label className="text-gray-700 font-semibold mb-2">Subir Imagen</label>
          <ImageUpload onUpload={handleImageUpload} />
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
};

export default EditCourse;
