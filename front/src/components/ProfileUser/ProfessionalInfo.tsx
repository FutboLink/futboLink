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
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<IProfileData>({
    name: "",
    lastname: "",
    age: "",
    nameAgency: "",
    email: "",
    puesto: "",
    role: "PLAYER" as any,
    imgUrl: "",
    phone: "",
    nationality: "",
    location: "",
    birthday: "",
    height: 0,
    weight: 0,
    skillfulFoot: "",
    bodyStructure: "",
    habilities: [],
    videoUrl: "",
    primaryPosition: "",
    secondaryPosition: "",
    trayectorias: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const data = await fetchUserData(token);
          
          // Initialize trayectorias array if it doesn't exist
          if (!data.trayectorias) {
            data.trayectorias = [];
            
            // Handle legacy data format (single experience)
            if (data.club && !data.trayectorias.some((t: { club: string }) => t.club === data.club)) {
              const legacyExperience = {
                club: data.club || '',
                fechaInicio: data.fechaInicio || '',
                fechaFinalizacion: data.fechaFinalizacion || '',
                categoriaEquipo: data.categoriaEquipo || '',
                nivelCompetencia: data.nivelCompetencia || '',
                logros: data.logros || ''
              };
              
              data.trayectorias.push(legacyExperience);
            }
          }
          
          setFormData(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [token]);

  // Function to add a new empty experience
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      trayectorias: [
        ...(prev.trayectorias || []),
        {
          club: '',
          fechaInicio: '',
          fechaFinalizacion: '',
          categoriaEquipo: '',
          nivelCompetencia: '',
          logros: ''
        }
      ]
    }));
  };

  // Function to remove an experience at a specific index
  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      trayectorias: prev.trayectorias?.filter((_, i) => i !== index) || []
    }));
  };

  // Function to update a specific field in an experience
  const handleExperienceChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedExperiences = [...(prev.trayectorias || [])];
      updatedExperiences[index] = {
        ...updatedExperiences[index],
        [field]: value
      };
      return {
        ...prev,
        trayectorias: updatedExperiences
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (token) {
        const userId = JSON.parse(atob(token.split(".")[1])).id;
        await updateUserData(userId, formData);
        setNotificationMessage('Información profesional actualizada con éxito');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (error) {
      console.error("Error updating professional info:", error);
      setErrorMessage('Error al actualizar la información profesional');
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#1d5126]">Información Profesional</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-[#1d5126]">Trayectoria</h3>
          
          {formData.trayectorias && formData.trayectorias.map((experience, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg relative">
              <button 
                type="button" 
                onClick={() => removeExperience(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`club-${index}`}>
                  Club
                </label>
                <input
                  id={`club-${index}`}
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={experience.club || ''}
                  onChange={(e) => handleExperienceChange(index, 'club', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`fechaInicio-${index}`}>
                    Fecha de Inicio
                  </label>
                  <input
                    id={`fechaInicio-${index}`}
                    type="date"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={experience.fechaInicio || ''}
                    onChange={(e) => handleExperienceChange(index, 'fechaInicio', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`fechaFinalizacion-${index}`}>
                    Fecha de Finalización
                  </label>
                  <input
                    id={`fechaFinalizacion-${index}`}
                    type="date"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={experience.fechaFinalizacion || ''}
                    onChange={(e) => handleExperienceChange(index, 'fechaFinalizacion', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`categoriaEquipo-${index}`}>
                  Categoría del Equipo
                </label>
                <input
                  id={`categoriaEquipo-${index}`}
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={experience.categoriaEquipo || ''}
                  onChange={(e) => handleExperienceChange(index, 'categoriaEquipo', e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`nivelCompetencia-${index}`}>
                  Nivel de Competencia
                </label>
                <input
                  id={`nivelCompetencia-${index}`}
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={experience.nivelCompetencia || ''}
                  onChange={(e) => handleExperienceChange(index, 'nivelCompetencia', e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`logros-${index}`}>
                  Logros
                </label>
                <textarea
                  id={`logros-${index}`}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={experience.logros || ''}
                  onChange={(e) => handleExperienceChange(index, 'logros', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addExperience}
            className="flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1d5126] hover:bg-[#143a1b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1d5126] mb-4"
          >
            <FaPlus className="mr-2" /> Añadir Experiencia
          </button>
        </div>
        
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-[#1d5126] hover:bg-[#143a1b] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Información"}
          </button>
        </div>
      </form>
      
      {showNotification && <NotificationsForms message={notificationMessage} />}
      {showErrorNotification && <NotificationsForms message={errorMessage} isError={true} />}
    </div>
  );
};

export default ProfessionalInfo;