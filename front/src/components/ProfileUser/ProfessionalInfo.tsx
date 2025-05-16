"use client"
import { useState, useEffect, useContext } from "react";
import { IProfileData } from "@/Interfaces/IUser";
import { fetchUserData, updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";
import { UserContext } from "../Context/UserContext";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import { FaPlus, FaTrash } from "react-icons/fa";

const ProfessionalInfo: React.FC<{ profileData: IProfileData }> = () => {
  const { token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  

  // Variable de estado para almacenar los datos obtenidos y modificados
  const [fetchedProfileData, setFetchedProfileData] = useState<IProfileData | null>(null);

  

  // useEffect para hacer la solicitud a la API cuando el token cambia
  useEffect(() => {
    if (token) {
      setLoading(true); // Iniciar carga
      fetchUserData(token)
        .then((data) => {
          // Initialize career array if it doesn't exist
          if (!data.career) {
            data.career = [{
              club: '',
              fechaInicio: '',
              fechaFinalizacion: '',
              categoriaEquipo: '',
              nivelCompetencia: '',
              logros: ''
            }];
          } else if (data.career.length === 0) {
            // Ensure there's at least one empty experience
            data.career.push({
              club: '',
              fechaInicio: '',
              fechaFinalizacion: '',
              categoriaEquipo: '',
              nivelCompetencia: '',
              logros: ''
            });
          }
          
          // Handle legacy data format (single experience)
          if (data.club && !data.career?.some((c: { club: string }) => c.club === data.club)) {
            const legacyExperience = {
              club: data.club || '',
              fechaInicio: data.fechaInicio || '',
              fechaFinalizacion: data.fechaFinalizacion || '',
              categoriaEquipo: data.categoriaEquipo || '',
              nivelCompetencia: data.nivelCompetencia || '',
              logros: data.logros || ''
            };
            
            if (data.career) {
              data.career.unshift(legacyExperience);
            } else {
              data.career = [legacyExperience];
            }
          }
          
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

  // Handle changes to career experience fields
  const handleCareerChange = (index: number, field: string, value: string) => {
    if (!fetchedProfileData || !fetchedProfileData.career) return;
    
    const updatedCareer = [...fetchedProfileData.career];
    updatedCareer[index] = {
      ...updatedCareer[index],
      [field]: value
    };
    
    setFetchedProfileData({
      ...fetchedProfileData,
      career: updatedCareer
    });
  };
  
  // Add a new empty experience
  const addExperience = () => {
    if (!fetchedProfileData) return;
    
    const newExperience = {
      club: '',
      fechaInicio: '',
      fechaFinalizacion: '',
      categoriaEquipo: '',
      nivelCompetencia: '',
      logros: ''
    };
    
    setFetchedProfileData({
      ...fetchedProfileData,
      career: [...(fetchedProfileData.career || []), newExperience]
    });
  };
  
  // Remove an experience at specified index
  const removeExperience = (index: number) => {
    if (!fetchedProfileData || !fetchedProfileData.career) return;
    
    // Don't remove if it's the only experience
    if (fetchedProfileData.career.length <= 1) return;
    
    const updatedCareer = fetchedProfileData.career.filter((_, i) => i !== index);
    
    setFetchedProfileData({
      ...fetchedProfileData,
      career: updatedCareer
    });
  };

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
      setErrorMessage(error instanceof Error ? error.message : "Ocurrió un error.");
      setShowErrorNotification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border border-gray-300 shadow-lg rounded-lg">
      {loading ? (
        <p>Cargando los datos...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        fetchedProfileData ? (
          <>
            {/* Datos Generales */}
            <h2 className="text-sm font-semibold mt-2 text-center p-2 bg-gray-100 text-gray-700">Datos Generales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Puesto Principal */}
              <div>
                <label className="font-semibold text-gray-700">Puesto Principal</label>
                <select 
                name="primaryPosition" 
                value={fetchedProfileData.primaryPosition || ""} 
                onChange={handleChange} 
                className="border rounded-md p-2 mt-2 w-full text-gray-700"
              >
                <option value="">Selecciona tu puesto principal</option>
                <option value="Arquero">Arquero</option>
                <option value="Defensa central">Defensa central</option>
                <option value="Defensa lateral">Defensa lateral</option>
                <option value="Centrocampista">Centrocampista</option>
                <option value="Delantero">Delantero</option>
              </select>

              </div>
  
              {/* Puesto Secundario */}
              <div>
                <label className="font-semibold mt-4 text-gray-700">Puesto Secundario</label>
                <select className="border rounded-md p-2 mt-2 w-full text-gray-700"
                name="secondaryPosition" 
                value={fetchedProfileData.secondaryPosition || ""} 
                onChange={handleChange} >
                  <option value="">Selecciona tu puesto secundario</option>
                  <option value="Arquero">Arquero</option>
                  <option value="Defensa central">Defensa central</option>
                  <option value="Defensa lateral">Defensa lateral</option>
                  <option value="Centrocampista">Centrocampista</option>
                  <option value="Delantero">Delantero</option>
                </select>
              </div>
  
              {/* Pasaporte UE */}
              <div>
                <label className="font-semibold mt-4 text-gray-700">Pasaporte UE</label>
                <select 
                name="pasaporteUe"
                value={fetchedProfileData.pasaporteUe || ""}
                onChange={handleChange}
                 className="border rounded-md p-2 mt-2 w-full text-gray-700">
                  <option value="">¿Tienes pasaporte UE?</option>
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
  
            </div>
  
            {/* Datos Físicos */}
            <h2 className="text-sm font-semibold mt-2 text-center p-2 bg-gray-100 text-gray-700">Datos Físicos</h2>
            <div className="space-y-4">
              <div>
                <label className="block mt-1 p-1 text-sm text-gray-700 font-semibold">Estructura Corporal</label>
                <select
                  name="bodyStructure"
                  value={fetchedProfileData.bodyStructure || ""}
                  onChange={handleChange}
                  className="w-full p-2 text-sm border rounded mt-1 text-gray-700"
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Endomorfo">Endomorfo</option>
                  <option value="Ectomorfo">Ectomorfo</option>
                  <option value="Mesomorfo">Mesomorfo</option>
                </select>
              </div>
  
              <div>
                <label className="block mt-1 p-1 text-sm text-gray-700 font-semibold">Pie Hábil</label>
                <select
                  name="skillfulFoot"
                  value={fetchedProfileData.skillfulFoot || ""}
                  onChange={handleChange}
                  className="w-full p-2 text-sm border rounded mt-1 text-gray-700"
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Derecho">Derecho</option>
                  <option value="Izquierdo">Izquierdo</option>
                  <option value="Ambidiestro">Ambidiestro</option>
                </select>
              </div>
            </div>
  
            {/* Trayectoria */}
            <div className="mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-center p-2 bg-gray-100 text-gray-700 flex-grow">Trayectoria</h2>
                <button 
                  type="button" 
                  onClick={addExperience}
                  className="ml-2 bg-verde-oscuro text-white p-2 rounded-md hover:bg-green-700 flex items-center"
                >
                  <FaPlus className="mr-1" /> Agregar experiencia
                </button>
              </div>
              
              {fetchedProfileData.career?.map((experience, index) => (
                <div key={index} className="mt-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700">Experiencia {index + 1}</h3>
                    {fetchedProfileData.career && fetchedProfileData.career.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nombre del Club */}
                    <div>
                      <label className="block mt-1 p-2 text-sm text-gray-700 font-semibold">Nombre del Club</label>
                      <input
                        type="text"
                        value={experience.club || ""}
                        onChange={(e) => handleCareerChange(index, 'club', e.target.value)}
                        className="w-full p-2 text-sm border rounded mt-1 text-gray-700"
                      />
                    </div>
                
                    {/* Fecha de Inicio */}
                    <div>
                      <label className="block mt-1 p-2 text-sm text-gray-700 font-semibold">Fecha de Inicio</label>
                      <input
                        type="date"
                        value={experience.fechaInicio || ""}
                        onChange={(e) => handleCareerChange(index, 'fechaInicio', e.target.value)}
                        className="w-full p-2 text-sm border rounded mt-1 text-gray-700"
                      />
                    </div>
                
                    {/* Fecha de Finalización */}
                    <div>
                      <label className="block mt-1 p-2 text-sm text-gray-700 font-semibold">Fecha de Finalización</label>
                      <input
                        type="date"
                        value={experience.fechaFinalizacion || ""}
                        onChange={(e) => handleCareerChange(index, 'fechaFinalizacion', e.target.value)}
                        className="w-full p-2 text-sm border rounded mt-1 text-gray-700"
                      />
                    </div>
                
                    {/* Categoría de equipo */}
                    <div>
                      <label className="block mt-1 p-2 text-sm text-gray-700 font-semibold">Categoría de equipo</label>
                      <select
                        value={experience.categoriaEquipo || ""}
                        onChange={(e) => handleCareerChange(index, 'categoriaEquipo', e.target.value)}
                        className="w-full p-2 text-sm border rounded mt-1 text-gray-700"
                      >
                        <option value="">Seleccione una opción</option>
                        <option value="Primer equipo">Primer equipo</option>
                        <option value="Reserva">Reserva</option>
                        <option value="Infantil">Infantil</option>
                        <option value="Juvenil">Juvenil</option>
                        <option value="Fútbol base">Fútbol base</option>
                        <option value="Fútbol sala">Fútbol sala</option>
                        <option value="Femenino">Femenino</option>
                      </select>
                    </div>
                
                    {/* Nivel de competencia */}
                    <div>
                      <label className="block mt-1 p-2 text-sm text-gray-700 font-semibold">Nivel de competencia</label>
                      <select
                        value={experience.nivelCompetencia || ""}
                        onChange={(e) => handleCareerChange(index, 'nivelCompetencia', e.target.value)}
                        className="w-full p-2 text-sm border rounded mt-1 text-gray-700"
                      >
                        <option value="">Seleccione una opción</option>
                        <option value="Profesional">Profesional</option>
                        <option value="Semiprofesional">Semiprofesional</option>
                        <option value="Amateur">Amateur</option>
                      </select>
                    </div>
                
                    {/* Logros */}
                    <div>
                      <label className="block mt-1 p-2 text-sm text-gray-700 font-semibold">Logros</label>
                      <input
                        type="text"
                        value={experience.logros || ""}
                        onChange={(e) => handleCareerChange(index, 'logros', e.target.value)}
                        className="w-full p-2 text-sm border rounded mt-1 text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            {/* Botón Guardar Cambios */}
            <button
              onClick={handleSubmit}
              className="mt-6 w-full bg-verde-oscuro text-white p-2 rounded hover:bg-green-700 text-sm"
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
          </>
        ) : (
          <p className="text-sm text-gray-600">Cargando los datos...</p>
        )
      )}
    </div>
  );
  
};


export default ProfessionalInfo;
