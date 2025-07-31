"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../Context/UserContext";
import { ICreateJob, YesOrNo, YesOrNotravell } from "@/Interfaces/IOffer";
import { fetchCreateJob } from "../Fetchs/OfertasFetch/OfertasFetchs";
import ImageUpload from "../Cloudinary/ImageUpload";
import useNationalities from "../Forms/FormUser/useNationalitys";

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

const sportGenres = ["Masculino", "Femenino","Ambos","Indistinto"];
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
const extras = [
  "Sueldo fijo",
  "No remunerado",
  "A convenir",
  "Transporte incluido",
  "Alojamiento incluido",
  "Viáticos incluidos",
  "Bonos por rendimiento",
  "Equipamiento deportivo",
];

const FormComponent = () => {
  const { nationalities } = useNationalities();
  const [ ,setSelectedNationality] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  
  const [formData, setFormData] = useState<ICreateJob>({
    title: "",
    location: "",
    category: "Amateur", 
    sport: "Fútbol 11",
    contractTypes: "Contrato Profesional",
    contractDurations: "Contrato Temporal",
    salary: "",
    minAge: 0,
    description: "",
    currencyType: "EUR",
    customCurrencySign: "",
    maxAge: 0,
    sportGenres: "Masculino",
    minExperience: "Amateur",
    availabilityToTravel: YesOrNotravell.SI,
    euPassport: YesOrNo.SI,
    imgUrl: "",
    offerType: "Contrato Profesional",
    moneda: "EUR",
    competencies: [],
    countries: []
  });
  

  const { token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageUploadedMessage, setImageUploadedMessage] = useState<string | null>(null);
 
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
 
  // Maneja la selección de una nacionalidad
  const handleSelectNationality = (value: string) => {
    setSelectedNationality(value);
    setFormData((prevState) => ({
      ...prevState,
      nationality: value,
      countries: [...prevState.countries, value]
    }));
    setSearch("");
    setIsOpen(false);
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
    setFormData((prev) => ({
      ...prev,
      imgUrl: url,
    }));
    setImageUploadedMessage("Imagen cargada correctamente");
    // Clear the message after 3 seconds
    setTimeout(() => {
      setImageUploadedMessage(null);
    }, 3000);
  };

  const handleCompetencyChange = (value: string, checked: boolean) => {
    setFormData(prevState => ({
      ...prevState,
      competencies: checked 
        ? [...(prevState.competencies || []), value]
        : (prevState.competencies || []).filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
  
    if (!isValidImageUrl(formData.imgUrl)) {
      setError("La URL de la imagen no es válida.");
      setLoading(false);
      return;
    }
  
    if (!token) {
      setError("Token no disponible.");
      setLoading(false);
      return;
    }
    
    if (formData.countries.length === 0) {
      setError("Debes seleccionar al menos un país donde aplica la oferta.");
      setLoading(false);
      return;
    }
    
    if (!formData.competencies || formData.competencies.length === 0) {
      setError("Debes seleccionar al menos una competencia requerida.");
      setLoading(false);
      return;
    }
  
    const { customCurrencySign, ...restFormData } = formData;
  
    const formDataToSend: ICreateJob = {
      ...restFormData,
      // Ensure these fields are properly set
      moneda: formData.moneda || "EUR",
      offerType: formData.offerType || "Contrato Profesional",
      contractDurations: formData.contractDurations || "Contrato Temporal",
      competencies: formData.competencies,
      countries: formData.countries
    };
    
    // Only add position, nationality, and extra if they have values in the form
    if (formData.position) {
      formDataToSend.position = formData.position;
    }
    
    if (formData.nationality) {
      formDataToSend.nationality = formData.nationality;
    }
    
    // Use competencies as extra only if competencies has values
    if (formData.competencies && formData.competencies.length > 0) {
      formDataToSend.extra = formData.competencies;
    }
  
    setTimeout(async () => {
      try {
        const response = await fetchCreateJob(formDataToSend, token);
        console.log("Oferta creada:", response);
        setSuccessMessage("¡Oferta creada exitosamente!");
        // Reset the form with empty values
        setFormData({
          title: "",
          location: "",
          category: "",
          sport: "",
          contractTypes: "",
          contractDurations: "",
          salary: "",
          minAge: 0,
          description: "",
          currencyType: "EUR",
          customCurrencySign: "",
          maxAge: 0,
          sportGenres: "",
          minExperience: "",
          availabilityToTravel: "Si" as YesOrNotravell,
          euPassport: "Si" as YesOrNo,
          imgUrl: "",
          offerType: "",
          moneda: "",
          competencies: [],
          countries: []
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }, 2000);
  };
  
  

  return (
    <div className="max-w-5xl mx-auto p-2 bg-gray-100 text-gray-700 rounded-lg shadow-md border border-gray-300">
    <div className="mx-auto text-center mb-2">
      <h1 className="text-lg font-semibold bg-gray-600 text-white py-1 px-2 rounded">
          Crear Oferta de Trabajo
        </h1>
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-3 mb-4 rounded">
        <p className="font-bold">⚠ IMPORTANTE:</p>
        <p>No incluyas tu número, correo, redes sociales ni logos personales. Los jugadores te contactarán a través de la plataforma.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-2">
    <div className="flex flex-col">
      <label className="text-xs font-semibold mb-1">Título <span className="text-gray-500 text-xs">({formData.title.length}/80)</span></label>
      <input
        type="text"
        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
        value={formData.title}
        onChange={(e) => {
          if (e.target.value.length <= 80) {
            setFormData({ ...formData, title: e.target.value });
          }
        }}
        maxLength={80}
        placeholder="Nombre de la oferta"
      />
    </div>

   {/* Ubicación */}
   <div className="flex flex-col relative" ref={dropdownRef}>
  <label className="text-xs font-semibold mb-1">Países donde aplica la oferta</label>
  <input
    type="text"
    className="px-2 flex flex-col relative py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-verde-claro"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    onClick={() => setIsOpen(true)}
    placeholder="Buscar países..."
  />

    {/* Ícono de flecha */}
    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none mt-2">
      <svg
        className="w-4 h-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  

  {/* Dropdown de opciones */}
  {isOpen && (
    <div className="absolute z-10 w-full max-w-[95vw] bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
      {loading && <p>Cargando ubicación...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {nationalities
          .filter((nationality) =>
            nationality.label.toLowerCase().includes(search.toLowerCase())
          )
          .map((nationality) => (
            <li
              key={nationality.value}
              className="p-2 cursor-pointer text-gray-700 hover:bg-gray-200"
              onClick={() => handleSelectNationality(nationality.label)}
            >
              {nationality.label}
            </li>
          ))}
      </ul>
    </div>
  )}
  
  {/* Lista de países seleccionados */}
  {formData.countries.length > 0 && (
    <div className="mt-2 flex flex-wrap gap-1">
      {formData.countries.map((country, index) => (
        <div key={index} className="flex items-center bg-gray-200 px-2 py-1 rounded-md text-xs">
          <span>{country}</span>
          <button
            type="button"
            className="ml-1 text-gray-500 hover:text-gray-700"
            onClick={() => {
              setFormData({
                ...formData,
                countries: formData.countries.filter((_, i) => i !== index)
              });
            }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )}
</div>

<div className="flex flex-col">
    <label className="text-xs font-semibold mb-1">Ciudad</label>
          <input
            type="text"
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="Ciudad de la oferta laboral"
          />
        </div>

<div className="flex flex-col">
<label className="text-xs font-semibold mb-1">Tipo de oferta</label>
          <select
           className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.offerType}
            onChange={(e) =>
              setFormData({ ...formData, offerType: e.target.value })
            }
          >
            {contractTypes.map((contractTypes, index) => (
              <option key={index} value={contractTypes}>
                {contractTypes}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">Categoría</label>
          <select
           className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
      <label className="text-xs font-semibold mb-1">Género deporte</label>
          <select
           className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.sportGenres}
            onChange={(e) =>
              setFormData({ ...formData, sportGenres: e.target.value })
            }
          >
            {sportGenres.map((sportGenres, index) => (
              <option key={index} value={sportGenres}>
                {sportGenres}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">Modalidad</label>
          <select
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.sport}
            onChange={(e) =>
              setFormData({ ...formData, sport: e.target.value })
            }
          >
            {sports.map((sport, index) => (
              <option key={index} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">Tipo de contrato</label>
          <select
           className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.contractTypes}
            onChange={(e) =>
              setFormData({ ...formData, contractTypes: e.target.value })
            }
          >
            {contractTypes.map((contractTypes, index) => (
              <option key={index} value={contractTypes}>
                {contractTypes}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">Duración del contrato</label>
          <select
           className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.contractDurations}
            onChange={(e) =>
              setFormData({ ...formData, contractDurations: e.target.value })
            }
          >
            {contractDurations.map((duration, index) => (
              <option key={index} value={duration}>
                {duration}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">Posición</label>
          <select
           className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.position || ""}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
          >
            <option value="">Seleccionar posición</option>
            {position.map((pos, index) => (
              <option key={index} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">Moneda</label>
        <select
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
          value={formData.moneda}
          onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
        >
          <option value="EUR">Euro (€)</option>
          <option value="USD">Dólar ($)</option>
          <option value="GBP">Libra (£)</option>
          <option value="ARS">Peso Argentino</option>
          <option value="BRL">Real Brasileño</option>
          <option value="MXN">Peso Mexicano</option>
        </select>
      </div>

      <div className="flex flex-col">
  <label className="text-xs font-semibold mb-1">Salario</label>
  <input
    type="text"
    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
    value={formData.salary || ""}
    onChange={(e) => {
      const value = e.target.value;
      setFormData({
        ...formData,
        salary: value, 
      });
    }}
  />
</div>

        <div className="flex flex-col">
      <label className="text-xs font-semibold mb-1">Edad mínima</label>
          <input
            type="number"
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.minAge === 0 ? "" : formData.minAge}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                minAge: value === "" ? 0 : Number(value),
              });
            }}
          />
        </div>

        <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">Edad máxima</label>
          <input
            type="number"
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.maxAge === 0 ? "" : formData.maxAge}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                maxAge: value === "" ? 0 : Number(value),
              });
            }}
          />
        </div>

        <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">Experiencia mínima</label>
  <select
    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
    value={formData.minExperience}
    onChange={(e) => {
      const value = e.target.value;
      setFormData({ ...formData, minExperience: value });
    }}
  >
    {minExperience.map((experience, index) => (
      <option key={index} value={experience}>
        {experience}
      </option>
    ))}
     </select>

</div>


<div className="flex flex-col">
<label className="text-xs font-semibold mb-1">Pasaporte de la UE</label>
          <select
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.euPassport}
            onChange={(e) =>
              setFormData({
                ...formData,
                euPassport: e.target.value as YesOrNo,
              })
            }
          >
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">
            Disponibilidad para viajar:
          </label>
          <select
           className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.availabilityToTravel}
            onChange={(e) =>
              setFormData({
                ...formData,
                availabilityToTravel: e.target.value as YesOrNotravell,
              })
            }
          >
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">Descripción</label>
          <textarea
            name="description"
            maxLength={1500}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Escribe una breve descripción..."
          />
          <p className="text-xs text-gray-500">
            {1500 - formData.description.length} caracteres restantes
          </p>
        </div>

        <div className="flex flex-col">
  <label className="text-xs font-semibold mb-1">Competencias requeridas</label>
  <div className="grid grid-cols-2 gap-2">
    {extras.map((competency, index) => (
      <div key={index} className="flex items-center">
        <input
          type="checkbox"
          id={`competency-${index}`}
          value={competency}
          checked={formData.competencies?.includes(competency) || false}
          onChange={(e) => handleCompetencyChange(competency, e.target.checked)}
          className="mr-2"
        />
        <label htmlFor={`competency-${index}`} className="ml-1 text-sm text-gray-700">
          {competency}
        </label>
      </div>
    ))}
  </div>
</div>


        <div className="flex flex-col md:col-span-2 mt-4">
          <label className="text-sm font-bold mb-2">Cargar Imagen</label>
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 p-2 mb-3 rounded text-xs">
            <p className="font-semibold">IMPORTANTE:</p>
            <p>Solo se permite usar el logo de la liga en la que compite o el logo del club. No se permite incluir logos de agencias, intermediarios u otros. Las publicaciones que no cumplan serán editadas o eliminadas.</p>
          </div>
          <div className="w-full">
            <ImageUpload onUpload={handleImageUpload} />
            {imageUploadedMessage && (
              <div className="mt-2 bg-green-50 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
                {imageUploadedMessage}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4">
          <div className="max-w-6xl mx-auto p-4">
            <button
              type="submit"
              className="text-xl w-full font-bold mb-4 text-center bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
              disabled={loading}
            >
              {loading ? "Creando oferta..." : "Crear Oferta"}
            </button>
          </div>
        </div>

        {error && (
          <p className="col-span-1 md:col-span-2 lg:col-span-3 text-red-500 mt-4">
            {error}
          </p>
        )}
        {successMessage && (
          <p className="col-span-1 md:col-span-2 lg:col-span-3 text-green-700 mt-4">
            {successMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export default FormComponent;
