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
import { type IProfileData, PasaporteUe, UserType } from "@/Interfaces/IUser";
import ClubAutocomplete from "../OrganizationPages/ClubAutocomplete";
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

interface ProfessionalInfoProps {
  profileData: IProfileData;
  onProfileChange?: (updates: Partial<IProfileData>) => void;
}

const ProfessionalInfo: React.FC<ProfessionalInfoProps> = ({
  profileData,
  onProfileChange,
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
    id: "",
    club: "",
    fechaInicio: "",
    fechaFinalizacion: "",
    categoriaEquipo: CATEGORIAS_OPTIONS[0],
    nivelCompetencia: NIVEL_COMPETENCIA_OPTIONS[0],
    logros: "",
    nacionalidadTrayectoria: "",
    clubPageId: undefined as string | undefined,
    clubPageSlug: undefined as string | undefined,
    clubPageLogo: undefined as string | undefined,
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

  // Definir el tipo para la experiencia
  interface Experience {
    id: string;
    club: string;
    fechaInicio: string;
    fechaFinalizacion: string;
    categoriaEquipo: string;
    nivelCompetencia: string;
    nacionalidadTrayectoria: string;
    logros: string;
    // Si el club fue elegido del autocomplete (módulo 1F),
    // guardamos también el id+slug para poder linkear al perfil del club.
    clubPageId?: string;
    clubPageSlug?: string;
    clubPageLogo?: string;
  }

  // State for experiences (trayectorias)
  const [experiences, setExperiences] = useState<Experience[]>([{ ...emptyExperience, id: Date.now().toString() }]);

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

  // Solo el Futbolista puro (PLAYER + puesto = Jugador, o legacy sin
  // puesto) muestra Posiciones y Datos Físicos. El Cuerpo Técnico
  // (Entrenador, DT, etc.) y AGENCY/RECRUITER/CLUB no tienen esos campos.
  // Trayectoria se muestra para todos (NO depende de este flag).
  const puestoLower = (formData?.puesto || "").toLowerCase();
  const isNonPlayerProfessional = !(
    (formData?.role as unknown as UserType) === UserType.PLAYER &&
    (puestoLower === "" || puestoLower === "jugador")
  );

  // Solo el rol Agente puede ver/seleccionar páginas de tipo AGENCY en la
  // trayectoria. El resto de los roles no ve agencias en el autocomplete.
  const isAgente = (formData?.role as unknown as UserType) === UserType.AGENCY;

  // NOTA sobre la barra de progreso en tiempo real:
  // Probamos sincronizar formData + sub-states (primaryPosition,
  // secondaryPosition, altura, peso, etc) hacia el padre con un useEffect
  // que disparaba onProfileChange en cada cambio. Eso causaba un loop
  // infinito porque el padre re-pasa profileData al hijo, que re-corre el
  // useEffect de inicialización (setFormData(profileData)), que dispara el
  // sync, que actualiza el padre, que re-pasa profileData... etc.
  //
  // Solución: ProfessionalInfo NO empuja sus cambios al padre en tiempo
  // real. La barra de progreso refleja los campos de ProfessionalInfo
  // recién después de "Guardar" (cuando se persisten en DB y el padre
  // refetchea). PersonalInfo sí sincroniza en tiempo real porque trabaja
  // directamente sobre fetchedProfileData sin states paralelos.
  // Si después se necesita real-time también acá, hay que mover los sub-
  // states adentro de formData y dispar onProfileChange por handler, no
  // vía useEffect.

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
        const updatedExperiences = (profileData.trayectorias || []).map((exp, i) => ({
          id: `exp-${Date.now()}-${i}`,
          club: exp.club || "",
          fechaInicio: exp.fechaInicio || "",
          fechaFinalizacion: exp.fechaFinalizacion || "",
          categoriaEquipo: exp.categoriaEquipo || CATEGORIAS_OPTIONS[0],
          nivelCompetencia: exp.nivelCompetencia || NIVEL_COMPETENCIA_OPTIONS[0],
          logros: exp.logros || "",
          nacionalidadTrayectoria: exp.nacionalidadTrayectoria || "",
          clubPageId: exp.clubPageId,
          clubPageSlug: exp.clubPageSlug,
          clubPageLogo: exp.clubPageLogo,
        }));

        setExperiences(updatedExperiences);
      } else if (profileData.club) {
        // Handle legacy data format (single experience)
        const legacyExperience: Experience = {
          id: `legacy-${Date.now()}`,
          club: profileData.club || "",
          fechaInicio: profileData.fechaInicio || "",
          fechaFinalizacion: profileData.fechaFinalizacion || "",
          categoriaEquipo: profileData.categoriaEquipo || CATEGORIAS_OPTIONS[0],
          nivelCompetencia: profileData.nivelCompetencia || NIVEL_COMPETENCIA_OPTIONS[0],
          logros: profileData.logros || "",
          nacionalidadTrayectoria: profileData.nacionalidadTrayectoria || "",
        };

        setExperiences([legacyExperience]);
      }
    }
  }, [profileData]);

  const handleExperienceChange = (
    index: number,
    field: keyof Experience,
    value: string
  ) => {
    setExperiences(prevExperiences => {
      const newExperiences = [...prevExperiences];
      newExperiences[index] = {
        ...newExperiences[index],
        [field]: value,
      };
      return newExperiences;
    });
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, { ...emptyExperience, id: Date.now().toString() }]);
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
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      return { ...prevUser, cv: fileInfo.url } as typeof prevUser;
    });
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
        nacionalidadTrayectoria: String(exp.nacionalidadTrayectoria || ""),
        ...(exp.clubPageId ? { clubPageId: exp.clubPageId } : {}),
        ...(exp.clubPageSlug ? { clubPageSlug: exp.clubPageSlug } : {}),
        ...(exp.clubPageLogo ? { clubPageLogo: exp.clubPageLogo } : {}),
      }));

      // Base updated data (always allowed)
      const updatedData: Partial<IProfileData> = {
        ...formData,
        cv: cvInfo?.url || undefined,
        trayectorias: formattedExperiences,
      };

      // Include player-specific fields only if applicable
      if (!isNonPlayerProfessional) {
        updatedData.primaryPosition = primaryPosition;
        updatedData.secondaryPosition = secondaryPosition;
        updatedData.pasaporteUe =
          pasaporteUE === "Sí" ? PasaporteUe.SI : PasaporteUe.NO;
        updatedData.bodyStructure = estructuraCorporal;
        updatedData.skillfulFoot = pieHabil;
        updatedData.height = altura;
        updatedData.weight = peso;
      }

      if (token) {
        // Extract userId from token
        const userId = JSON.parse(atob(token.split(".")[1])).id;

        console.log(
          "Actualizando datos del perfil:",
          JSON.stringify(updatedData)
        );

        // Update user data
        await updateUserData(userId, updatedData as any);

        setUser((prevUser) => {
          if (!prevUser) return prevUser; // Si prevUser es null, no hacemos nada
          return {
            ...prevUser,
            ...updatedData, // Actualizar la informacion del estado global (imagen,datos,etc)
          } as any;
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
        {!isNonPlayerProfessional && (
          <div id="field-primaryPosition" className="border border-gray-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Selección de Posiciones"
              section="positions"
              icon="⚽"
            />
            <div
              className={`transition-all duration-300 ease-in-out ${
                sectionsExpanded.positions
                  ? "max-h-[3000px] opacity-100"
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
        )}

        {/* Sección de Datos Físicos */}
        {!isNonPlayerProfessional && (
          <div id="field-physicalData" className="border border-gray-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Datos Físicos"
              section="physicalData"
              icon="💪"
            />
            <div
              className={`transition-all duration-300 ease-in-out ${
                sectionsExpanded.physicalData
                  ? "max-h-[3000px] opacity-100"
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
        )}

        {/* Sección de CV */}
        <div id="field-cv" className="border border-gray-200 rounded-lg overflow-hidden">
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
        <div id="field-trayectorias" className="border border-gray-200 rounded-lg overflow-hidden">
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
                  key={exp.id}
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
                        htmlFor={`club-${index}`}
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Club/Institución
                      </label>
                      <ClubAutocomplete
                        inputId={`club-${index}`}
                        includeAgency={isAgente}
                        value={exp.club}
                        selectedPageId={exp.clubPageId}
                        selectedPageSlug={exp.clubPageSlug}
                        onChange={(next) => {
                          setExperiences((prev) => {
                            const copy = [...prev];
                            copy[index] = {
                              ...copy[index],
                              club: next.club,
                              clubPageId: next.clubPageId,
                              clubPageSlug: next.clubPageSlug,
                              clubPageLogo: next.clubPageLogo,
                            };
                            return copy;
                          });
                        }}
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
