"use client"
import { useState, useEffect, useContext, useRef } from "react";
import { IProfileData } from "@/Interfaces/IUser";
import { fetchUserData, updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";
import { UserContext } from "../Context/UserContext";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import ImageUpload from "../Cloudinary/ImageUpload";
import Image from "next/image";
import useNationalities from "../Forms/FormUser/useNationalitys";

const PersonalInfo: React.FC<{ profileData: IProfileData }> = () => {
  const { token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedProfileData, setFetchedProfileData] = useState<IProfileData | null>(null);
  const { nationalities } = useNationalities();
  const [ ,setSelectedNationality] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const nationalityRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nationalityRef.current && !nationalityRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  

  const handleSelectNationality = (value: string) => {
    setSelectedNationality(value);
    setFetchedProfileData((prevState) => {
      if (!prevState) return null; // o podrías devolver un objeto base si lo prefieres
      return {
        ...prevState,
        nationality: value,
      };
    });
    setSearch("");
    setIsOpen(false);
  };
  
  // useEffect para hacer la solicitud a la API cuando el token cambia
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchUserData(token)
        .then((data) => {
          setFetchedProfileData(data);
          setSearch(data.nationality || "");
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
      setErrorMessage(error instanceof Error ? error.message : "Ocurrió un error.");
      setShowErrorNotification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 shadow-lg rounded-lg">
      <h2 className="text-lg p-1 font-semibold text-gray-700 text-center">Información Profesional</h2>
      {loading ? (
        <p>Cargando los datos...</p> // Si está cargando, muestra el mensaje
      ) : error ? (
        <p className="text-red-600">{error}</p> // Muestra el error si existe
      ) : (
        <>
        {/* Name */}
        <div className="flex flex-col">
        <label className="text-gray-700 font-semibold text-sm mt-2">Nombre</label>
             <input
          name="name"
          type="text"
          value={fetchedProfileData?.name || ""}
          readOnly
          placeholder="Nombre"
          className="w-full p-1.5 mb-1 border rounded text-gray-700 bg-gray-100 cursor-not-allowed focus:outline-none"
        />
          </div>
  
          {/* Last Name */}
          <div className="flex flex-col">
          <label className="text-gray-700 font-semibold text-sm mt-2">Apelido</label>
          <input
            name="lastname"
            type="text"
            value={fetchedProfileData?.lastname || ""}
            readOnly
            placeholder="Apellido"
            className="w-full p-1.5 mb-1 border rounded text-gray-700 bg-gray-100 cursor-not-allowed focus:outline-none"
          />
          </div>
  
          {/* Email */}
          <div className="flex flex-col">
          <label className="text-gray-700 font-semibold text-sm mt-2">Email</label>
          <input
            name="email"
            type="email"
            value={fetchedProfileData?.email || ""}
            readOnly
            placeholder="Apellido"
            className="w-full p-1.5 mb-1 border rounded text-gray-700 bg-gray-100 cursor-not-allowed focus:outline-none"
          />
          </div>

          <div className="flex flex-col">
  {/* Ubicación actual */}
  <label className="text-gray-700 font-semibold text-sm mt-2">Ubicación actual</label>
  <input
    type="text"
    value={fetchedProfileData?.nationality || ""}
    disabled
    className="w-full p-2 border rounded mt-1 text-gray-500 bg-gray-100 cursor-not-allowed"
  />

  {/* Cambiar ubicación */}
  <div className="flex flex-col relative mt-2" ref={nationalityRef}>
    <label className="text-gray-700 font-semibold text-sm">Cambiar ubicación:</label>

    <div className="relative w-full">
      <input
        type="text"
        name="nationality"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        placeholder="Selecciona o escribe tu nacionalidad"
        className="w-full p-2 border rounded mt-2 text-gray-700 focus:outline-none pr-10"
      />

      {/* Ícono de flecha */}
      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none mt-2">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    {/* Dropdown */}
    {isOpen && (
      <div className="absolute z-10 w-full max-w-[95vw] bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">

        <ul>
          {nationalities
            .filter((nationality) =>
              nationality.label.toLowerCase().includes(search.toLowerCase())
            )
            .map((nationality) => (
              <li
                key={nationality.value}
                className="p-2 cursor-pointer text-gray-700 hover:bg-gray-200"
                onClick={() => handleSelectNationality(nationality.label)}
              >
                {nationality.label}
              </li>
            ))}
        </ul>
      </div>
    )}
  </div>
</div>


          {/* Age */}
<div className="flex flex-col">
  <label className="text-gray-700 font-semibold text-sm mt-2">Año de fundación:</label>
  <input
    name="age"
    type="text"
    value={fetchedProfileData?.age || ""}
    onChange={handleChange}
    placeholder="Año de fundación"
    className="w-full p-1.5 border rounded mt-2 text-gray-700 focus:outline-none"
  />
  </div>
      
  <div className="flex flex-col">
  <label className="text-gray-700 font-semibold text-sm mt-2">Nombre entidad:</label>
           {/* nombre agencia */}
           <input
            name="nameAgency"
            type="text"
            value={fetchedProfileData?.nameAgency|| ""}
            onChange={handleChange}
            placeholder="Nombre de la agencia o entidad"
            className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
          />
</div>
          {/* Teléfono */}
          <div className="flex flex-col">
  <label className="text-gray-700 font-semibold text-sm mt-2">Teléfono:</label>
          <input
            name="phone"
            type="text"
            value={fetchedProfileData?.phone || ""}
            onChange={handleChange}
            placeholder="Teléfono"
            className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
          />
</div>



<div className="flex flex-col">
  <label className="text-gray-700 font-semibold text-sm mt-2">Ciudad:</label>
          {/* Ubicación */}
          <input
            name="location"
            type="text"
            value={fetchedProfileData?.location || ""}
            onChange={handleChange}
            placeholder="Ciudad"
            className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
          />

</div>
{/* Tipo de Organización */}
<div className="flex flex-col">
  <label className="text-gray-700 font-semibold text-sm mt-2">Tipo de Organización:</label>
<select
  name="puesto"
  value={fetchedProfileData?.puesto || ""}
  onChange={handleChange}
  className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
>
  <option value="" disabled>Selecciona el tipo de organización</option>
  <option value="Club profesional">Club profesional</option>
  <option value="Club amateur">Club amateur</option>
  <option value="Agencia de reclutamiento">Agencia de reclutamiento</option>
  <option value="Escuelas de fútbol">Escuelas de fútbol</option>
</select>
</div>
 {/* Imagen de perfil (URL) */}
 <div className="sm:col-span-2 flex flex-col items-center">
            <label className="text-gray-700 font-semibold mb-2">Subir Imagen</label>
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
