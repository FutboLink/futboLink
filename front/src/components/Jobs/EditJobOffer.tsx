import type React from "react";
import { useEffect, useState } from "react";
import type { IOfferCard } from "@/Interfaces/IOffer";
import { fetchEditJob } from "../Fetchs/UsersFetchs/UserFetchs";

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
const sports = [
  "Fútbol 11",
  "Futsal",
  "Fútbol Base",
  "Fútbol Playa",
  "Pruebas",
];
const contractTypes = [
  "Contrato Profesional",
  "Semiprofesional",
  "Amateur",
  "Contrato de cesión",
  "Prueba",
];
const contractDurations = [
  "Contrato Temporal",
  "Por temporada",
  "Contrato indefinido",
  "Pasantía/Prácticas",
  "Freelance",
  "Autónomo",
  "Otro tipo de contrato",
];
const minExperience = [
  "Amateur",
  "Semiprofesional",
  "Profesional",
  "Experiencia en ligas similares",
];
const extra = [
  "Sueldo fijo",
  "Transporte incluido",
  "Bonos por rendimiento",
  "Viáticos incluidos",
  "Alojamiento incluido",
  "No remunerado",
  "A convenir",
  "Equipamiento deportivo",
];

const EditJobOffer: React.FC<EditJobOfferProps> = ({
  jobId,
  token,
  jobOffer,
  onCancel,
  onSuccess,
}) => {
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
    availabilityToTravel: jobOffer.availabilityToTravel || "",
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
      availabilityToTravel: jobOffer.availabilityToTravel || "",
      contractTypes: jobOffer.contractTypes || "",
      contractDurations: jobOffer.contractDurations || "",
      minExperience: jobOffer.minExperience || "",
      extra: jobOffer.extra || [],
    });
  }, [jobOffer]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      extra: checked
        ? [...prev.extra, value]
        : prev.extra.filter((item) => item !== value),
    }));
  };

  const handleSave = async () => {
    try {
      const updatedOffer = { ...formData };

      if (updatedOffer.currencyType === "Otro") {
        updatedOffer.currencyType = updatedOffer.customCurrencySign ?? "";
      }

      // Crear una copia de updatedOffer sin customCurrencySign
      const { customCurrencySign, ...offerWithoutCustomCurrencySign } =
        updatedOffer;

      // Realiza la solicitud con los datos modificados
      const result = await fetchEditJob(jobId, offerWithoutCustomCurrencySign);
      onSuccess(result);
    } catch (error) {
      console.error("Error al actualizar la oferta:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl max-w-4xl shadow-lg border border-gray-200 overflow-hidden mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <h2 className="text-2xl font-bold text-white text-center">
          Editar Oferta de Trabajo
        </h2>
        <p className="text-center text-blue-50 mt-2 text-sm">
          Actualiza la información de tu oferta
        </p>
      </div>

      {/* Formulario */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-gray-700">Título de la Oferta</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-gray-700">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe los detalles de la oferta..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Ubicación</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ciudad"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Tipo de Moneda
          </label>
          <select
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
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
              className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa el signo de la moneda"
              value={formData.customCurrencySign}
              onChange={(e) =>
                setFormData({ ...formData, customCurrencySign: e.target.value })
              }
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Salario</label>
          <input
            type="text"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="Ej: 2000"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Posición</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
          >
            {position.map((pos, index) => (
              <option key={index} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Género Deportivo</label>
          <select
            name="sportGenres"
            value={formData.sportGenres}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
          >
            {sportGenres.map((genre, index) => (
              <option key={index} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Categoría</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Modalidad</label>
          <select
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
          >
            {sports.map((sport, index) => (
              <option key={index} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Tipo de Contrato</label>
          <select
            name="contractTypes"
            value={formData.contractTypes}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
          >
            {contractTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Duración del Contrato</label>
          <select
            name="contractDuration"
            value={formData.contractDurations}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
          >
            {contractDurations.map((duration, index) => (
              <option key={index} value={duration}>
                {duration}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Experiencia Mínima</label>
          <select
            name="minExperience"
            value={formData.minExperience}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
          >
            {minExperience.map((experience, index) => (
              <option key={index} value={experience}>
                {experience}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Disponibilidad para viajar
          </label>
          <select
            name="availabilityToTravel"
            value={formData.availabilityToTravel}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
          >
            <option value="Yes">Sí</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Pasaporte de la UE</label>
          <select
            name="euPassport"
            value={formData.euPassport}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
          >
            <option value="Yes">Sí</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-3 text-gray-700">Beneficios Adicionales (Extras)</label>
          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {extra.map((ex, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  name="extra"
                  value={ex}
                  checked={formData.extra.includes(ex)}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">{ex}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="px-6 pb-6 flex flex-col sm:flex-row justify-end gap-3 bg-gray-50 border-t border-gray-200 pt-4">
        <button
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Cancelar</span>
        </button>
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Guardar Cambios</span>
        </button>
      </div>
    </div>
  );
};

export default EditJobOffer;
