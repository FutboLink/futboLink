"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { ICreateJob, IOfferCard, YesOrNo, YesOrNotravell } from "@/Interfaces/IOffer";
import ImageUpload from "../../Cloudinary/ImageUpload";
import useNationalities from "../../Forms/FormUser/useNationalitys";

const position = [
  "Abogado", "Administrativo", "Agente", "Árbitro", "Analista", "Científico Deportivo",
  "Coordinador", "Comercial", "Delegado", "Director Deportivo", "Director de Negocio",
  "Director Técnico", "Diseñador Gráfico", "Editor Multimedia", "Entrenador",
  "Entrenador de Porteros", "Ejecutivo", "Fisioterapeuta", "Finanzas", "Gerente",
  "Inversor", "Jefe de Reclutamiento", "Jugador", "Marketing Digital", "Médico",
  "Nutricionista", "Ojeador Scout", "Periodista", "Preparador Físico", "Profesor",
  "Psicólogo", "Recursos Humanos", "Representante", "Terapeuta", "Utillero",
];

const sportGenres = ["Masculino", "Femenino", "Ambos", "Indistinto"];
const categories = ["Amateur", "Semiprofesional", "Profesional", "Fútbol base"];
const sports = ["Fútbol 11", "Futsal", "Fútbol Base", "Fútbol Playa", "Pruebas"];
const contractTypes = [
  "Contrato Profesional", "Semiprofesional", "Amateur", "Contrato de cesión", "Prueba",
];
const contractDurations = [
  "Contrato Temporal", "Por temporada", "Contrato indefinido", "Pasantía/Prácticas",
  "Freelance", "Autónomo", "Otro tipo de contrato",
];
const minExperience = [
  "Amateur", "Semiprofesional", "Profesional", "Experiencia en ligas similares",
];

interface EditOfferProps {
  offer: IOfferCard;
  onSave: (updatedOffer: IOfferCard) => Promise<void>;
  onCancel: () => void;
}

const EditOffer: React.FC<EditOfferProps> = ({ offer, onSave, onCancel }) => {
  const { nationalities } = useNationalities();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  
  const [formData, setFormData] = useState<ICreateJob>({
    title: offer.title || "",
    location: offer.location || "",
    category: offer.category || "Amateur",
    sport: offer.sport || "Fútbol 11",
    contractTypes: offer.contractTypes || "Contrato Profesional",
    contractDurations: offer.contractDurations || "Contrato Temporal",
    salary: offer.salary || "",
    minAge: offer.minAge || 0,
    description: offer.description || "",
    currencyType: offer.currencyType || "EUR",
    customCurrencySign: "",
    maxAge: offer.maxAge || 0,
    sportGenres: offer.sportGenres || "Masculino",
    minExperience: offer.minExperience || "Amateur",
    availabilityToTravel: offer.availabilityToTravel ? YesOrNotravell.SI : YesOrNotravell.NO,
    euPassport: offer.euPassport ? YesOrNo.SI : YesOrNo.NO,
    imgUrl: offer.imgUrl || "",
    offerType: offer.contractTypes || "Contrato Profesional",
    moneda: offer.currencyType || "EUR",
    competencies: [],
    countries: offer.countries || []
  });

  const { token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectNationality = (value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      countries: [...prevState.countries, value]
    }));
    setSearch("");
    setIsOpen(false);
  };

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imgUrl: url,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/jobs/${offer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la oferta');
      }

      const updatedOffer = await response.json();
      setSuccessMessage("Oferta actualizada exitosamente");
      
      setTimeout(() => {
        onSave(updatedOffer);
      }, 1500);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Editar Oferta</h2>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título de la oferta *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
            maxLength={100}
          />
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Fila 1: Posición y Categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Posición *
            </label>
            <select
              name="position"
              value={formData.position || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar posición</option>
              {position.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 2: Tipo de contrato y Duración */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de contrato *
            </label>
            <select
              name="contractTypes"
              value={formData.contractTypes}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              {contractTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración del contrato *
            </label>
            <select
              name="contractDurations"
              value={formData.contractDurations}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              {contractDurations.map((duration) => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 3: Edad mínima y máxima */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edad mínima *
            </label>
            <input
              type="number"
              name="minAge"
              value={formData.minAge}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              min="16"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edad máxima *
            </label>
            <input
              type="number"
              name="maxAge"
              value={formData.maxAge}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              min="16"
              max="50"
            />
          </div>
        </div>

        {/* Salario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salario *
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda *
            </label>
            <select
              name="currencyType"
              value={formData.currencyType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="ARS">ARS ($)</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción de la oferta *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen de la oferta
          </label>
          <ImageUpload onUpload={handleImageUpload} />
          {formData.imgUrl && (
            <div className="mt-2">
              <img 
                src={formData.imgUrl} 
                alt="Vista previa" 
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOffer; 