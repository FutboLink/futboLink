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
  const [fetchedProfileData, setFetchedProfileData] =
    useState<IProfileData | null>(null);
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

  // Si el user tiene videoUrl legacy y videoUrls está vacío, lo subimos al
  // array nuevo para que aparezca en los 3 inputs de "Videos".
  useEffect(() => {
    if (!fetchedProfileData) return;
    const legacy = fetchedProfileData.videoUrl?.trim();
    const arr = fetchedProfileData.videoUrls ?? [];
    if (legacy && arr.length === 0) {
      setFetchedProfileData((prev) =>
        prev ? { ...prev, videoUrls: [legacy] } : prev,
      );
    }
  }, [fetchedProfileData?.videoUrl, fetchedProfileData?.videoUrls?.length]);

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
    <div className="p-2 border border-gray-300 shadow-sm rounded-lg">
      <h2 className="text-sm font-semibold mt-2 text-center p-2 bg-gray-100 text-gray-700">
        {getText("Información Personal", "personalInformation")}
      </h2>
      {loading ? (
        <p>{getText("Cargando los datos...", "loadingData")}</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
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

          {/* Nationality Selector - Fixed version */}
          <div
            id="field-nationality"
            className="flex flex-col sm:col-span-2 rounded-lg p-1 transition-shadow"
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
                className="w-full p-2 border mt-2 rounded text-gray-700 focus:outline-none"
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
          <div id="field-ubicacionActual" className="flex flex-col rounded-lg p-1 transition-shadow">
            <label
              htmlFor="paisProfile"
              className="text-gray-700 font-semibold text-sm"
            >
              {getText("País de Residencia", "countryOfResidence")}:
            </label>
            <input
              id="paisProfile"
              name="ubicacionActual"
              type="text"
              value={fetchedProfileData?.ubicacionActual || ""}
              onChange={handleChange}
              placeholder={getText("País de Residencia", "countryOfResidence")}
              className="w-full p-1.5 border rounded mt-2 text-gray-700 focus:outline-none"
            />
          </div>

          {/* Segunda nacionalidad (toggle + select + UE) */}
          <div id="field-secondNationality" className="sm:col-span-2 flex flex-col gap-2 rounded-lg p-1 transition-shadow">
            <span className="text-gray-700 font-semibold text-sm">
              {getText("¿Tenés segunda nacionalidad?", "hasSecondNationality")}
            </span>
            <div className="flex gap-4 text-sm text-gray-700">
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  name="hasSecondNationality"
                  checked={hasSecondNationality}
                  onChange={() => setHasSecondNationality(true)}
                />
                {getText("Sí", "yes")}
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  name="hasSecondNationality"
                  checked={!hasSecondNationality}
                  onChange={() => {
                    setHasSecondNationality(false);
                    setFetchedProfileData((prev) =>
                      prev
                        ? {
                            ...prev,
                            secondNationality: "",
                          }
                        : prev,
                    );
                  }}
                />
                {getText("No", "no")}
              </label>
            </div>
            {hasSecondNationality && (
              <select
                name="secondNationality"
                value={fetchedProfileData?.secondNationality || ""}
                onChange={handleChange}
                className="w-full p-2 border mt-1 rounded text-gray-700 focus:outline-none"
              >
                <option value="">
                  {getText("Seleccione su nacionalidad", "selectNationality")}
                </option>
                {nationalities &&
                  nationalities.length > 0 &&
                  nationalities.map((nat) => (
                    <option key={nat.value} value={nat.label}>
                      {nat.label}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* Pasaporte UE — pregunta independiente. Aplica a quien tenga ciudadanía
              de un país UE (sea por 1ra o 2da nacionalidad). */}
          <div className="sm:col-span-2 flex flex-col gap-1 rounded-lg p-1 transition-shadow">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={fetchedProfileData?.pasaporteUe === PasaporteUe.SI}
                onChange={(e) =>
                  setFetchedProfileData((prev) =>
                    prev
                      ? {
                          ...prev,
                          pasaporteUe: e.target.checked
                            ? PasaporteUe.SI
                            : PasaporteUe.NO,
                        }
                      : prev,
                  )
                }
              />
              {getText("Tengo Pasaporte UE", "hasEuPassport")}
            </label>
          </div>

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
          {/* Gender */}
          <div className="flex flex-col">
            <label
              htmlFor="genreProfile"
              className="text-gray-700 font-semibold text-sm"
            >
              {getText("Género", "gender")}:
            </label>
            <select
              id="genreProfile"
              name="genre"
              value={fetchedProfileData?.genre || ""}
              onChange={handleChange}
              className="w-full p-1.5 border mt-2 rounded text-gray-700 focus:outline-none"
            >
              <option value="">{getText("Seleccione su género (opcional)", "selectGender")}</option>
              <option value="Masculino">{getText("Masculino", "male")}</option>
              <option value="Femenino">{getText("Femenino", "female")}</option>
              <option value="Otro">{getText("Otro", "other")}</option>
            </select>
          </div>

          {/* Birthdate */}
          <div id="field-birthday" className="flex flex-col sm:flex-row sm:gap-4 sm:col-span-2 rounded-lg p-1 transition-shadow">
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
                className="w-full p-1.5 border rounded mt-2 text-gray-700 focus:outline-none"
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
