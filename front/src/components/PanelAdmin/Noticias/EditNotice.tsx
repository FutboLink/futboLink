"use client";
import React, { useState, useEffect } from "react";
import { fetchEditNotice } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import { INotice } from "@/Interfaces/INews";
import ImageUpload from "@/components/Cloudinary/ImageUpload";

interface EditNoticeProps {
  noticeId: string;
  token: string;
  notice: INotice;
  onCancel: () => void;
  onSuccess: (updatedNotice: INotice) => void;
}



const EditNotice: React.FC<EditNoticeProps> = ({ noticeId, token, notice, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: notice.title,
    image: notice.imageUrl,
    description: notice.description,
  });

  useEffect(() => {
    setFormData({
        title: notice.title,
        image: notice.imageUrl,
        description: notice.description,
    });
  }, [notice]);

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
      const updatedNotice: INotice = {
        id: notice.id,  
        title: formData.title,
        imageUrl: formData.image,  
        description: formData.description,
      };
      const result = await fetchEditNotice(token, noticeId, updatedNotice);
      onSuccess(result);
    } catch (error) {
      console.error("Error al actualizar la notificación:", error);
    }
  };
  

  return (
    <div className="mt-24 bg-gray-100 rounded-lg max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Editar Notificación</h2>

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

       
        <div className="sm:col-span-2">
          <label className="block text-gray-700">Descripción:</label>
          <textarea
            name="content"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 text-gray-700 border border-gray-300 rounded-md mb-4"
            rows={4}
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

export default EditNotice;
