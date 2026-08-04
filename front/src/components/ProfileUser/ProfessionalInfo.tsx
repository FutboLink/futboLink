"use client";
import { useEffect, useState } from "react";
import {
  FaDownload,
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaPlus,
  FaTrash,
  FaFutbol,
  FaRunning,
  FaFileAlt,
  FaTrophy,
  FaCalendarAlt,
  FaGlobeAmericas,
  FaMedal,
  FaPen,
  FaTrashAlt,
  FaTimes,
} from "react-icons/fa";
import { useUserContext } from "@/hook/useUserContext";
import { type IProfileData, PasaporteUe, UserType } from "@/Interfaces/IUser";
import ClubAutocomplete from "../OrganizationPages/ClubAutocomplete";
import useNationalities from "../Forms/FormUser/useNationalitys";
import FileUpload from "../Cloudinary/FileUpload";
import { updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import FootballField from "./FootballField";
import CountryFlag from "react-country-flag";
import { CountryToCode } from "../countryFlag/countryFlag";

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
  
const [activeSection, setActiveSection] = useState<
  "positions" | "physicalData" | "cv" | "trajectory"
>("positions");
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
    liga: "",
    ligaPageId: undefined as string | undefined,
    ligaPageSlug: undefined as string | undefined,
    ligaPageLogo: undefined as string | undefined,
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
    // Liga en la que compitió. Igual que el club: texto libre o, si se eligió
    // una página LEAGUE del autocomplete, guardamos id+slug.
    liga: string;
    ligaPageId?: string;
    ligaPageSlug?: string;
    ligaPageLogo?: string;
  }

  // State for experiences (trayectorias)
  const [experiences, setExperiences] = useState<Experience[]>([
   { ...emptyExperience, id: Date.now().toString() }
  ]);
  
  const [editingExperience, setEditingExperience] = useState<number | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<number | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Lista de países para el selector de la trayectoria (País → Club → Liga).
  const { nationalities } = useNationalities();

  // Solo el Futbolista puro (PLAYER + puesto = Jugador, o legacy sin
  // puesto) muestra Posiciones y Datos Físicos. El Cuerpo Técnico
  // (Entrenador, DT, etc.) y AGENCY/RECRUITER/CLUB no tienen esos campos.
  // Trayectoria se muestra para todos (NO depende de este flag).
  const puestoLower = (formData?.puesto || "").toLowerCase();
  const isNonPlayerProfessional = !(
    (formData?.role as unknown as UserType) === UserType.PLAYER &&
    (puestoLower === "" || puestoLower === "jugador")
  );

  // Los roles "ofertantes" (Agente y Reclutador) pueden ver/seleccionar páginas
  // de tipo AGENCY en la trayectoria. Incluye los perfiles RECRUITER migrados
  // ("Agencia de reclutamiento") que son dueños de su propia página de agencia.
  // El resto de los roles no ve agencias en el autocomplete.
  const userRole = formData?.role as unknown as UserType;
  const isAgente =
    userRole === UserType.AGENCY || userRole === UserType.RECRUITER;

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
          liga: exp.liga || "",
          ligaPageId: exp.ligaPageId,
          ligaPageSlug: exp.ligaPageSlug,
          ligaPageLogo: (exp as any).ligaPageLogo,
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
          liga: "",
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
        liga: String(exp.liga || ""),
        ...(exp.clubPageId ? { clubPageId: exp.clubPageId } : {}),
        ...(exp.clubPageSlug ? { clubPageSlug: exp.clubPageSlug } : {}),
        ...(exp.clubPageLogo ? { clubPageLogo: exp.clubPageLogo } : {}),
        ...(exp.ligaPageId ? { ligaPageId: exp.ligaPageId } : {}),
        ...(exp.ligaPageSlug ? { ligaPageSlug: exp.ligaPageSlug } : {}),
        ...(exp.ligaPageLogo ? { ligaPageLogo: exp.ligaPageLogo } : {}),
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
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-[#2f6e22]">
        Información Profesional
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
         
        {!isNonPlayerProfessional && (
     <>

<button
  type="button"
  onClick={() => setActiveSection("positions")}
  className={`rounded-2xl p-5 text-left transition-all ${
    activeSection === "positions"
        ? "border-2 border-[#3d7a26] bg-[#f2f8ef] shadow-sm"
      : "border border-gray-200 bg-white shadow-sm hover:shadow-md"
  }`}
>
    <div className="text-[#3d7a26] mb-3">
  <FaFutbol size={34} />
</div>
    <h3 className="font-semibold text-gray-900">Posiciones</h3>
    <p className="text-sm text-gray-500 mt-1">
      Posición en campo
    </p>
  </button>
       
<button
  type="button"
  onClick={() => setActiveSection("physicalData")}
  className={`rounded-2xl p-5 text-left transition-all ${
    activeSection === "physicalData"
        ? "border-2 border-[#3d7a26] bg-[#f2f8ef] shadow-sm"
      : "border border-gray-200 bg-white shadow-sm hover:shadow-md"
  }`}
>
    <div className="text-[#3d7a26] mb-3">
  <FaRunning size={34} />
</div>
    <h3 className="font-semibold text-gray-900">Datos físicos</h3>
    <p className="text-sm text-gray-500 mt-1">
      Perfil físico
    </p>
  </button>
    </>
  )}
<button
  type="button"
  onClick={() => setActiveSection("cv")}
  className={`rounded-2xl p-5 text-left transition-all ${
    activeSection === "cv"
        ? "border-2 border-[#3d7a26] bg-[#f2f8ef] shadow-sm"
      : "border border-gray-200 bg-white shadow-sm hover:shadow-md"
  }`}
>
    <div className="text-[#3d7a26] mb-3">
  <FaFileAlt size={34} />
</div>
    <h3 className="font-semibold text-gray-900">CV</h3>
    <p className="text-sm text-gray-500 mt-1">
      Currículum 
    </p>
  </button>

<button
  type="button"
  onClick={() => setActiveSection("trajectory")}
  className={`rounded-2xl p-5 text-left transition-all ${
    activeSection === "trajectory"
        ? "border-2 border-[#3d7a26] bg-[#f2f8ef] shadow-sm"
      : "border border-gray-200 bg-white shadow-sm hover:shadow-md"
  }`}
>
    <div className="text-[#3d7a26] mb-3">
  <FaTrophy size={34} />
</div>
    <h3 className="font-semibold text-gray-900">Trayectoria</h3>
    <p className="text-sm text-gray-500 mt-1">
      Experiencia 
    </p>
  </button>

</div>
        {/* Sección de Posiciones */}
        
        {!isNonPlayerProfessional &&
          activeSection === "positions" && ( 
<div
  id="field-primaryPosition"
  className="overflow-visible"
>
    <div className="bg-transparent p-0">
      
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
                      className="text-gray-700 font-semibold text-sm mb-2"
                    >
                      Pasaporte UE
                    </label>
                    <select
                      id="pasaporteUE"
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
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
        )}

        {/* Sección de Datos Físicos */}
        {!isNonPlayerProfessional && (
          <div
  id="field-physicalData"
  className={`overflow-hidden transition-all duration-300 ${
    activeSection === "physicalData"
      ? ""
      : ""
  }`}
>
            <div
              className={`transition-all duration-300 ease-in-out ${
                activeSection === "physicalData"
                  ? "max-h-[3000px] opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="bg-transparent p-0 md:p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label
                      htmlFor="estructuraCorp"
                      className="text-gray-700 font-semibold text-sm mb-2"
                    >
                      Estructura Corporal
                    </label>
                    <select
                      id="estructuraCorp"
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
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
                      className="text-gray-700 font-semibold text-sm mb-2"
                    >
                      Pie Hábil
                    </label>
                    <select
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
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
                      className="text-gray-700 font-semibold text-sm mb-2"
                    >
                      Altura (cm)
                    </label>
                    <input
                      id="altura"
                      type="number"
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
                      value={altura}
                      min="0"
                      max="250"
                      onChange={(e) => setAltura(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="peso"
                      className="text-gray-700 font-semibold text-sm mb-2"
                    >
                      Peso (kg)
                    </label>
                    <input
                      id="peso"
                      type="number"
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
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
<div
  id="field-cv"
  className="overflow-hidden transition-all duration-300"
>
          <div
            className={`transition-all duration-300 ease-in-out ${
              activeSection === "cv"
                ? "max-h-full opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="bg-transparent p-0 md:p-2">
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
<div
  id="field-trayectorias"
  className="overflow-hidden transition-all duration-300"
>
          <div
            className={`transition-all duration-300 ease-in-out ${
              activeSection === "trajectory"
                ? "max-h-full opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="bg-transparent p-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {experiences.map((exp, index) => (
                <div
                  key={exp.id}
                  className={`h-full p-5 border rounded-2xl bg-white transition-all duration-300 ${
  editingExperience === index
    ? "border-[#3d7a26] shadow-xl scale-[1.01]"
    : "border-[#dbead4] shadow-sm hover:shadow-lg hover:-translate-y-1"
}`}
                >
<div className="flex items-start gap-3 flex-1 min-w-0">
<div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">

    {exp.clubPageLogo ? (
      <img
        src={exp.clubPageLogo}
        alt={exp.club}
        className="w-24 h-24 rounded-xl object-contain border border-[#dbead4] bg-white p-2 shadow-sm"
      />
    ) : (
      <div className="w-24 h-24 rounded-xl border border-[#dbead4] bg-[#f8fbf6] flex items-center justify-center shadow-sm">
        <FaTrophy className="text-[#3d7a26] text-3xl opacity-50" />
      </div>
    )}

<div>
  <h4 className="text-xl font-bold text-[#1d5126] leading-tight">
    {exp.club || `Experiencia ${index + 1}`}
  </h4>
{exp.liga && (
  <div className="flex items-center gap-2 mt-1 mb-2">

    {exp.ligaPageLogo ? (
      <img
        src={exp.ligaPageLogo}
        alt={exp.liga}
        className="w-5 h-5 object-contain rounded-sm"
      />
    ) : (
      <FaTrophy className="text-[#3d7a26] text-xs opacity-70" />
    )}

    <span className="text-sm font-medium text-gray-600">
      {exp.liga}
    </span>

  </div>
)}
{exp.categoriaEquipo && (
  <p className="flex items-center gap-2 text-sm text-gray-600">
    <FaFutbol className="text-[#3d7a26]" />
    {exp.categoriaEquipo}
  </p>
)}

<p className="flex items-center gap-2 text-sm text-gray-600">
  {exp.nacionalidadTrayectoria ? (
    <>
<CountryFlag
  svg
  countryCode={
    CountryToCode[
      exp.nacionalidadTrayectoria as keyof typeof CountryToCode
    ] || ""
  }
  style={{
    width: "18px",
    height: "18px",
    borderRadius: "3px",
  }}
/>

      <span>{exp.nacionalidadTrayectoria}</span>
    </>
  ) : (
    <>
      <FaGlobeAmericas className="text-[#3d7a26]" />
      <span>Sin país</span>
    </>
  )}
</p>

{(exp.fechaInicio || exp.fechaFinalizacion) && (
  <p className="flex items-center gap-2 text-sm text-gray-600">
    <FaCalendarAlt className="text-[#3d7a26]" />
    {exp.fechaInicio
      ? new Date(exp.fechaInicio).toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        })
      : "—"}
    {" - "}
    {exp.fechaFinalizacion
      ? new Date(exp.fechaFinalizacion).toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        })
      : "Actualidad"}
  </p>
)}
</div>

  </div>

<div className="flex items-center gap-2">

<button
  type="button"
onClick={() => {

    if (editingExperience === index) {

        setEditingExperience(null);
        setEditingIndex(null);
        setShowEditModal(false);

    } else {

        setEditingExperience(index);
        setEditingIndex(index);
        setShowEditModal(true);

    }

}}
  title={editingExperience === index ? "Cerrar" : "Editar"}
  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
    editingExperience === index
      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
      : "bg-[#eef7ea] text-[#3d7a26] hover:bg-[#dff0d8]"
  }`}
>
  {editingExperience === index ? (
    <FaTimes size={16} />
  ) : (
    <FaPen size={16} />
  )}
</button>

{experiences.length > 1 && (
  <button
    type="button"
    onClick={() => {
       setExperienceToDelete(index);
       setShowDeleteModal(true);
    }}
    title="Eliminar experiencia"
    className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200"
  >
    <FaTrashAlt size={16} />
  </button>
)}

</div>
</div>
                  {editingExperience === index && (
                 <>
                  <p className="text-red-600 font-bold">
                  Editando índice {index}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pt-2 md:pt-4 mt-2 md:mt-4">
                    {/* 1) País — filtra los clubes y ligas que se ofrecen */}
                    <div className="mb-4">
                      <label
                        htmlFor={`pais-${index}`}
                        className="text-gray-700 font-semibold text-sm mb-2"
                      >
                        País
                      </label>
                      <select
                        id={`pais-${index}`}
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
                        value={exp.nacionalidadTrayectoria}
                        onChange={(e) => {
                          const pais = e.target.value;
                          setExperiences((prev) => {
                            const copy = [...prev];
                            // Al cambiar el país reseteamos club y liga, que
                            // dependen del país elegido.
                            copy[index] = {
                              ...copy[index],
                              nacionalidadTrayectoria: pais,
                              club: "",
                              clubPageId: undefined,
                              clubPageSlug: undefined,
                              clubPageLogo: undefined,
                              liga: "",
                              ligaPageId: undefined,
                              ligaPageSlug: undefined,
                            };
                            return copy;
                          });
                        }}
                      >
                        <option value="">Seleccioná un país</option>
                        {nationalities.map((n) => (
                          <option key={n.value} value={n.value}>
                            {n.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2) Club/Institución — filtrado por el país elegido */}
                    <div className="mb-4">
                      <label
                        htmlFor={`club-${index}`}
                        className="text-gray-700 font-semibold text-sm mb-2"
                      >
                        Club/Institución
                      </label>
                      <ClubAutocomplete
                        inputId={`club-${index}`}
                        includeAgency={isAgente}
                        country={exp.nacionalidadTrayectoria}
                        disabled={!exp.nacionalidadTrayectoria}
                        placeholder={
                          exp.nacionalidadTrayectoria
                            ? undefined
                            : "Elegí primero el país"
                        }
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

                    {/* 3) Liga — autocomplete de páginas LEAGUE del país elegido,
                        con fallback de texto libre (muchos países no tienen
                        ligas cargadas todavía). */}
                    <div className="mb-4">
                      <label
                        htmlFor={`liga-${index}`}
                        className="text-gray-700 font-semibold text-sm mb-2"
                      >
                        Liga
                      </label>
                      <ClubAutocomplete
                        inputId={`liga-${index}`}
                        typeFilter="LEAGUE"
                        linkedLabel="la liga oficial"
                        country={exp.nacionalidadTrayectoria}
                        disabled={!exp.nacionalidadTrayectoria}
                        placeholder={
                          exp.nacionalidadTrayectoria
                            ? "Liga"
                            : "Elegí primero el país"
                        }
                        value={exp.liga}
                        selectedPageId={exp.ligaPageId}
                        selectedPageSlug={exp.ligaPageSlug}
                        onChange={(next) => {
                          setExperiences((prev) => {
                            const copy = [...prev];
                            copy[index] = {
                            ...copy[index],
                            liga: next.club,
                            ligaPageId: next.clubPageId,
                            ligaPageSlug: next.clubPageSlug,
                            ligaPageLogo: next.clubPageLogo,
                            };
                            return copy;
                          });
                        }}
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor=""
                        className="text-gray-700 font-semibold text-sm mb-2"
                      >
                        Fecha de Inicio
                      </label>
                      <input
                        id="fechaInicio"
                        type="month"
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
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
                        className="text-gray-700 font-semibold text-sm mb-2"
                      >
                        Fecha de Finalización
                      </label>
                      <input
                        id="fechaFinalizacion"
                        type="month"
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
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
                        className="text-gray-700 font-semibold text-sm mb-2"
                      >
                        Categoría del Equipo
                      </label>
                      <select
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
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
                 )}
                </div>
              ))}
<button
  type="button"
  onClick={addExperience}
  className="w-full border-2 border-dashed border-[#cfe6c6] rounded-2xl py-8 flex flex-col items-center justify-center bg-[#fbfef9] hover:bg-[#f2f8ef] hover:border-[#3d7a26] transition-all duration-300 group"
>

  <div className="w-14 h-14 rounded-2xl bg-[#eef7ea] flex items-center justify-center mb-4 group-hover:scale-110 transition-all">

    <FaPlus className="text-[#3d7a26] text-xl"/>

  </div>

  <h3 className="font-semibold text-[#1d5126]">
    Agregar experiencia
  </h3>

  <p className="text-sm text-gray-500 mt-1">
    Añadí otro club a tu trayectoria deportiva
  </p>

</button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-[#3d7a26] text-white py-3 px-8 rounded-xl hover:bg-[#2f651f] transition-all shadow-sm font-medium"
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
      {showDeleteModal && (
  <div
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
  onClick={() => {
    setShowDeleteModal(false);
    setExperienceToDelete(null);
  }}
>
    <div
  className="bg-white rounded-2xl shadow-2xl w-[92%] max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
  onClick={(e) => e.stopPropagation()}
>

      <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-red-100">
        <FaTrashAlt className="text-red-600 text-xl" />
      </div>

      <h3 className="mt-5 text-xl font-semibold text-center text-gray-900">
        Eliminar experiencia
      </h3>

      <p className="mt-3 text-center text-gray-500">
        ¿Estás seguro de que querés eliminar esta experiencia?
      </p>

      <p className="mt-1 text-sm text-center text-gray-400">
        Esta acción no se puede deshacer.
      </p>

      <div className="flex gap-3 mt-8">

        <button
          type="button"
          onClick={() => {
            setShowDeleteModal(false);
            setExperienceToDelete(null);
          }}
          className="flex-1 h-11 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={() => {
            if (experienceToDelete !== null) {
              removeExperience(experienceToDelete);
            }

            setShowDeleteModal(false);
            setExperienceToDelete(null);
          }}
          className="flex-1 h-11 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all"
        >
          Eliminar
        </button>

      </div>

    </div>
  </div>
)}
    </div>
  );
};

export default ProfessionalInfo;
