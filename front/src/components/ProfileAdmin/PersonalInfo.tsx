"use client";
import { useState, useEffect, useContext } from "react";
import { IProfileData } from "@/Interfaces/IUser";
import {
  fetchUserData,
  updateUserData,
} from "../Fetchs/UsersFetchs/UserFetchs";
import { UserContext } from "../Context/UserContext";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import Image from "next/image";
import ImageUpload from "../Cloudinary/ImageUpload";

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

  // useEffect para hacer la solicitud a la API cuando el token cambia
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchUserData(token)
        .then((data) => {
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

  // Manejo de cambios en los campos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (fetchedProfileData) {
      setFetchedProfileData({
        ...fetchedProfileData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setFetchedProfileData((prev) => ({
      ...prev!,
      imgUrl: imageUrl, // Actualizar la URL de la imagen en fetchedProfileData
    }));
  };

  // Función de envío de datos
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
    <div className="p-4 border border-gray-300 shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold text-gray-700">
        Información Profesional
      </h2>
      {loading ? (
        <p>Cargando los datos...</p> // Si está cargando, muestra el mensaje
      ) : error ? (
        <p className="text-red-600">{error}</p> // Muestra el error si existe
      ) : (
        <>
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

          {/* Teléfono */}
          <input
            name="phone"
            type="text"
            value={fetchedProfileData?.phone || ""}
            onChange={handleChange}
            placeholder="Teléfono"
            className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
          />

          {/* Nacionalidad */}
          <input
            name="nationality"
            type="text"
            value={fetchedProfileData?.nationality || ""}
            onChange={handleChange}
            placeholder="Nacionalidad"
            className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
          />

          {/* Ubicación */}
          <input
            name="location"
            type="text"
            value={fetchedProfileData?.location || ""}
            onChange={handleChange}
            placeholder="Ciudad"
            className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
          />

          {/* Género */}
          <select
            name="genre"
            value={fetchedProfileData?.genre || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
          >
            <option value="">Seleccione su género (opcional)</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
          </select>
        </>
      )}

      {/* Botón Guardar Cambios */}
      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-verde-oscuro text-white p-2 rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
      {showErrorNotification && (
        <div className="absolute top-24 left-0 right-0 mx-auto w-max bg-red-600 text-white p-2 rounded-md">
          <p>{errorMessage}</p>
        </div>
      )}

      {showNotification && (
        <div className="absolute top-12 left-0 right-0 mx-auto w-max">
          <NotificationsForms message={notificationMessage} />
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;
