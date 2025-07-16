"use client";
import { useState, useEffect, useContext } from "react";
import { IProfileData } from "@/Interfaces/IUser";
import {
  fetchUserData,
  updateUserData,
} from "../Fetchs/UsersFetchs/UserFetchs";
import { UserContext } from "../Context/UserContext";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import useNationalities from "../Forms/FormUser/useNationalitys";
import ImageUpload from "../Cloudinary/ImageUpload";
import Image from "next/image";

const PersonalInfo: React.FC<{ profileData: IProfileData }> = () => {
  const { token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedProfileData, setFetchedProfileData] =
    useState<IProfileData | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
          setFetchedProfileData(data); // Ensure socialMedia data is included here
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (fetchedProfileData) {
      const { name, value } = e.target;

      // Verificar si el nombre del campo pertenece a socialMedia
      if (["transfermarkt", "x", "youtube"].includes(name)) {
        setFetchedProfileData({
          ...fetchedProfileData,
          socialMedia: {
            ...fetchedProfileData.socialMedia,
            [name]: value, // Guardar en el campo correspondiente dentro de socialMedia
          },
        });
      } else {
        // Actualizar propiedades principales que no están dentro de socialMedia
        setFetchedProfileData({
          ...fetchedProfileData,
          [name]: value, // Guardar directamente en el campo correspondiente del objeto principal
        });
      }
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setFetchedProfileData((prev) => ({
      ...prev!,
      imgUrl: imageUrl, // Actualizar la URL de la imagen en fetchedProfileData
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!token || !fetchedProfileData) return;

    setLoading(true);
    setError(null);

    try {
      const userId = JSON.parse(atob(token.split(".")[1])).id;
      await updateUserData(userId, fetchedProfileData);
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
      {" "}
      {/* Reducir padding */}
      <h2 className="text-sm font-semibold mt-2 text-center p-2 bg-gray-100 text-gray-700">
        Información Personal
      </h2>
      {loading ? (
        <p>Cargando los datos...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          {" "}
          {/* Reducir gap entre los inputs */}
          {/* Name */}
          <div className="flex flex-col">
            <input
              name="name"
              type="text"
              value={fetchedProfileData?.name || ""}
              readOnly
              placeholder="Nombre"
              className="w-full p-1.5 border rounded text-gray-700 bg-gray-100 cursor-not-allowed focus:outline-none"
            />
          </div>
          {/* Last Name */}
          <div className="flex flex-col">
            <input
              name="lastname"
              type="text"
              value={fetchedProfileData?.lastname || ""}
              readOnly
              placeholder="Apellido"
              className="w-full p-1.5 border rounded text-gray-700 bg-gray-100 cursor-not-allowed focus:outline-none"
            />
          </div>
          {/* Email */}
          <div className="flex flex-col">
            <input
              name="email"
              type="email"
              value={fetchedProfileData?.email || ""}
              readOnly
              placeholder="Apellido"
              className="w-full p-1.5 border rounded text-gray-700 bg-gray-100 cursor-not-allowed focus:outline-none"
            />
          </div>
          {/* Imagen de perfil (URL) */}
          <div className="sm:col-span-2 flex flex-col items-center">
            <label className="text-gray-700 font-semibold mb-2">
              Subir Imagen
            </label>
            <ImageUpload onUpload={handleImageUpload} />
            {/* Aquí se mostrará la imagen de perfil si existe */}
            {fetchedProfileData?.imgUrl && (
              <div className="mt-4 rounded-full w-24 h-24 overflow-hidden">
                <Image
                  src={fetchedProfileData.imgUrl}
                  alt="Imagen de perfil"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
            )}
          </div>
          {/* Nationality Selector - Fixed version */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold text-sm">
              Nacionalidad:
            </label>
            {nationalitiesLoading ? (
              <p className="text-sm text-gray-500">
                Cargando nacionalidades...
              </p>
            ) : nationalitiesError ? (
              <p className="text-sm text-red-500">{nationalitiesError}</p>
            ) : (
              <select
                name="nationality"
                value={fetchedProfileData?.nationality || ""}
                onChange={handleChange}
                className="w-full p-2 border mt-2 rounded text-gray-700 focus:outline-none"
                size={1}
              >
                <option value="">Seleccione su nacionalidad</option>
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
          {/* Location */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold text-sm">
              Ciudad:
            </label>
            <input
              name="location"
              type="text"
              value={fetchedProfileData?.location || ""}
              onChange={handleChange}
              placeholder="Ubicación"
              className="w-full p-1.5 border rounded mt-2 text-gray-700 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold text-sm">
              País de Residencia:
            </label>
            <input
              name="ubicacionActual"
              type="text"
              value={fetchedProfileData?.ubicacionActual || ""}
              onChange={handleChange}
              placeholder="País de Residencia"
              className="w-full p-1.5 border rounded mt-2 text-gray-700 focus:outline-none"
            />
          </div>
          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold text-sm">
              Teléfono:
            </label>
            <input
              name="phone"
              type="text"
              value={fetchedProfileData?.phone || ""}
              onChange={handleChange}
              placeholder="Teléfono"
              className="w-full p-1.5 border mt-2 rounded text-gray-700 focus:outline-none"
            />
          </div>
          {/* Gender */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold text-sm">
              Género:
            </label>
            <select
              name="genre"
              value={fetchedProfileData?.genre || ""}
              onChange={handleChange}
              className="w-full p-1.5 border mt-2 rounded text-gray-700 focus:outline-none"
            >
              <option value="">Seleccione su género (opcional)</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          {/* Birthdate */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold text-sm">
              Fecha de nacimiento:
            </label>
            <input
              name="birthday"
              type="date"
              value={fetchedProfileData?.birthday || ""}
              onChange={handleChange}
              className="w-full p-1.5 border rounded mt-2 text-gray-400 focus:outline-none"
            />
          </div>
          {/* Age */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold text-sm">Edad:</label>
            <input
              name="age"
              type="text"
              value={fetchedProfileData?.age || ""}
              onChange={handleChange}
              placeholder="Edad"
              className="w-full p-1.5 border rounded mt-2 text-gray-700 focus:outline-none"
            />
          </div>
          {/* Transfermarkt */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold text-sm pl-2">
              Transfermarkt:
            </label>
            <input
              type="text"
              name="transfermarkt"
              value={fetchedProfileData?.socialMedia?.transfermarkt || ""}
              onChange={handleChange}
              placeholder="link de Transfermarkt"
              className="w-full p-1.5 border rounded mt-2 focus:outline-none text-gray-700"
            />
          </div>
          {/* X*/}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold text-sm pl-2">
              X:
            </label>
            <input
              type="text"
              name="x"
              value={fetchedProfileData?.socialMedia?.x || ""}
              onChange={handleChange}
              placeholder="link de X"
              className="w-full p-1.5 border rounded mt-2 focus:outline-none text-gray-700"
            />
          </div>
          {/* Youtube*/}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold text-sm pl-2">
              Youtube:
            </label>
            <input
              type="text"
              name="videoUrl"
              value={fetchedProfileData?.videoUrl || ""}
              onChange={handleChange}
              placeholder="link de Youtube"
              className="w-full p-1.5 border rounded mt-2 focus:outline-none text-gray-700"
            />
          </div>
        </div>
      )}
      {/* Save Button */}
      <button
        onClick={handleSubmit}
        className="mt-3 w-full bg-verde-oscuro text-white p-2 rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar cambios"}
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
