"use client"
import { useState, useEffect, useContext } from "react";
import { IProfileData } from "@/Interfaces/IUser";
import { fetchUserData, updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";
import { UserContext } from "../Context/UserContext";

const ProfessionalInfo: React.FC<{ profileData: IProfileData }> = () => {
  const { token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Variable de estado para almacenar los datos obtenidos y modificados
  const [fetchedProfileData, setFetchedProfileData] = useState<IProfileData | null>(null);

  // useEffect para hacer la solicitud a la API cuando el token cambia
  useEffect(() => {
    if (token) {
      setLoading(true); // Iniciar carga
      fetchUserData(token)
        .then((data) => {
          setFetchedProfileData(data); // Establecer los datos obtenidos
        })
        .catch((err) => {
          console.error("Error al cargar los datos:", err);
          setError("Error al cargar los datos.");
        })
        .finally(() => {
          setLoading(false); // Finalizar carga
        });
    }
  }, [token]); // Ejecuta solo cuando el token cambia

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFetchedProfileData({
      ...fetchedProfileData!,
      [e.target.name]: e.target.value,
    });
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const habilities = e.target.value.split(",").map((skill) => skill.trim());
    setFetchedProfileData({ ...fetchedProfileData!, habilities });
  };

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

  // Renderizado de los datos obtenidos
  return (
    <div className="p-4 border border-gray-300 shadow-lg rounded-lg">
      <h2 className="text-lg text-gray-700 font-semibold">Información Profesional</h2>
   
      {/* Mostrar datos obtenidos */}
      {fetchedProfileData ? (
        <>
          {/* Habilidades */}
          <label className="block mt-2 p-2 text-md bg-gray-100 text-center text-gray-700 font-semibold">Habilidades</label>
          <input
            name="habilities"
            value={fetchedProfileData.habilities?.join(", ") || ""}
            onChange={handleArrayChange}
            placeholder="Habilidades ej. (Tiro Libre, Velocidad)"
            className="w-full p-2 border rounded mt-2 text-gray-700 focus:outline-none"
          />

          {/* Pie Hábil */}
          <label className="block mt-2 p-2 text-center bg-gray-100 text-md text-gray-700 font-semibold">Pie Hábil</label>
          <select
            name="skillfulFoot"
            value={fetchedProfileData.skillfulFoot || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1 text-gray-700"
          >
            <option value="">Seleccione una opción</option>
            <option value="Derecho">Derecho</option>
            <option value="Izquierdo">Izquierdo</option>
            <option value="Ambos">Ambos</option>
          </select>
 {/* Datos Físicos */}
 <h2 className="text-md font-semibold mt-2 text-center p-2 bg-gray-100 text-gray-700">Detalles Físicos</h2>
      <input
        type="number"
        name="height"
        value={fetchedProfileData.height || ""}
        onChange={handleChange}
        placeholder="Altura (cm)"
        className="w-full p-2 border rounded mt-2 focus:outline-none hover:cursor-pointer text-gray-700"
      />
      <input
        type="number"
        name="weight"
        value={fetchedProfileData.weight || ""}
        onChange={handleChange}
        placeholder="Peso (kg)"
        className="w-full p-2 border rounded mt-2 focus:outline-none hover:cursor-pointer text-gray-700"
      />
      <input
        type="text"
        name="bodyStructure"
        value={fetchedProfileData.bodyStructure || ""}
        onChange={handleChange}
        placeholder="Contextura física ej. Atlético "
        className="w-full p-2 border rounded mt-2 focus:outline-none hover:cursor-pointer text-gray-700"
      />
        </>
      ) : (
        <p>Cargando los datos...</p> // Si no se obtuvieron datos, muestra un mensaje de carga
      )}

      {/* Botón Guardar Cambios */}
      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>

      {/* Mostrar errores si existen */}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default ProfessionalInfo;
