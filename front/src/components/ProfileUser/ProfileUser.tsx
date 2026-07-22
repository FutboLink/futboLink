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
  <div className="max-w-7xl mx-auto px-4">
    {activeTab === "Profesional" ? (
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Columna izquierda */}
        <div>
          {userData && (
            <div className="mb-4">
              <ProfileProgressBar
                profile={userData}
                onTipClick={handleTipClick}
              />
            </div>
          )}

          {/* Pestañas */}
          <div className="flex space-x-3 border-b pb-1 mt-2 mb-3 text-gray-700">
            {[
              { key: "Personal", label: getText("Personal", "personal") },
              {
                key: "Profesional",
                label: getText("Profesional", "professional"),
              },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`py-1.5 px-3 mt-6 ${
                  activeTab === tab.key
                    ? "bg-green-300 shadow-md font-semibold"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "Personal" && userData && (
            <PersonalInfo
              profileData={userData}
              onProfileChange={handleProfileFieldsChange}
            />
          )}

          {activeTab === "Profesional" && userData && (
            <ProfessionalInfo
              profileData={userData}
              onProfileChange={handleProfileFieldsChange}
            />
          )}

          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>

        {/* Columna derecha */}
        <aside className="hidden xl:block sticky top-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold text-[#1d5126] mb-3">
              ⭐ Destacá tu trayectoria
            </h3>

            <p className="text-sm text-gray-600 mb-5">
              Agregá los escudos oficiales de los clubes donde jugaste y hacé
              que tu perfil sea más profesional.
            </p>

            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li>✔ Logos oficiales</li>
              <li>✔ Perfil más profesional</li>
              <li>✔ Mayor credibilidad</li>
              <li>✔ Pago único</li>
            </ul>

            <button
              className="w-full bg-[#1d5126] hover:bg-[#143a1b] text-white font-semibold py-3 rounded-xl transition"
            >
              Activar ahora
            </button>
          </div>
        </aside>
      </div>
    ) : (
      <>
        {userData && (
          <div className="mb-4">
            <ProfileProgressBar
              profile={userData}
              onTipClick={handleTipClick}
            />
          </div>
        )}

        {/* Pestañas */}
        <div className="flex space-x-3 border-b pb-1 mt-2 mb-3 text-gray-700">
          {[
            { key: "Personal", label: getText("Personal", "personal") },
            {
              key: "Profesional",
              label: getText("Profesional", "professional"),
            },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`py-1.5 px-3 mt-6 ${
                activeTab === tab.key
                  ? "bg-green-300 shadow-md font-semibold"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "Personal" && userData && (
          <PersonalInfo
            profileData={userData}
            onProfileChange={handleProfileFieldsChange}
          />
        )}

        {activeTab === "Profesional" && userData && (
          <ProfessionalInfo
            profileData={userData}
            onProfileChange={handleProfileFieldsChange}
          />
        )}

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </>
    )}
  </div>
);
};

export default Profile;
