"use client";
import { useState, useEffect, useContext, useRef } from "react";
import { IProfileData } from "@/Interfaces/IUser";
import { fetchUserData, updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";
import { UserContext } from "../Context/UserContext";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import useNationalities from "../Forms/FormUser/useNationalitys";
import { FaChevronDown } from "react-icons/fa";
import ImageUpload from "../Cloudinary/ImageUpload";
import Image from "next/image";
import { checkUserSubscription, refreshUserSubscription, clearSubscriptionCache, SubscriptionInfo } from "../../services/SubscriptionService";
import Link from "next/link";

const PersonalInfo: React.FC<{ profileData: IProfileData }> = () => {
  const { token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedProfileData, setFetchedProfileData] = useState<IProfileData | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({ 
    hasActiveSubscription: false,
    subscriptionType: 'Amateur'
  });
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  
  // Nationality related state
  const { nationalities, loading: nationalitiesLoading, error: nationalitiesError } = useNationalities();
  const [search, setSearch] = useState("");  
  const [isOpen, setIsOpen] = useState(false); 
  const [selectedNationality, setSelectedNationality] = useState<string>(''); 
  
  const dropdownRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  // Check for cached subscription data
  useEffect(() => {
    try {
      const cachedSubscription = localStorage.getItem('subscriptionInfo');
      if (cachedSubscription) {
        const parsedData = JSON.parse(cachedSubscription);
        console.log('Found cached subscription data:', parsedData);
        setSubscriptionInfo(parsedData);
      }
    } catch (err) {
      console.error('Error reading cached subscription data:', err);
    }
  }, []);

  // Fetch user data when token changes
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchUserData(token)
        .then((data) => {
          setFetchedProfileData(data); // Ensure socialMedia data is included here
          
          // After fetching user data, check subscription status
          if (data.email) {
            setLoadingSubscription(true);
            
            // Use the refresh function to ensure we get the latest data
            refreshUserSubscription(data.email)
              .then(subInfo => {
                setSubscriptionInfo(subInfo);
                // Update the cache
                localStorage.setItem('subscriptionInfo', JSON.stringify(subInfo));
              })
              .catch(err => {
                console.error("Error checking subscription:", err);
                
                // Fallback to regular check if refresh fails
                checkUserSubscription(data.email)
                  .then(regularInfo => {
                    setSubscriptionInfo(regularInfo);
                  })
                  .catch(regularErr => {
                    console.error("Error with fallback subscription check:", regularErr);
                  });
              })
              .finally(() => {
                setLoadingSubscription(false);
              });
          }
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
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (fetchedProfileData) {
      const { name, value } = e.target;
      
      // Verificar si el nombre del campo pertenece a socialMedia
      if (['transfermarkt', 'x', 'youtube'].includes(name)) {
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
  

  // Handle nationality selection
  const handleSelectNationality = (value: string) => {
    setSelectedNationality(value); // Update selected nationality
    if (fetchedProfileData) {
      setFetchedProfileData({
        ...fetchedProfileData,
        nationality: value,  // Update nationality in fetched data
      });
    }
    setSearch('');  // Clear search input
    setIsOpen(false);  // Close the dropdown
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
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
      setErrorMessage(error instanceof Error ? error.message : "Ocurrió un error.");
      setShowErrorNotification(true);
    } finally {
      setLoading(false);
    }
  };

  // Add a function to manually refresh subscription status
  const handleRefreshSubscription = async () => {
    if (!fetchedProfileData?.email) return;
    
    setLoadingSubscription(true);
    try {
      // Clear cache first to ensure we get fresh data
      clearSubscriptionCache();
      const freshData = await refreshUserSubscription(fetchedProfileData.email);
      setSubscriptionInfo(freshData);
      localStorage.setItem('subscriptionInfo', JSON.stringify(freshData));
    } catch (err) {
      console.error("Error refreshing subscription:", err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  return (
    <div className="p-2 border border-gray-300 shadow-sm rounded-lg"> {/* Reducir padding */}
      <h2 className="text-sm font-semibold mt-2 text-center p-2 bg-gray-100 text-gray-700">Información Personal</h2>
  
      {loading ? (
        <p>Cargando los datos...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3"> {/* Reducir gap entre los inputs */}
          {/* Subscription Information */}
          <div className="sm:col-span-2 mb-4">
            <div className={`p-3 text-black rounded-lg ${
              subscriptionInfo.hasActiveSubscription 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-semibold">Estado de Suscripción</h3>
                <button 
                  onClick={handleRefreshSubscription} 
                  disabled={loadingSubscription}
                  className="text-xs text-verde-oscuro hover:underline"
                >
                  {loadingSubscription ? 'Actualizando...' : 'Actualizar estado'}
                </button>
              </div>
              {loadingSubscription ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-verde-oscuro mr-2"></div>
                  <p className="text-sm text-gray-600">Verificando suscripción...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      subscriptionInfo.hasActiveSubscription ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="font-medium">
                      {subscriptionInfo.hasActiveSubscription 
                        ? 'Suscripción Activa' 
                        : 'Sin Suscripción Activa'}
                    </span>
                  </div>
                  <p className="text-sm mb-2">
                    Plan: <span className="font-semibold">{subscriptionInfo.subscriptionType}</span>
                  </p>
                  {!subscriptionInfo.hasActiveSubscription && (
                    <div className="mt-2">
                      <Link 
                        href="/subs" 
                        className="text-sm text-white bg-verde-oscuro hover:bg-verde-claro px-4 py-1 rounded-md transition-colors duration-200"
                      >
                        Ver planes de suscripción
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

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
  
          <div className="relative flex flex-col" ref={dropdownRef}>
  {/* Nationality Search */}
  <div className="relative w-full">
  {/* Nationality Search & Selection in one input */}
  <label htmlFor="nationalitySearch" className="block text-gray-700 font-semibold text-sm">
    Nacionalidad
  </label>
  <input
    type="text"
    id="nationalitySearch"
    value={search || selectedNationality}
    onChange={(e) => {
      setSearch(e.target.value);
      setSelectedNationality(""); // Limpiar la selección si se empieza a tipear de nuevo
    }}
    placeholder="Buscar nacionalidad..."
    onClick={toggleDropdown}
    className="w-full border text-gray-700 mt-2 border-gray-300 rounded-lg p-2"
    readOnly={isOpen === false} // Para evitar edición directa cuando ya está seleccionada
  />
  <FaChevronDown
    className="absolute top-10 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
    onClick={toggleDropdown}
  />

  {/* Dropdown */}
  {isOpen && (
    <div className="absolute z-10 w-full max-w-[95vw] bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
      {nationalitiesLoading && <p className="p-2">Cargando nacionalidades...</p>}
      {nationalitiesError && <p className="text-red-500 p-2">{nationalitiesError}</p>}
      <ul>
        {nationalities
          .filter((nationality) =>
            nationality.label.toLowerCase().includes(search.toLowerCase())
          )
          .map((nationality) => (
            <li
              key={nationality.value}
              className="p-2 cursor-pointer text-gray-700 hover:bg-gray-200"
              onClick={() => {
                handleSelectNationality(nationality.label);
                setSearch(nationality.label); // Mostrarlo en el input
                setIsOpen(false); // Cerrar dropdown
              }}
            >
              {nationality.label}
            </li>
          ))}
      </ul>
    </div>
  )}
</div>


</div>

         
  
          {/* Location */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold text-sm">Ciudad:</label>
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
            <label className="text-gray-700 font-semibold text-sm">Ubicación actual:</label>
            <input
              name="ubicacionActual"
              type="text"
              value={fetchedProfileData?.ubicacionActual || ""}
              onChange={handleChange}
              placeholder="Ubicación actual"
              className="w-full p-1.5 border rounded mt-2 text-gray-700 focus:outline-none"
            />
          </div>
  
          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold text-sm">Teléfono:</label>
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
            <label className="text-gray-700 font-semibold text-sm">Género:</label>
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
            <label className="text-gray-700 font-semibold text-sm">Fecha de nacimiento:</label>
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
            <label className="text-gray-700 font-semibold text-sm pl-2">Transfermarkt:</label>
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
            <label className="text-gray-700 font-semibold text-sm pl-2">X:</label>
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
            <label className="text-gray-700 font-semibold text-sm pl-2">Youtube:</label>
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
  
}  
export default PersonalInfo;