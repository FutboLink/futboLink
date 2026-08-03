"use client";
import { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaFutbol,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaUser,
  FaGlobeAmericas,
  FaPhoneAlt,
  FaPhotoVideo,
  FaMale,
  FaFemale,
  FaUserAlt,
} from "react-icons/fa";
import { useUserContext } from "@/hook/useUserContext";
import { PasaporteUe, UserType, type IProfileData } from "@/Interfaces/IUser";
import ImageUploadwithCrop from "../Cloudinary/ImageUploadWithCrop";
import {
  fetchUserData,
  updateUserData,
} from "../Fetchs/UsersFetchs/UserFetchs";
import useNationalities from "../Forms/FormUser/useNationalitys";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import PhoneNumberInput from "../utils/PhoneNumberInput";
import { useI18nMode } from "../Context/I18nModeContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";

interface PersonalInfoProps {
  profileData: IProfileData;
  onProfileChange?: (updates: Partial<IProfileData>) => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ onProfileChange }) => {
  const { token, setUser } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tCommon = useNextIntlTranslations('common');

  // Función para obtener el texto traducido o el texto original
  const getText = (originalText: string, translatedKey: string) => {
    return isNextIntlEnabled ? tCommon.t(translatedKey) : originalText;
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedProfileData, setFetchedProfileData] = useState<IProfileData | null>(null);
    
  const [activeSection, setActiveSection] = useState("profile");
    
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSocials, setShowSocials] = useState(true);
  const [hasSecondNationality, setHasSecondNationality] = useState(false);
  // Normaliza valores de redes para evitar URLs pre-cargadas
  const normalizeSocialValue = (key: string, value: string): string => {
    const v = (value || "").trim();
    if (!v) return "";
    try {
      if (key === "instagram") {
        return v
          .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
          .replace(/\/$/, "");
      }
      if (key === "facebook") {
        return v
          .replace(/^https?:\/\/(www\.)?facebook\.com\//i, "")
          .replace(/\/$/, "");
      }
      if (key === "tiktok") {
        return v
          .replace(/^https?:\/\/(www\.)?tiktok\.com\/@/i, "")
          .replace(/^@/, "")
          .replace(/\/$/, "");
      }
      if (key === "x" || key === "twitter") {
        return v
          .replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i, "")
          .replace(/^@/, "")
          .replace(/\/$/, "");
      }
      if (key === "transfermarkt") {
        return v
          .replace(/^https?:\/\/([^/]*\.)?transfermarkt\.[^/]+\//i, "")
          .replace(/\/$/, "");
      }
      return v;
    } catch {
      return v;
    }
  };


  // Nationality related state
  const {
    nationalities,
    loading: nationalitiesLoading,
    error: nationalitiesError,
  } = useNationalities();

  // Debug nationalities
  useEffect(() => {
    console.log("Nationalities loaded:", nationalities);
    console.log("Nationalities loading:", nationalitiesLoading);
    console.log("Nationalities error:", nationalitiesError);
  }, [nationalities, nationalitiesLoading, nationalitiesError]);

  // Fetch user data when token changes
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchUserData(token)
        .then((data) => {
          // Normalizar sociales para no mostrar URLs completas
          if (data?.socialMedia) {
            const cleaned: Record<string, string> = {};
            Object.entries(data.socialMedia).forEach(([k, val]) => {
              cleaned[k] = normalizeSocialValue(k, String(val || ""));
            });
            data.socialMedia = cleaned as any;
          }
          setFetchedProfileData(data);
        })
        .catch((err) => {
          console.error("Error al cargar los datos:", err);
          setError("Error al cargar los datos.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token]);

  useEffect(() => {
    if (fetchedProfileData?.secondNationality) {
      setHasSecondNationality(true);
    }
  }, [fetchedProfileData?.secondNationality]);

  // El campo legacy `videoUrl` ya no se usa: la migración de backend movió su
  // valor a `videoUrls`. Acá solo trabajamos con los 3 slots de `videoUrls`.

  // Mantiene `age` derivada de `birthday` aunque la DB no la traiga calculada.
  useEffect(() => {
    if (!fetchedProfileData?.birthday) return;
    const birthDate = new Date(fetchedProfileData.birthday);
    if (Number.isNaN(birthDate.getTime())) return;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    const ageStr = age >= 0 ? age.toString() : "";
    if (fetchedProfileData.age !== ageStr) {
      setFetchedProfileData((prev) =>
        prev ? { ...prev, age: ageStr } : prev,
      );
    }
  }, [fetchedProfileData?.birthday]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (fetchedProfileData) {
      const { name, value } = e.target;

      // Verificar si el nombre del campo pertenece a socialMedia
      if (["transfermarkt", "x", "twitter", "youtube", "instagram", "facebook", "tiktok"].includes(name)) {
        setFetchedProfileData({
          ...fetchedProfileData,
          socialMedia: {
            ...fetchedProfileData.socialMedia,
            // No normalizamos mientras se tipea para no borrar el input; se normaliza al guardar
            [name]: value,
          },
        });
      } else {
        const updatedData: IProfileData = {
          ...fetchedProfileData,
          [name]: value, // Guardar directamente en el campo correspondiente del objeto principal
        };

        // Si cambia la fecha de nacimiento, calcular edad
        if (name === "birthday") {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          updatedData.age = age.toString();
        }

        setFetchedProfileData(updatedData);
      }
    }
  };

  // Sync en tiempo real con el padre — cada cambio en fetchedProfileData
  // se propaga para que la barra de progreso recalcule sin necesidad de
  // Guardar ni F5.
  useEffect(() => {
    if (fetchedProfileData) {
      onProfileChange?.(fetchedProfileData);
    }
  }, [fetchedProfileData, onProfileChange]);

  const handleImageUpload = (imageUrl: string) => {
    setFetchedProfileData((prev) => {
      if (!prev) return prev; // Si prev es null, no hacemos nada
      return {
        ...prev,
        imgUrl: imageUrl, // Actualizar la URL de la imagen en fetchedProfileData
      };
    });
    // Sync con contexto global para que la barra de progreso del padre
    // refresque sin necesidad de F5.
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      return { ...prevUser, imgUrl: imageUrl } as typeof prevUser;
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!token || !fetchedProfileData) return;

    // Validación: no permitir subir el mismo link de video en dos slots.
    // Si hay duplicados, abortamos antes de pegarle al backend para evitar
    // que la galería del perfil termine con slides idénticos.
    const videosNorm = (fetchedProfileData.videoUrls ?? [])
      .map((v) => (v ?? "").trim().toLowerCase())
      .filter((v) => v.length > 0);
    if (new Set(videosNorm).size !== videosNorm.length) {
      setErrorMessage(
        getText(
          "No podés cargar dos videos con el mismo link. Quitá los duplicados antes de guardar.",
          "videoDuplicateError",
        ),
      );
      setShowErrorNotification(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Normalizar redes antes de enviar
      const dataToSend: IProfileData = { ...fetchedProfileData } as IProfileData;
      if ((dataToSend as any).socialMedia) {
        const cleaned: Record<string, string> = {};
        Object.entries((dataToSend as any).socialMedia as Record<string, string>).forEach(([k, val]) => {
          cleaned[k] = normalizeSocialValue(k, String(val || ""));
        });
        (dataToSend as any).socialMedia = cleaned;
      }

      // El campo legacy `videoUrl` quedó deprecado: nunca lo enviamos al
      // backend. El video vive solo en `videoUrls`.
      delete (dataToSend as Partial<IProfileData>).videoUrl;

      // Filtrar strings vacíos en los arrays nuevos antes de enviar al backend.
      if (Array.isArray(dataToSend.videoUrls)) {
        dataToSend.videoUrls = dataToSend.videoUrls
          .map((v) => (typeof v === "string" ? v.trim() : ""))
          .filter((v) => v.length > 0);
      }
      if (Array.isArray(dataToSend.photoUrls)) {
        dataToSend.photoUrls = dataToSend.photoUrls
          .map((v) => (typeof v === "string" ? v.trim() : ""))
          .filter((v) => v.length > 0);
      }

      const userId = JSON.parse(atob(token.split(".")[1])).id;
      await updateUserData(userId, dataToSend);

      setUser((prevUser) => {
        if (!prevUser) return prevUser; // Si prevUser es null, no hacemos nada
        return { ...prevUser, ...dataToSend }; // Actualizar la informacion del estado global (imagen,datos,etc)
      });

      setNotificationMessage("Datos actualizados correctamente");
      setShowNotification(true);
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Ocurrió un error."
      );
      setShowErrorNotification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">

  <h2 className="text-2xl font-bold text-[#3d7a26] mb-6">
    {getText("Información Personal", "personalInformation")}
  </h2>
   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

  <button
    type="button"
    onClick={() => setActiveSection("profile")}
    className={`rounded-2xl p-5 text-left transition-all ${
activeSection === "profile"
  ? "border-2 border-[#3d7a26] bg-[#f2f8ef] shadow-md"
  : "border border-gray-200 bg-white shadow-sm hover:shadow-md"
    }`}
  >
    <div className="text-[#3d7a26] mb-3">
  <FaUser size={34} />
</div>
    <h3 className="font-semibold text-gray-900">
      Perfil
    </h3>
    <p className="text-sm text-gray-500 mt-1">
      Foto y datos básicos
      </p>
  </button>

  <button
    type="button"
    onClick={() => setActiveSection("personal")}
    className={`rounded-2xl p-5 text-left transition-all ${
      activeSection === "personal"
        ? "border-2 border-[#3d7a26] bg-[#f2f8ef] shadow-md"
        : "border border-gray-200 bg-white shadow-sm hover:shadow-md"
    }`}
  >
    <div className="text-[#3d7a26] mb-3">
  <FaGlobeAmericas size={34} />
</div>
    <h3 className="font-semibold text-gray-900">
    Información
    </h3>
    <p className="text-sm text-gray-500 mt-1">
    Datos personales
    </p> 
  </button>

  <button
    type="button"
    onClick={() => setActiveSection("contact")}
    className={`rounded-2xl p-5 text-left transition-all ${
      activeSection === "contact"
        ? "border-2 border-[#3d7a26] bg-[#f2f8ef] shadow-md"
        : "border border-gray-200 bg-white shadow-sm hover:shadow-md"
    }`}
  >
    <div className="text-[#3d7a26] mb-3">
  <FaPhoneAlt size={34} />
</div>
    <h3 className="font-semibold text-gray-900">
    Contacto
    </h3>
    <p className="text-sm text-gray-500 mt-1">
    Teléfono y redes
      </p>  
  </button>

  <button
    type="button"
    onClick={() => setActiveSection("multimedia")}
    className={`rounded-2xl p-5 text-left transition-all ${
      activeSection === "multimedia"
        ? "border-2 border-[#3d7a26] bg-[#f2f8ef] shadow-md"
        : "border border-gray-200 bg-white shadow-sm hover:shadow-md"
    }`}
  >
    <div className="text-[#3d7a26] mb-3">
  <FaPhotoVideo size={34} />
</div>
    <h3 className="font-semibold text-gray-900">
      Multimedia
      </h3>
    <p className="text-sm text-gray-500 mt-1">
      Videos y fotos
      </p>
  </button>

</div>   
      {loading ? (
        <p>{getText("Cargando los datos...", "loadingData")}</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <div className="p-6 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* ============================================================
                                      PERFIL
           ============================================================ */}
         {activeSection === "profile" && (
          <>
           {/* Imagen de perfil (URL) */}
          <div
            id="field-imgUrl"
            className="sm:col-span-2 flex flex-col items-center rounded-lg p-1 transition-shadow"
          >
            <ImageUploadwithCrop
              initialImage={fetchedProfileData?.imgUrl}
              onUpload={handleImageUpload}
              onRemove={() =>
                setFetchedProfileData((prev) => {
                  if (!prev) return prev; // Si prevUser es null, no hacemos nada
                  return { ...prev, imgUrl: "" };
                })
              }
            />
          </div>

          {/* Name */}
          <input
            name="name"
            type="text"
            value={fetchedProfileData?.name || ""}
            onChange={handleChange}
            placeholder={getText("Nombre", "name")}
            className="w-full p-1.5 border rounded text-gray-700 focus:outline-none"
          />

          {/* Last name */}
          <input
            name="lastname"
            type="text"
            value={fetchedProfileData?.lastname || ""}
            onChange={handleChange}
            placeholder={getText("Apellido", "lastname")}
            className="w-full p-1.5 border rounded text-gray-700 focus:outline-none"
          />

          {/* Email */}
          <div className="flex flex-col sm:col-span-2">
            <label
              htmlFor="emailProfile"
              className="text-gray-700 font-semibold text-sm"
            >
              {getText("Email", "email")}:
            </label>
            <input
              name="email"
              id="emailProfile"
              type="email"
              value={fetchedProfileData?.email || ""}
              readOnly
              placeholder={getText("Email", "email")}
              className="w-full p-1.5 border rounded mt-2 text-gray-700 bg-gray-100 cursor-not-allowed focus:outline-none"
            />
          </div>
         </>
        )} 
        {/* ============================================================
                             INFORMACIÓN PERSONALL
         ============================================================ */}
          {activeSection === "personal" && (
            <>
              <div className="sm:col-span-2 mb-3">
  <h3 className="text-lg font-semibold text-gray-900">
    Identidad
  </h3>

  <p className="text-sm text-gray-500 mt-1">
    Ciudadanía y documentación del jugador.
  </p>

  <div className="mt-4 border-b border-gray-200"></div>
</div>
          {/* Nationality Selector - Fixed version */}
          <div
            id="field-nationality"
            className="flex flex-col rounded-lg p-1 transition-shadow"
          >
            <label
              htmlFor="nationalitiesProfile"
              className="text-gray-700 font-semibold text-sm"
            >
              {getText("Nacionalidad", "nationality")}:
            </label>
            {nationalitiesLoading ? (
              <p className="text-sm text-gray-500">
                {getText("Cargando nacionalidades...", "loadingNationalities")}
              </p>
            ) : nationalitiesError ? (
              <p className="text-sm text-red-500">{nationalitiesError}</p>
            ) : (
              <select
                id="nationalityesProfile"
                name="nationality"
                value={fetchedProfileData?.nationality || ""}
                onChange={handleChange}
                className="w-full mt-2 h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
              >
                <option value="">{getText("Seleccione su nacionalidad", "selectNationality")}</option>
                {nationalities &&
                  nationalities.length > 0 &&
                  nationalities.map((nationality) => (
                    <option key={nationality.value} value={nationality.label}>
                      {nationality.label}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* País de residencia */}
<div
  id="field-ubicacionActual"
  className="flex flex-col rounded-lg p-1 transition-shadow"
>
  <label
    htmlFor="countryProfile"
    className="text-gray-700 font-semibold text-sm"
  >
    {getText("País de Residencia", "countryOfResidence")}:
  </label>

  <select
    id="countryProfile"
    name="ubicacionActual"
    value={fetchedProfileData?.ubicacionActual || ""}
    onChange={handleChange}
    className="w-full mt-2 h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
  >
    <option value="">
      {getText(
        "Seleccione su país de residencia",
        "countryOfResidence"
      )}
    </option>

    {nationalities?.map((country) => (
      <option
        key={country.value}
        value={country.label}
      >
        {country.label}
      </option>
    ))}
  </select>
</div>

          {/* Segunda nacionalidad + Pasaporte UE */}
<div className="sm:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">

  {/* Segunda nacionalidad */}
  <div className="flex flex-col gap-2 rounded-lg p-1 transition-shadow">
    <span className="text-gray-700 font-semibold text-sm">
      {getText("¿Tenés segunda nacionalidad?", "hasSecondNationality")}
    </span>

    <div className="grid grid-cols-2 gap-3">

      <button
        type="button"
        onClick={() => setHasSecondNationality(true)}
        className={`rounded-2xl border p-4 transition-all duration-200 ${
          hasSecondNationality
            ? "border-[#3d7a26] bg-[#f2f8ef] shadow-md"
            : "border-gray-200 hover:border-[#3d7a26] hover:shadow-sm"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <FaUser
            size={24}
            className={
              hasSecondNationality
                ? "text-[#3d7a26]"
                : "text-gray-500"
            }
          />

          <span className="font-medium">
            {getText("Sí", "yes")}
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => {
          setHasSecondNationality(false);

          setFetchedProfileData((prev) =>
            prev
              ? {
                  ...prev,
                  secondNationality: "",
                }
              : prev
          );
        }}
        className={`rounded-2xl border p-4 transition-all duration-200 ${
          !hasSecondNationality
            ? "border-[#3d7a26] bg-[#f2f8ef] shadow-md"
            : "border-gray-200 hover:border-[#3d7a26] hover:shadow-sm"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <FaUserAlt
            size={24}
            className={
              !hasSecondNationality
                ? "text-[#3d7a26]"
                : "text-gray-500"
            }
          />

          <span className="font-medium">
            {getText("No", "no")}
          </span>
        </div>
      </button>

    </div>
  </div>

  {/* Pasaporte UE */}
  <div className="pt-8">
    <button
      type="button"
      onClick={() =>
        setFetchedProfileData((prev) =>
          prev
            ? {
                ...prev,
                pasaporteUe:
                  prev.pasaporteUe === PasaporteUe.SI
                    ? PasaporteUe.NO
                    : PasaporteUe.SI,
              }
            : prev
        )
      }
      className={`w-full rounded-2xl border p-5 transition-all duration-200 ${
        fetchedProfileData?.pasaporteUe === PasaporteUe.SI
          ? "border-[#3d7a26] bg-[#f2f8ef] shadow-md"
          : "border-gray-200 hover:border-[#3d7a26] hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
              fetchedProfileData?.pasaporteUe === PasaporteUe.SI
                ? "bg-[#3d7a26] text-white"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            EU
          </div>

          <div className="text-left">
            <p className="font-semibold text-gray-900">
              {getText("Pasaporte UE", "hasEuPassport")}
            </p>

            <p className="text-sm text-gray-500">
              Ciudadanía UE
            </p>
          </div>

        </div>

      </div>
    </button>
  </div>

  {/* Selector */}
  <div>
    {hasSecondNationality && (
      <>
        <label className="text-gray-700 font-semibold text-sm">
          {getText("Segunda nacionalidad", "secondNationality")}
        </label>

        <select
          name="secondNationality"
          value={fetchedProfileData?.secondNationality || ""}
          onChange={handleChange}
          className="w-full mt-2 h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
        >
          <option value="">
            {getText("Seleccione su nacionalidad", "selectNationality")}
          </option>

          {nationalities?.map((nat) => (
            <option
              key={nat.value}
              value={nat.label}
            >
              {nat.label}
            </option>
          ))}
        </select>
      </>
    )}
  </div>

</div>
              <div className="sm:col-span-2 mt-8 mb-3">
  <h3 className="text-lg font-semibold text-gray-900">
    Datos personales
  </h3>

  <p className="text-sm text-gray-500 mt-1">
    Información básica del jugador.
  </p>

  <div className="mt-4 border-b border-gray-200"></div>
</div>
               {/* Gender */}
<div className="flex flex-col sm:col-span-2">
  <label className="text-gray-700 font-semibold text-sm mb-3">
    {getText("Género", "gender")}:
  </label>

  <div className="grid grid-cols-3 gap-3">

    <button
      type="button"
      onClick={() =>
        handleChange({
          target: {
            name: "genre",
            value: "Masculino",
          },
        } as React.ChangeEvent<HTMLSelectElement>)
      }
      className={`rounded-2xl border p-4 transition-all duration-200 ${
        fetchedProfileData?.genre === "Masculino"
          ? "border-[#3d7a26] bg-[#f2f8ef] shadow-md"
          : "border-gray-200 hover:border-[#3d7a26] hover:shadow-sm"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <FaMale
          size={28}
          className={
            fetchedProfileData?.genre === "Masculino"
              ? "text-[#3d7a26]"
              : "text-gray-500"
          }
        />

        <span className="font-medium">
          {getText("Masculino", "male")}
        </span>
      </div>
    </button>

    <button
      type="button"
      onClick={() =>
        handleChange({
          target: {
            name: "genre",
            value: "Femenino",
          },
        } as React.ChangeEvent<HTMLSelectElement>)
      }
      className={`rounded-2xl border p-4 transition-all duration-200 ${
        fetchedProfileData?.genre === "Femenino"
          ? "border-[#3d7a26] bg-[#f2f8ef] shadow-md"
          : "border-gray-200 hover:border-[#3d7a26] hover:shadow-sm"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <FaFemale
          size={28}
          className={
            fetchedProfileData?.genre === "Femenino"
              ? "text-[#3d7a26]"
              : "text-gray-500"
          }
        />

        <span className="font-medium">
          {getText("Femenino", "female")}
        </span>
      </div>
    </button>

    <button
      type="button"
      onClick={() =>
        handleChange({
          target: {
            name: "genre",
            value: "Otro",
          },
        } as React.ChangeEvent<HTMLSelectElement>)
      }
      className={`rounded-2xl border p-4 transition-all duration-200 ${
        fetchedProfileData?.genre === "Otro"
          ? "border-[#3d7a26] bg-[#f2f8ef] shadow-md"
          : "border-gray-200 hover:border-[#3d7a26] hover:shadow-sm"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <FaUserAlt
          size={28}
          className={
            fetchedProfileData?.genre === "Otro"
              ? "text-[#3d7a26]"
              : "text-gray-500"
          }
        />

        <span className="font-medium">
          {getText("Otro", "other")}
        </span>
      </div>
    </button>

  </div>
</div>
          
{/* Birthdate */}
          <div id="field-birthday" 
            className="flex flex-col sm:flex-row sm:gap-4 sm:col-span-2 rounded-lg p-1 transition-shadow">
            <div className="flex flex-col w-full sm:w-1/2">
              <label
                htmlFor="birthdayProfile"
                className="text-gray-700 font-semibold text-sm"
              >
                {getText("Fecha de nacimiento", "birthdate")}:
              </label>
              <input
                id="birthdayProfile"
                name="birthday"
                type="date"
                value={fetchedProfileData?.birthday || ""}
                max={new Date().toISOString().split("T")[0]} // No permite fechas futuras
                onChange={handleChange}
                className="w-full mt-2 h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3d7a26]/20 focus:border-[#3d7a26]"
              />
            </div>

            {/* Age (calculada automáticamente) */}
            <div className="flex flex-col w-full sm:w-1/2 mt-2 sm:mt-0">
              <label
                htmlFor="ageProfile"
                className="text-gray-700 font-semibold text-sm"
              >
                {getText("Edad", "age")}:
              </label>
              <input
                id="ageProfile"
                name="age"
                type="text"
                value={fetchedProfileData?.age || ""}
                readOnly
                className="w-full p-1.5 border rounded mt-2 text-gray-700 bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>
         </>
        )}
         {/* ============================================================
                                     CONTACTO
          ============================================================ */}
          {activeSection === "contact" && (
           <>
          {/* Phone */}
          <div id="field-phone" className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg p-1 transition-shadow">
            <PhoneNumberInput
              mode="edit"
              name="phone"
              label={getText("Teléfono", "phone") + ":"}
              value={fetchedProfileData?.phone}
              onChange={handleChange}
              className="p-1.5 border rounded mt-2 text-gray-700 focus:outline-none"
            />
            {/* Agente o Representante */}
            {fetchedProfileData?.role === UserType.PLAYER && (
              <div className="flex flex-col">
                <label
                  htmlFor="nameAgencyProfile"
                  className="text-gray-700 font-semibold text-sm"
                >
                  {getText("Agente o Representante", "agentOrRepresentative")}:
                </label>
                <input
                  id="nameAgencyProfile"
                  name="nameAgency"
                  type="text"
                  value={fetchedProfileData?.nameAgency || ""}
                  onChange={handleChange}
                  placeholder={getText("Nombre del agente o representante", "agentName")}
                  className="p-1.5 border rounded mt-2 text-gray-700 focus:outline-none"
                />
              </div>
            )}
          </div>
             
          {/* Header redes sociales — título + descripción + toggle sutil */}
          <div id="field-socialMedia" className="sm:col-span-2 rounded-lg p-1 transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <h3 className="text-gray-800 font-semibold text-base">
                  {getText("Redes sociales y enlaces", "socialNetworksTitle")}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {getText(
                    "Agregá tus perfiles para que reclutadores y clubes te encuentren más fácil.",
                    "socialNetworksHint",
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSocials(!showSocials)}
                className="flex items-center gap-1 text-xs text-verde-oscuro hover:underline whitespace-nowrap shrink-0 mt-1"
              >
                {showSocials
                  ? getText("Ocultar", "hide")
                  : getText("Mostrar", "show")}
                <span
                  className={`transition-transform duration-300 ${
                    showSocials ? "rotate-180" : "rotate-0"
                  }`}
                >
                  {showSocials ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
            </div>
          </div>

          {showSocials && (
            <div className="sm:col-span-2 bg-verde-claro/10 border border-verde-claro p-3 rounded shadow-inner transition-all duration-300 ease-in-out">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Transfermarkt */}
                <div className="flex flex-col">
                  <label
                    htmlFor="transfermarktProfile"
                    className="text-gray-700 font-semibold text-sm flex items-center gap-1"
                  >
                    <FaFutbol className="text-blue-700" /> Transfermarkt:
                  </label>
                  <input
                    type="text"
                    id="transfermarktProfile"
                    name="transfermarkt"
                    value={fetchedProfileData?.socialMedia?.transfermarkt || ""}
                    onChange={handleChange}
                    placeholder={getText("link de Transfermarkt", "transfermarktLink")}
                    className="w-full p-1.5 border rounded mt-2 focus:outline-none text-gray-700"
                  />
                </div>
                {/* X */}
                <div className="flex flex-col">
                  <label
                    htmlFor="twitterProfile"
                    className="text-gray-700 font-semibold text-sm flex items-center gap-1"
                  >
                    <FaTwitter className="text-blue-500" /> X:
                  </label>
                  <input
                    id="twitterProfile"
                    type="text"
                    name="x"
                    value={fetchedProfileData?.socialMedia?.x || ""}
                    onChange={handleChange}
                    placeholder={getText("link de X", "xLink")}
                    className="w-full p-1.5 border rounded mt-2 focus:outline-none text-gray-700"
                  />
                </div>
                {/* Youtube */}
                <div className="flex flex-col">
                  <label
                    htmlFor="youtubeProfile"
                    className="text-gray-700 font-semibold text-sm flex items-center gap-1"
                  >
                    <FaYoutube className="text-red-600" /> Youtube:
                  </label>
                  <input
                    id="youtubeProfile"
                    type="text"
                    name="youtube"
                    value={fetchedProfileData?.socialMedia?.youtube || ""}
                    onChange={handleChange}
                    placeholder={getText("link de Youtube", "youtubeLink")}
                    className="w-full p-1.5 border rounded mt-2 focus:outline-none text-gray-700"
                  />
                </div>
                {/* Instagram */}
                <div className="flex flex-col">
                  <label
                    htmlFor="instagramProfile"
                    className="text-gray-700 font-semibold text-sm flex items-center gap-1"
                  >
                    <FaInstagram className="text-pink-600" /> Instagram:
                  </label>
                  <input
                    id="instagramProfile"
                    type="text"
                    name="instagram"
                    value={fetchedProfileData?.socialMedia?.instagram || ""}
                    onChange={handleChange}
                    placeholder={getText("usuario de Instagram", "instagramLink")}
                    className="w-full p-1.5 border rounded mt-2 focus:outline-none text-gray-700"
                  />
                </div>
                {/* Facebook */}
                <div className="flex flex-col">
                  <label
                    htmlFor="facebookProfile"
                    className="text-gray-700 font-semibold text-sm flex items-center gap-1"
                  >
                    <FaFacebook className="text-blue-600" /> Facebook:
                  </label>
                  <input
                    id="facebookProfile"
                    type="text"
                    name="facebook"
                    value={fetchedProfileData?.socialMedia?.facebook || ""}
                    onChange={handleChange}
                    placeholder={getText("usuario de Facebook", "facebookLink")}
                    className="w-full p-1.5 border rounded mt-2 focus:outline-none text-gray-700"
                  />
                </div>
                {/* TikTok */}
                <div className="flex flex-col">
                  <label
                    htmlFor="tiktokProfile"
                    className="text-gray-700 font-semibold text-sm flex items-center gap-1"
                  >
                    <FaTiktok className="text-black" /> TikTok:
                  </label>
                  <input
                    id="tiktokProfile"
                    type="text"
                    name="tiktok"
                    value={fetchedProfileData?.socialMedia?.tiktok || ""}
                    onChange={handleChange}
                    placeholder={getText("usuario de TikTok", "tiktokLink")}
                    className="w-full p-1.5 border rounded mt-2 focus:outline-none text-gray-700"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
{/* ============================================================
                      MULTIMEDIA
============================================================ */}
          {activeSection === "multimedia" && (
            <>
          {/* Videos (hasta 3) */}
          <div id="field-videoUrl" className="sm:col-span-2 flex flex-col gap-2 mt-2 rounded-lg p-1 transition-shadow">
            <span className="text-gray-700 font-semibold text-sm">
              {getText("Videos de YouTube (hasta 3)", "videosTitle")}
            </span>
            <p className="text-xs text-gray-500">
              {getText(
                "Tip: copiá y pegá el link de YouTube. No subas el archivo.",
                "videosHint",
              )}
            </p>
            {(() => {
              // Validación: marcar como duplicado los inputs cuya URL ya
              // aparece en otro slot (case-insensitive, ignorando espacios).
              // El primer slot que tenga una URL queda OK; los siguientes con
              // la misma URL salen con borde rojo y mensaje.
              const slots = [0, 1, 2].map(
                (idx) => (fetchedProfileData?.videoUrls?.[idx] ?? "").trim().toLowerCase(),
              );
              const isDuplicate = (idx: number) => {
                const v = slots[idx];
                if (!v) return false;
                return slots.findIndex((s) => s === v) !== idx;
              };
              return [0, 1, 2].map((idx) => {
                const current = fetchedProfileData?.videoUrls?.[idx] ?? "";
                const dup = isDuplicate(idx);
                return (
                  <div key={`video-${idx}`} className="flex flex-col gap-1">
                    <input
                      type="url"
                      value={current}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFetchedProfileData((prev) => {
                          if (!prev) return prev;
                          const arr = [...(prev.videoUrls ?? [])];
                          while (arr.length <= idx) arr.push("");
                          arr[idx] = value;
                          return { ...prev, videoUrls: arr };
                        });
                      }}
                      placeholder={`https://youtu.be/... (${idx + 1})`}
                      className={`w-full p-1.5 border rounded text-gray-700 focus:outline-none ${
                        dup
                          ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
                          : ""
                      }`}
                      aria-invalid={dup}
                    />
                    {dup && (
                      <span className="text-xs text-red-600">
                        {getText(
                          "Este video ya está cargado en otro slot.",
                          "videoDuplicate",
                        )}
                      </span>
                    )}
                  </div>
                );
              });
            })()}
          </div>

          {/* Fotos (hasta 3) */}
          <div id="field-photoUrls" className="sm:col-span-2 flex flex-col gap-2 mt-2 rounded-lg p-1 transition-shadow">
            <span className="text-gray-700 font-semibold text-sm">
              {getText("Fotos extra (hasta 3)", "photosTitle")}
            </span>
            <p className="text-xs text-gray-500">
              {getText(
                "Si no tenés video, sumá fotos para mejorar tu perfil.",
                "photosHint",
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[0, 1, 2].map((idx) => {
                const url = fetchedProfileData?.photoUrls?.[idx] ?? "";
                return (
                  <div
                    key={`photo-${idx}`}
                    className="border border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center"
                  >
                    <ImageUploadwithCrop
                      initialImage={url || undefined}
                      onUpload={(uploaded) => {
                        setFetchedProfileData((prev) => {
                          if (!prev) return prev;
                          const arr = [...(prev.photoUrls ?? [])];
                          while (arr.length <= idx) arr.push("");
                          arr[idx] = uploaded;
                          return { ...prev, photoUrls: arr };
                        });
                      }}
                      onRemove={() => {
                        setFetchedProfileData((prev) => {
                          if (!prev) return prev;
                          const arr = [...(prev.photoUrls ?? [])];
                          arr[idx] = "";
                          return { ...prev, photoUrls: arr };
                        });
                      }}
                      fileInputId={`photo-upload-${idx}`}
                      label={getText(`Foto ${idx + 1}`, `photoSlot`)}
                      buttonLabel={getText("Subir", "uploadShort")}
                      cropShape="rect"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
          </div>
        </div>
      </div>
    )}
      {/* Save Button */}
      <button
        onClick={handleSubmit}
        type="submit"
        className="mt-3 w-full bg-verde-oscuro text-white p-2 rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? getText("Guardando...", "saving") : getText("Guardar cambios", "saveChanges")}
      </button>
      {/* Error Notification */}
      {showErrorNotification && (
        <div className="absolute top-20 left-0 right-0 mx-auto w-max bg-red-600 text-white p-2 rounded-md">
          <p>{errorMessage}</p>
        </div>
      )}
      {/* Success Notification */}
      {showNotification && (
        <div className="absolute top-10 left-0 right-0 mx-auto w-max">
          <NotificationsForms message={notificationMessage} />
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;
