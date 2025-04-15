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

const position = [
  "Abogado",
  "Administrativo",
  "Agente",
  "Árbitro",
  "Analista",
  "Científico Deportivo",
  "Coordinador",
  "Comercial",
  "Delegado",
  "Director Deportivo",
  "Director de Negocio",
  "Director Técnico",
  "Diseñador Gráfico",
  "Editor Multimedia",
  "Entrenador",
  "Entrenador de Porteros",
  "Ejecutivo",
  "Fisioterapeuta",
  "Finanzas",
  "Gerente",
  "Inversor",
  "Jefe de Reclutamiento",
  "Jugador",
  "Marketing Digital",
  "Médico",
  "Nutricionista",
  "Ojeador Scout",
  "Periodista",
  "Preparador Físico",
  "Profesor",
  "Psicólogo",
  "Recursos Humanos",
  "Representante",
  "Terapeuta",
  "Utillero",
];

const sportGenres = ["Masculino", "Femenino"];
const categories = ["Amateur", "Semiprofesional", "Profesional", "Fútbol base"];
const sports = ["Fútbol 11", "Futsal", "Fútbol Base", "Fútbol Playa", "Pruebas"];
const contractTypes = ["Contrato Profesional", "Semiprofesional", "Amateur", "Contrato de cesión", "Prueba"];
const contractDurations = ["Contrato Temporal", "Por temporada", "Contrato indefinido", "Pasantía/Prácticas", "Freelance", "Autónomo", "Otro tipo de contrato"];
const minExperience = ["Amateur", "Semiprofesional", "Profesional", "Experiencia en ligas similares"];
const extra = ["Sueldo fijo", "Transporte incluido", "Bonos por rendimiento", "Viáticos incluidos", "Alojamiento incluido", "No remunerado", "A convenir", "Equipamiento deportivo"];

const EditJobOffer: React.FC<EditJobOfferProps> = ({ jobId, token, jobOffer, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: jobOffer.title,
    description: jobOffer.description,
    location: jobOffer.location,
    customCurrencySign: jobOffer.customCurrencySign || "",
    currencyType: jobOffer.currencyType || "",
    salary: jobOffer.salary || "",
    position: jobOffer.position || "",
    sportGenres: jobOffer.sportGenres || "",
    category: jobOffer.category || "",
    sport: jobOffer.sport || "",
    euPassport: jobOffer.euPassport || "",
    availabilityToTravel: jobOffer.availabilityToTravel|| "",
    contractTypes: jobOffer.contractTypes || "",
    contractDurations: jobOffer.contractDurations || "",
    minExperience: jobOffer.minExperience || "",
    extra: jobOffer.extra || [],
  });

  useEffect(() => {
    setFormData({
      title: jobOffer.title,
      description: jobOffer.description,
      location: jobOffer.location,
      customCurrencySign: jobOffer.customCurrencySign || "",
      currencyType: jobOffer.currencyType || "",
      salary: jobOffer.salary || "",
      position: jobOffer.position || "",
      sportGenres: jobOffer.sportGenres || "",
      category: jobOffer.category || "",
      sport: jobOffer.sport || "",
      euPassport: jobOffer.euPassport || "",
      availabilityToTravel:jobOffer.availabilityToTravel || "",
      contractTypes: jobOffer.contractTypes || "",
      contractDurations: jobOffer.contractDurations || "",
      minExperience: jobOffer.minExperience || "",
      extra: jobOffer.extra || [],
    });
  }, [jobOffer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {  value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      extra: checked
        ? [...prev.extra, value]
        : prev.extra.filter((item) => item !== value),
    }));
  };

  const handleSave = async () => {
    try {
        let updatedOffer = { ...formData };

        if (updatedOffer.currencyType === "Otro") {
            updatedOffer.currencyType = updatedOffer.customCurrencySign ?? '';
        }

        // Crear una copia de updatedOffer sin customCurrencySign
        const { customCurrencySign, ...offerWithoutCustomCurrencySign } = updatedOffer;

        // Realiza la solicitud con los datos modificados
        const result = await fetchEditJob(jobId, offerWithoutCustomCurrencySign);
        onSuccess(result);
    } catch (error) {
        console.error("Error al actualizar la oferta:", error);
    }
};


  

  return (
    <div className=" bg-gray-100 rounded-lg  max-w-4xl ">
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Editar Oferta</h2>
  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
  
        <div className="flex flex-col">
  <label className="text-xs font-semibold mb-1">Tipo de Moneda</label>
  <select
    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
    value={formData.currencyType}
    onChange={(e) =>
      setFormData({ ...formData, currencyType: e.target.value })
    }
  >
    <option value="">Selecciona una moneda</option>
    <option value="EUR">EUR - Euro</option>
    <option value="USD">USD - Dólar</option>
    <option value="Otro">Otro</option>
  </select>

  {/* Mostrar el input solo si se selecciona "Otro" */}
  {formData.currencyType === "Otro" && (
    <input
      type="text"
      className="mt-2 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
      placeholder="Ingresa el signo de la moneda"
      value={formData.customCurrencySign}
      onChange={(e) =>
        setFormData({ ...formData, customCurrencySign: e.target.value })
      }
    />
  )}
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
  
        <div>
          <label className="block text-gray-700">Posición:</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          >
            {position.map((pos, index) => (
              <option key={index} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block text-gray-700">Género Deportivo:</label>
          <select
            name="sportGenres"
            value={formData.sportGenres}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          >
            {sportGenres.map((genre, index) => (
              <option key={index} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block text-gray-700">Categoría:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block text-gray-700">Deporte:</label>
          <select
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          >
            {sports.map((sport, index) => (
              <option key={index} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block text-gray-700">Tipo de Contrato:</label>
          <select
            name="contractTypes"
            value={formData.contractTypes}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          >
            {contractTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block text-gray-700">Duración del Contrato:</label>
          <select
            name="contractDuration"
            value={formData.contractDurations}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          >
            {contractDurations.map((duration, index) => (
              <option key={index} value={duration}>
                {duration}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block text-gray-700">Experiencia Mínima:</label>
          <select
            name="minExperience"
            value={formData.minExperience}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          >
            {minExperience.map((experience, index) => (
              <option key={index} value={experience}>
                {experience}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block text-gray-700">¿Disponibilidad para viajar?</label>
          <select
            name="availabilityToTravel"
            value={formData.availabilityToTravel}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          >
            <option value="Yes">Sí</option>
            <option value="No">No</option>
          </select>
        </div>
  
        <div>
          <label className="block text-gray-700">¿Pasaporte de la UE?</label>
          <select
            name="euPassport"
            value={formData.euPassport}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          >
            <option value="Yes">Sí</option>
            <option value="No">No</option>
          </select>
        </div>

       
<div className="col-span-3">
  <label className="block text-gray-700">Extras:</label>
  {extra.map((ex, index) => (
    <div key={index} className="flex items-center">
      <input
        type="checkbox"
        name="extra"
        value={ex}  // Usar el valor individual
        checked={formData.extra.includes(ex)}  // Compara con el valor individual
        onChange={handleCheckboxChange}
        className="mr-2"
      />
      <label>{ex}</label>  {/* Aquí también usar 'ex' */}
    </div>
  ))}
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

export default EditJobOffer;