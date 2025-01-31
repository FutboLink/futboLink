"use client"
import { useState, useEffect, useContext } from "react";
import { IProfileData } from "@/Interfaces/IUser";
import { fetchUserData, updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";
import { UserContext } from "../Context/UserContext";

const PersonalInfo: React.FC<{ profileData: IProfileData }> = () => {
  const { token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedProfileData, setFetchedProfileData] = useState<IProfileData | null>(null);

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
        [e.target.name]: e.target.value,  
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
      alert("Datos actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      setError("Ocurrió un error al actualizar los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold text-gray-700">Información Profesional</h2>
      {loading ? (
        <p>Cargando los datos...</p> // Si está cargando, muestra el mensaje
      ) : error ? (
        <p className="text-red-600">{error}</p> // Muestra el error si existe
      ) : (
        <>
          {/* Nombre */}
          <input
            name="name"
            type="text"
            value={fetchedProfileData?.name}
            onChange={handleChange}
            placeholder="Nombre"
            required
            readOnly
            className="w-full p-2 border rounded mt-2 text-gray-700 bg-gray-100 focus:outline-none"
          />

          {/* Apellido */}
          <input
            name="lastname"
            type="text"
            value={fetchedProfileData?.lastname}
            onChange={handleChange}
            placeholder="Apellido"
            required
            readOnly
            className="w-full p-2 border rounded mt-2 text-gray-700 bg-gray-100 focus:outline-none"
          />

          {/* Email */}
          <input
            name="email"
            type="email"
            value={fetchedProfileData?.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            required
            readOnly
            className="w-full p-2 border rounded mt-2 text-gray-700 bg-gray-100 focus:outline-none"
          />

          {/* Imagen de perfil (URL) */}
          <input
            name="imgUrl"
            type="text"
            value={fetchedProfileData?.imgUrl || ""}
            onChange={handleChange}
            placeholder="URL de la imagen"
            className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
            />
           {/* Imagen de perfil (URL) */}
           <input
            name="videoUrl"
            type="text"
            value={fetchedProfileData?.videoUrl|| ""}
            onChange={handleChange}
            placeholder="URL del video)"
            className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
          />

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
            placeholder="Ubicación"
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

          {/* Fecha de nacimiento */}
          <input
            name="birthday"
            type="date"
            value={fetchedProfileData?.birthday || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-2 text-gray-400 hover:cursor-pointer focus:outline-none"
          />
        </>
      )}

      {/* Botón Guardar Cambios */}
      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
};

export default PersonalInfo;
