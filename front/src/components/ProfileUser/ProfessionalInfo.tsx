"use client";
import { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaDownload,
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { useUserContext } from "@/hook/useUserContext";
import { type IProfileData, PasaporteUe } from "@/Interfaces/IUser";
import FileUpload from "../Cloudinary/FileUpload";
import { updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import FootballField from "./FootballField";

// Define options for the dropdown fields
const CATEGORIAS_OPTIONS = [
  "Primera",
  "Reserva",
  "Primera Local",
  "U23",
  "U22",
  "U21",
  "U20",
  "U19",
  "U18",
  "U17",
  "U16",
  "U15",
  "U14",
];
const NIVEL_COMPETENCIA_OPTIONS = ["Profesional", "semiprofesional", "Amateur"];
const PUESTO_PRINCIPAL_OPTIONS = [
  "Delantero Centro",
  "Extremo Derecho",
  "Extremo Izquierdo",
  "Mediocampista Ofensivo",
  "Mediocampista Central",
  "Mediocampista Defensivo",
  "Lateral Derecho",
  "Lateral Izquierdo",
  "Defensor Central",
  "Portero",
  "Preparador Físico",
  "Entrenador",
  "Asistente Técnico",
  "Analista Táctico",
  "Utilero",
  "Médico",
  "Fisioterapeuta",
  "Nutricionista",
  "Psicólogo Deportivo",
  "Otro",
];
const PASAPORTE_UE_OPTIONS = ["Sí", "No"];
const ESTRUCTURA_CORPORAL_OPTIONS = [
  "Ectomorfo",
  "Mesomorfo",
  "Endomorfo",
  "Atlética",
  "Musculosa",
  "Robusta",
  "Delgada",
];
const PIE_HABIL_OPTIONS = ["Derecho", "Izquierdo", "Ambidiestro"];

const ProfessionalInfo: React.FC<{ profileData: IProfileData }> = ({
  profileData,
}) => {
  const { token, setUser } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<IProfileData>(profileData);
  const [cvInfo, setCvInfo] = useState<{
    url: string;
    filename: string;
  } | null>(profileData.cv ? { url: profileData.cv, filename: "CV" } : null);

  // Estados para controlar las secciones desplegables
  const [sectionsExpanded, setSectionsExpanded] = useState({
    positions: true, // Posiciones abiertas por defecto
    physicalData: false,
    cv: false,
    trajectory: false,
  });

  // Initialize with an empty experience
  const emptyExperience = {
    club: "",
    fechaInicio: "",
    fechaFinalizacion: "",
    categoriaEquipo: CATEGORIAS_OPTIONS[0],
    nivelCompetencia: NIVEL_COMPETENCIA_OPTIONS[0],
    logros: "",
  };

  // Información general del perfil
  const [primaryPosition, setPrimaryPosition] = useState<string>(
    profileData.primaryPosition || PUESTO_PRINCIPAL_OPTIONS[0]
  );
  const [secondaryPosition, setSecondaryPosition] = useState<string>(
    profileData.secondaryPosition || PUESTO_PRINCIPAL_OPTIONS[0]
  );
  const [pasaporteUE, setPasaporteUE] = useState<string>(
    profileData.pasaporteUe === PasaporteUe.SI ? "Sí" : "No"
  );

  // Datos físicos
  const [estructuraCorporal, setEstructuraCorporal] = useState<string>(
    profileData.bodyStructure || ESTRUCTURA_CORPORAL_OPTIONS[0]
  );
  const [pieHabil, setPieHabil] = useState<string>(
    profileData.skillfulFoot || PIE_HABIL_OPTIONS[0]
  );
  const [altura, setAltura] = useState<number>(profileData.height || 0);
  const [peso, setPeso] = useState<number>(profileData.weight || 0);

  // State for experiences (trayectorias)
  const [experiences, setExperiences] = useState<
    Array<{
      club: string;
      fechaInicio: string;
      fechaFinalizacion: string;
      categoriaEquipo: string;
      nivelCompetencia: string;
      logros: string;
    }>
  >([emptyExperience]);

  // Función para togglear secciones
  const toggleSection = (section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Componente para el header de sección
  const SectionHeader: React.FC<{
    title: string;
    section: keyof typeof sectionsExpanded;
    icon?: string;
  }> = ({ title, section, icon }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-[#1d5126] text-white rounded-t-lg hover:bg-[#143a1b] transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="text-xl font-medium">{title}</h3>
      </div>
      {sectionsExpanded[section] ? (
        <FaChevronDown className="text-lg" />
      ) : (
        <FaChevronRight className="text-lg" />
      )}
    </button>
  );

  useEffect(() => {
    // Initialize experiences from profileData
    if (profileData) {
      setFormData(profileData);

      // Initialize general profile information
      setPrimaryPosition(
        profileData.primaryPosition || PUESTO_PRINCIPAL_OPTIONS[0]
      );
      setSecondaryPosition(
        profileData.secondaryPosition || PUESTO_PRINCIPAL_OPTIONS[0]
      );
      setPasaporteUE(profileData.pasaporteUe === PasaporteUe.SI ? "Sí" : "No");

      // Initialize physical data
      setEstructuraCorporal(
        profileData.bodyStructure || ESTRUCTURA_CORPORAL_OPTIONS[0]
      );
      setPieHabil(profileData.skillfulFoot || PIE_HABIL_OPTIONS[0]);
      setAltura(profileData.height || 0);
      setPeso(profileData.weight || 0);

      // Initialize CV information if exists
      if (profileData.cv) {
        setCvInfo({ url: profileData.cv, filename: "CV" });
      }

      // Initialize experiences from trayectorias
      if (
        profileData.trayectorias &&
        Array.isArray(profileData.trayectorias) &&
        profileData.trayectorias.length > 0
      ) {
        console.log(
          "Inicializando trayectorias desde el perfil:",
          JSON.stringify(profileData.trayectorias)
        );

        // Map existing experiences
        const updatedExperiences = profileData.trayectorias.map((exp) => ({
          club: exp.club || "",
          fechaInicio: exp.fechaInicio || "",
          fechaFinalizacion: exp.fechaFinalizacion || "",
          categoriaEquipo: exp.categoriaEquipo || CATEGORIAS_OPTIONS[0],
          nivelCompetencia:
            exp.nivelCompetencia || NIVEL_COMPETENCIA_OPTIONS[0],
          logros: exp.logros || "",
        }));

        setExperiences(updatedExperiences);
      } else if (profileData.club) {
        // Handle legacy data format (single experience)
        const legacyExperience = {
          club: profileData.club || "",
          fechaInicio: profileData.fechaInicio || "",
          fechaFinalizacion: profileData.fechaFinalizacion || "",
          categoriaEquipo: profileData.categoriaEquipo || CATEGORIAS_OPTIONS[0],
          nivelCompetencia:
            profileData.nivelCompetencia || NIVEL_COMPETENCIA_OPTIONS[0],
          logros: profileData.logros || "",
        };

        setExperiences([legacyExperience]);
      }
    }
  }, [profileData]);

  const handleExperienceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value,
    };
    setExperiences(updatedExperiences);
  };

  const addExperience = () => {
    setExperiences([...experiences, { ...emptyExperience }]);
  };

  const removeExperience = (index: number) => {
    if (experiences.length > 1) {
      const updatedExperiences = experiences.filter((_, i) => i !== index);
      setExperiences(updatedExperiences);
    }
  };

  const handleCvUpload = (fileInfo: { url: string; filename: string }) => {
    setCvInfo(fileInfo);
    setFormData((prev) => ({
      ...prev,
      cv: fileInfo.url,
    }));
  };

  const handleDownloadCv = async () => {
    if (cvInfo?.url) {
      // Open CV in new tab
      window.open(cvInfo.url, "_blank");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty experiences
      const validExperiences = experiences.filter(
        (exp) => exp.club.trim() !== ""
      );

      // Format each experience properly
      const formattedExperiences = validExperiences.map((exp) => ({
        club: String(exp.club || ""),
        fechaInicio: String(exp.fechaInicio || ""),
        fechaFinalizacion: String(exp.fechaFinalizacion || ""),
        categoriaEquipo: String(exp.categoriaEquipo || ""),
        nivelCompetencia: String(exp.nivelCompetencia || ""),
        logros: String(exp.logros || ""),
      }));

      // Prepare the updated data (including trayectorias)
      const updatedData = {
        ...formData,
        primaryPosition: primaryPosition,
        secondaryPosition: secondaryPosition,
        pasaporteUe: pasaporteUE === "Sí" ? PasaporteUe.SI : PasaporteUe.NO,
        bodyStructure: estructuraCorporal,
        skillfulFoot: pieHabil,
        height: altura,
        weight: peso,
        cv: cvInfo?.url || undefined,
        trayectorias: formattedExperiences,
      };

      if (token) {
        // Extract userId from token
        const userId = JSON.parse(atob(token.split(".")[1])).id;

        console.log(
          "Actualizando datos del perfil incluyendo trayectorias:",
          JSON.stringify(updatedData.trayectorias)
        );

        // Update user data
        await updateUserData(userId, updatedData);

        setUser((prevUser) => {
          if (!prevUser) return prevUser; // Si prevUser es null, no hacemos nada
          return {
            ...prevUser,
            ...updatedData, // Actualizar la informacion del estado global (imagen,datos,etc)
          };
        });

        setShowNotification(true);
        setNotificationMessage(
          "Información profesional actualizada correctamente"
        );
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
    } catch (error: unknown) {
      let errorMessage = "Error desconocido";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Error updating professional info:", error);
      setShowErrorNotification(true);
      setErrorMessage(
        `Error al actualizar la información profesional: ${errorMessage}`
      );
      setTimeout(() => {
        setShowErrorNotification(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-[#1d5126]">
        Información Profesional
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sección de Posiciones */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Selección de Posiciones"
            section="positions"
            icon="⚽"
          />
          <div
            className={`transition-all duration-300 ease-in-out ${
              sectionsExpanded.positions
                ? "max-h-full opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="p-6 bg-white border-t">
              {/* Componente de cancha de fútbol */}
              <FootballField
                primaryPosition={primaryPosition}
                secondaryPosition={secondaryPosition}
                onPrimaryPositionChange={setPrimaryPosition}
                onSecondaryPositionChange={setSecondaryPosition}
              />

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-6">
                <div className="mb-4">
                  <label
                    htmlFor="pasaporteUE"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Pasaporte UE
                  </label>
                  <select
                    id="pasaporteUE"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={pasaporteUE}
                    onChange={(e) => setPasaporteUE(e.target.value)}
                  >
                    {PASAPORTE_UE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Datos Físicos */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Datos Físicos"
            section="physicalData"
            icon="💪"
          />
          <div
            className={`transition-all duration-300 ease-in-out ${
              sectionsExpanded.physicalData
                ? "max-h-full opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="p-6 bg-white border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label
                    htmlFor="estructuraCorp"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Estructura Corporal
                  </label>
                  <select
                    id="estructuraCorp"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={estructuraCorporal}
                    onChange={(e) => setEstructuraCorporal(e.target.value)}
                  >
                    {ESTRUCTURA_CORPORAL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="pieHabil"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Pie Hábil
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={pieHabil}
                    id="pieHabil"
                    onChange={(e) => setPieHabil(e.target.value)}
                  >
                    {PIE_HABIL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="altura"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Altura (cm)
                  </label>
                  <input
                    id="altura"
                    type="number"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={altura}
                    min="0"
                    max="250"
                    onChange={(e) => setAltura(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="peso"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Peso (kg)
                  </label>
                  <input
                    id="peso"
                    type="number"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={peso}
                    min="0"
                    max="150"
                    onChange={(e) => setPeso(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de CV */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader title="Currículum Vitae" section="cv" icon="📄" />
          <div
            className={`transition-all duration-300 ease-in-out ${
              sectionsExpanded.cv
                ? "max-h-full opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="p-6 bg-white border-t">
              {cvInfo ? (
                <div className="mb-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-verde-oscuro">
                      {cvInfo.filename.toLowerCase().endsWith(".pdf") ? (
                        <FaFilePdf size={24} />
                      ) : cvInfo.filename
                          .toLowerCase()
                          .match(/\.(doc|docx)$/) ? (
                        <FaFileWord size={24} />
                      ) : (
                        <FaFile size={24} />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {cvInfo.filename.length > 20
                          ? `${cvInfo.filename.substring(0, 20)} ...`
                          : cvInfo.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        CV subido correctamente
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadCv}
                      className="ml-4 text-verde-oscuro hover:text-verde-claro"
                      title="Descargar CV"
                    >
                      <FaDownload size={18} />
                    </button>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">
                      ¿Quieres reemplazar tu CV actual?
                    </p>
                    <FileUpload onUpload={handleCvUpload} fileType="cv" />
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Sube tu currículum en formato PDF, DOC o DOCX.
                  </p>
                  <FileUpload onUpload={handleCvUpload} fileType="cv" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Trayectoria */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader title="Trayectoria" section="trajectory" icon="🏆" />
          <div
            className={`transition-all duration-300 ease-in-out ${
              sectionsExpanded.trajectory
                ? "max-h-full opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="p-6 bg-white border-t">
              {experiences.map((exp, index) => (
                <div
                  key={`${exp.club}-${index}`}
                  className="mb-6 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg text-verde-oscuro font-medium">
                      Experiencia {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={experiences.length === 1}
                    >
                      {experiences.length > 1 && <FaTrash />}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label
                        htmlFor="club"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Club/Institución
                      </label>
                      <input
                        id="club"
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={exp.club}
                        onChange={(e) =>
                          handleExperienceChange(index, "club", e.target.value)
                        }
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor=""
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Fecha de Inicio
                      </label>
                      <input
                        id="fechaInicio"
                        type="month"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={
                          exp.fechaInicio ? exp.fechaInicio.slice(0, 7) : ""
                        }
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "fechaInicio",
                            `${e.target.value}-01` // siempre guarda el primer día del mes
                          )
                        }
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="fechaFinalizacion"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Fecha de Finalización
                      </label>
                      <input
                        id="fechaFinalizacion"
                        type="month"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={
                          exp.fechaFinalizacion
                            ? exp.fechaFinalizacion.slice(0, 7)
                            : ""
                        }
                        min={exp.fechaInicio ? exp.fechaInicio.slice(0, 7) : ""}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "fechaFinalizacion",
                            `${e.target.value}-01` // siempre guarda el primer día del mes
                          )
                        }
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="categoriaEqui"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Categoría del Equipo
                      </label>
                      <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={exp.categoriaEquipo}
                        id="categoriaEqui"
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "categoriaEquipo",
                            e.target.value
                          )
                        }
                      >
                        {CATEGORIAS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-2 bg-[#1d5126] text-white py-2 px-4 rounded hover:bg-[#143a1b] transition-colors"
              >
                <FaPlus /> Agregar Experiencia
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-[#1d5126] text-white py-3 px-8 rounded-lg hover:bg-[#143a1b] transition-colors font-medium"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>

      {showNotification && (
        <NotificationsForms message={notificationMessage} isError={false} />
      )}

      {showErrorNotification && (
        <NotificationsForms message={errorMessage} isError={true} />
      )}
    </div>
  );
};

export default ProfessionalInfo;
