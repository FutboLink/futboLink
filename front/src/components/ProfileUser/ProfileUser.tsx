"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IProfileData } from "@/Interfaces/IUser";
import PersonalInfo from "./PersonalInfo";
import ProfessionalInfo from "./ProfessionalInfo";
import ProfileProgressBar from "./ProfileProgressBar";
import { UserContext } from "../Context/UserContext";
import { fetchUserData } from "../Fetchs/UsersFetchs/UserFetchs";
import { useI18nMode } from "../Context/I18nModeContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import { FaUser } from "react-icons/fa";
import { FaTrophy } from "react-icons/fa";
import type { ProfileFieldStatus } from "@/lib/profileCompleteness";

const Profile = () => {
  const { token, user } = useContext(UserContext);
  const { isNextIntlEnabled } = useI18nMode();
  const tCommon = useNextIntlTranslations('common');
  
  // Función para obtener el texto traducido o el texto original
  const getText = (originalText: string, translatedKey: string) => {
    return isNextIntlEnabled ? tCommon.t(translatedKey) : originalText;
  };
  
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<IProfileData | null>(null);
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") === "Profesional"
    ? "Profesional"
    : "Personal";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Sync en tiempo real desde los hijos (PersonalInfo / ProfessionalInfo) con
  // el state local de userData. Cada vez que el usuario completa o borra un
  // campo, la barra de progreso refleja el cambio sin necesidad de Guardar+F5.
  // useCallback con deps vacías = referencia estable, evita re-disparo del
  // useEffect de los hijos en cada render del padre (loop infinito).
  const handleProfileFieldsChange = useCallback(
    (updates: Partial<IProfileData>) => {
      setUserData((prev) => (prev ? { ...prev, ...updates } : prev));
    },
    [],
  );

  const handleTipClick = (field: ProfileFieldStatus) => {
    setActiveTab(field.tab);
    // Esperá un tick para que el tab cambie y el campo esté en el DOM.
    setTimeout(() => {
      const el = document.getElementById(field.anchor);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-emerald-400");
        setTimeout(
          () => el.classList.remove("ring-2", "ring-emerald-400"),
          1500,
        );
      }
    }, 80);
  };

  useEffect(() => {
    if (token) {
      fetchUserData(token)
        .then((data) => {
          // Ensure trayectorias is initialized as an array if it doesn't exist
          if (!data.trayectorias || !Array.isArray(data.trayectorias)) {
            // If there's legacy data, convert it to the new format
            if (data.club) {
              data.trayectorias = [
                {
                  club: String(data.club || ""),
                  fechaInicio: String(data.fechaInicio || ""),
                  fechaFinalizacion: String(data.fechaFinalizacion || ""),
                  categoriaEquipo: String(data.categoriaEquipo || ""),
                  nivelCompetencia: String(data.nivelCompetencia || ""),
                  logros: String(data.logros || ""),
                },
              ];
            } else {
              // Initialize with empty array if no legacy data
              data.trayectorias = [];
            }
          } else {
            // Ensure each property is properly formatted. IMPORTANTE: preservar
            // TODOS los campos (país, vínculo al club y liga) — si se dropean acá,
            // al guardar se sobreescriben con vacío y se pierde la liga/el club.
            data.trayectorias = data.trayectorias.map((exp: any) => ({
              club: String(exp.club || ""),
              fechaInicio: String(exp.fechaInicio || ""),
              fechaFinalizacion: String(exp.fechaFinalizacion || ""),
              categoriaEquipo: String(exp.categoriaEquipo || ""),
              nivelCompetencia: String(exp.nivelCompetencia || ""),
              logros: String(exp.logros || ""),
              nacionalidadTrayectoria: exp.nacionalidadTrayectoria ?? "",
              clubPageId: exp.clubPageId,
              clubPageSlug: exp.clubPageSlug,
              clubPageLogo: exp.clubPageLogo,
              liga: exp.liga ?? "",
              ligaPageId: exp.ligaPageId,
              ligaPageSlug: exp.ligaPageSlug,
            }));
          }
          setUserData(data);
        })
        .catch(() => setError("Error al cargar los datos."));
    }
  }, [token]);

  // Sync userData con cambios del contexto global (ej: subida de CV / avatar
  // hace setUser({ ..., cv: url })). Sin esto, la barra de progreso solo
  // refresca al hacer F5.
  useEffect(() => {
    if (!user || !userData) return;
    const u = user as unknown as { cv?: string; imgUrl?: string };
    setUserData((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        cv: u.cv ?? prev.cv,
        imgUrl: u.imgUrl ?? prev.imgUrl,
      };
      if (next.cv === prev.cv && next.imgUrl === prev.imgUrl) return prev;
      return next;
    });
    // Solo me interesa reaccionar a cv/imgUrl que son los que actualizamos
    // post-upload desde el contexto global.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(user as unknown as { cv?: string })?.cv, (user as unknown as { imgUrl?: string })?.imgUrl]);

  return (
    <div>
      {" "}
      {/* Reducir el margen superior */}
      <div className="w-full px-2 md:px-4 lg:max-w-6xl lg:mx-auto">
        {" "}
        {/* Reducir el padding */}
        {userData && (
          <div className="mb-4">
            <ProfileProgressBar
              profile={userData}
              onTipClick={handleTipClick}
            />
          </div>
        )}
        {/* Pestañas */}
        <div className="flex gap-3 mt-4 mb-6">
          {" "}
          {/* Reducir el espacio y márgenes */}
          {
[
  {
    key: "Personal",
    label: getText("Personal", "personal"),
    icon: FaUser,
  },
  {
    key: "Profesional",
    label: getText("Profesional", "professional"),
    icon: FaTrophy,
  },
]
            .map((tab) => (
            <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 ${
             activeTab === tab.key
               ? "bg-[#1d5126] text-white shadow-md"
               : "bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-[#1d5126]"
           }`}
         >
          <tab.icon size={18} />
         <span className="font-medium">{tab.label}</span>
        </button>
          ))}
        </div>
        {/* Contenido de cada pestaña */}
        {activeTab === "Personal" && userData && (
          <PersonalInfo profileData={userData} onProfileChange={handleProfileFieldsChange} />
        )}
        {activeTab === "Profesional" && userData && (
          <ProfessionalInfo profileData={userData} onProfileChange={handleProfileFieldsChange} />
        )}
        {error && <p className="text-red-600 mt-2">{error}</p>}{" "}
        {/* Reducir el margen inferior del error */}
      </div>
    </div>
  );
};

export default Profile;
