"use client"
import { useState, useEffect, useContext } from "react";
import { IProfileData } from "@/Interfaces/IUser";
import { fetchUserData, updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";
import { UserContext } from "../Context/UserContext";
import { NotificationsForms } from "../Notifications/NotificationsForms";

const ContactDetails: React.FC<{ profileData: IProfileData }> = () => {
  const { token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedProfileData, setFetchedProfileData] = useState<IProfileData | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (fetchedProfileData) {
      setFetchedProfileData({
        ...fetchedProfileData,
        socialMedia: {
          ...fetchedProfileData.socialMedia,
          [e.target.name]: e.target.value,
        },
      });
    }
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
      setErrorMessage(error instanceof Error ? error.message : "Ocurrió un error.");
      setShowErrorNotification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold text-gray-700">Detalles Físicos</h2>
      {fetchedProfileData ? (
        <>
          <input
            type="text"
            name="instagram"
            value={fetchedProfileData.socialMedia?.instagram || ""}
            onChange={handleChange}
            placeholder="link de instagram"
            className="w-full p-2 border rounded mt-2 focus:outline-none hover:cursor-pointer text-gray-700"
          />
          <input
            type="text"
            name="twitter"
            value={fetchedProfileData.socialMedia?.twitter || ""}
            onChange={handleChange}
            placeholder="link de twitter"
            className="w-full p-2 border rounded mt-2 focus:outline-none hover:cursor-pointer text-gray-700"
          />
        </>
      ) : (
        <p>Cargando los datos...</p>
      )}

      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-verde-oscuro text-white p-2 rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
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

export default ContactDetails;
