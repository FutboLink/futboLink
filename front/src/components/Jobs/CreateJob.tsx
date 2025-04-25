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
    nationality: "",
    location: "",
    position: "Jugador", 
    category: "Amateur", 
    sport: "Fútbol 11",
    contractTypes: "Contrato Profesional",
    contractDurations: "Contrato Temporal",
    salary: "",
    extra: [],
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
 
  // Maneja la selección de una nacionalidad
  const handleSelectNationality = (value: string) => {
    setSelectedNationality(value); // Actualiza selectedNationality con el valor seleccionado
    setFormData((prevState) => ({
      ...prevState,
      nationality: value, // Actualiza el estado del formulario
    }));
    setSearch(""); // Limpia el campo de búsqueda
    setIsOpen(false); // Cierra el dropdown una vez se seleccione una opción
  };


  const handleExtraChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    extra: string
  ) => {
    const { checked } = e.target;
    setFormData({
      ...formData,
      extra: checked
        ? [...formData.extra, extra]
        : formData.extra.filter((item) => item !== extra),
    });
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
  
    const currencyToSend =
      formData.currencyType === "Otro"
        ? formData.customCurrencySign?.trim() ?? ""
        : formData.currencyType?.trim() ?? "";
  
    if (!currencyToSend) {
      setError("Debes ingresar un tipo de moneda válido.");
      setLoading(false);
      return;
    }
  
    const { customCurrencySign, ...restFormData } = formData;
  
    const formDataToSend: ICreateJob = {
      ...restFormData,
      currencyType: currencyToSend,
    };
  
    setTimeout(async () => {
      try {
        const response = await fetchCreateJob(formDataToSend, token);
        console.log("Oferta creada:", response);
        setSuccessMessage("¡Oferta creada exitosamente!");
        setFormData({
          title: "",
          nationality: "",
          location: "",
          position: "",
          category: "",
          sport: "",
          contractTypes: "",
          contractDurations: "",
          salary: "",
          extra: [],
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-2">
    <div className="flex flex-col">
      <label className="text-xs font-semibold mb-1">Título</label>
      <input
        type="text"
        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Nombre de la oferta"
      />
    </div>

   {/* Ubicación */}
   <div className="flex flex-col relative" ref={dropdownRef}>
  <label className="text-xs font-semibold mb-1">Ubicación de la oferta</label>
  <input
    type="text"
    className="px-2 flex flex-col relative py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-verde-claro"
    value={formData.nationality}
    onChange={(e) => {
      const value = e.target.value;
      setFormData({ ...formData, nationality: value });
      setSearch(value);
      setIsOpen(true);
    }}
    placeholder="Lugar del trabajo"
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
<label className="text-xs font-semibold mb-1">Posición</label>
          <select
           className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-verde-claro"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
          >
            {position.map((position, index) => (
              <option key={index} value={position}>
                {position}
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
        <label className="text-xs font-semibold mb-1">Tiempo de contrato</label>
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
  <label className="text-xs font-semibold mb-1">Extras al salario</label>
  <p className="mb-1 text-xs text-gray-500">(Haz clic en las que desees agregar)</p>
  <div className="flex flex-wrap gap-3">
    {extras.map((extra, index) => (
      <div key={index} className="flex items-center">
        <input
          type="checkbox"
          id={`extra-${index}`}
          value={extra}
          checked={formData.extra.includes(extra)}
          onChange={(e) => handleExtraChange(e, extra)}
          className="h-4 w-4 text-verde-claro border-gray-300 rounded"
        />
        <label htmlFor={`extra-${index}`} className="ml-1 text-sm text-gray-700">
          {extra}
        </label>
      </div>
    ))}
  </div>
</div>


        <div className="flex flex-col md:col-span-2 mt-4">
          <label className="text-sm font-bold mb-2">Cargar Imagen</label>
          <div className="w-full">
            <ImageUpload onUpload={handleImageUpload} />
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
