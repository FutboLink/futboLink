import React, { useState, useEffect } from "react";
import { fetchEditJob } from "../Fetchs/UsersFetchs/UserFetchs";
import { IOfferCard } from "@/Interfaces/IOffer";

interface EditJobOfferProps {
  jobId: string;
  token: string;
  jobOffer: IOfferCard;
  onCancel: () => void;
  onSuccess: (updatedOffer: IOfferCard) => void;
}

const EditJobOffer: React.FC<EditJobOfferProps> = ({ jobId, token, jobOffer, onCancel, onSuccess }) => {
  // Inicializamos el estado del formulario asegurándonos de que competencies y countries sean arreglos.
  const [formData, setFormData] = useState({
    title: jobOffer.title,
    description: jobOffer.description,
    location: jobOffer.location,
    salary: jobOffer.salary || "",
  });

  useEffect(() => {
    // Actualizamos el formulario cuando cambia la oferta
    setFormData({
      title: jobOffer.title,
      description: jobOffer.description,
      location: jobOffer.location,
      salary: jobOffer.salary || "",
    });
  }, [jobOffer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // Convertimos las competencias y países de nuevo a arreglos cuando guardamos
      const updatedOffer = {
        ...formData,
     
      };
      
      const result = await fetchEditJob(token, jobId, updatedOffer);
      onSuccess(result);
    } catch (error) {
      console.error("Error al actualizar la oferta:", error);
    }
  };

  return (
    <div className="p-8 bg-gray-100 rounded-lg shadow-lg max-w-4xl mx-auto my-6">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Editar Oferta</h2>
      <div>
        <label className="block text-gray-700">Título:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />
      </div>
      <div>
        <label className="block text-gray-700">Descripción:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />
      </div>
      <div>
        <label className="block text-gray-700">Ubicación:</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />
      </div>
      <div>
        <label className="block text-gray-700">Salario:</label>
        <input
          type="text"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />
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

export default EditJobOffer;
