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
    name: '',
    lastname: '',
    age: '',
    nameAgency: '',
    email: '',
    puesto: '',
    role: 'PLAYER' as any,
    imgUrl: '',
    phone: '',
    nationality: '',
    location: '',
    birthday: '',
    height: 0,
    weight: 0,
    skillfulFoot: '',
    bodyStructure: '',
    habilities: [],
    videoUrl: '',
    primaryPosition: '',
    secondaryPosition: '',
  });

  // Initialize with an empty experience
  const emptyExperience = {
    club: '',
    fechaInicio: '',
    fechaFinalizacion: '',
    categoriaEquipo: '',
    nivelCompetencia: '',
    logros: ''
  };

  // State for experiences (trayectorias)
  const [experiences, setExperiences] = useState<Array<{
    club: string;
    fechaInicio: string;
    fechaFinalizacion: string;
    categoriaEquipo: string;
    nivelCompetencia: string;
    logros: string;
  }>>([emptyExperience]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const data = await fetchUserData(token);
          if (data) {
            setFormData({
              ...data,
              birthday: data.birthday || '',
            });
            
            // Initialize experiences from trayectorias
            if (data.trayectorias && Array.isArray(data.trayectorias) && data.trayectorias.length > 0) {
              setExperiences(data.trayectorias);
            }
            
            // Handle legacy data format (single experience)
            if (data.club && !data.trayectorias?.some((c: { club: string }) => c.club === data.club)) {
              const legacyExperience = {
                club: data.club || '',
                fechaInicio: data.fechaInicio || '',
                fechaFinalizacion: data.fechaFinalizacion || '',
                categoriaEquipo: data.categoriaEquipo || '',
                nivelCompetencia: data.nivelCompetencia || '',
                logros: data.logros || ''
              };
              
              setExperiences([legacyExperience]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, [token]);

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = { ...updatedExperiences[index], [field]: value };
    setExperiences(updatedExperiences);
  };

  const addExperience = () => {
    setExperiences([...experiences, { ...emptyExperience }]);
  };

  const removeExperience = (index: number) => {
    if (experiences.length > 1) {
      const updatedExperiences = experiences.filter((_, i) => i !== index);
      setExperiences(updatedExperiences);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the updated data with trayectorias
      const updatedData = {
        ...formData,
        trayectorias: experiences
      };

      if (token) {
        await updateUserData(token, updatedData);
        setShowNotification(true);
        setNotificationMessage('Información profesional actualizada correctamente');
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating professional info:', error);
      setShowErrorNotification(true);
      setErrorMessage('Error al actualizar la información profesional');
      setTimeout(() => {
        setShowErrorNotification(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-[#1d5126]">Trayectoria Profesional</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-4 text-[#1d5126]">Experiencias</h3>
          
          {experiences.map((exp, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Experiencia {index + 1}</h4>
                <button 
                  type="button" 
                  onClick={() => removeExperience(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={experiences.length === 1}
                >
                  <FaTrash />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Club
                  </label>
                  <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={exp.club}
                    onChange={(e) => handleExperienceChange(index, 'club', e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={exp.fechaInicio}
                    onChange={(e) => handleExperienceChange(index, 'fechaInicio', e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Fecha de Finalización
                  </label>
                  <input
                    type="date"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={exp.fechaFinalizacion}
                    onChange={(e) => handleExperienceChange(index, 'fechaFinalizacion', e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Categoría del Equipo
                  </label>
                  <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={exp.categoriaEquipo}
                    onChange={(e) => handleExperienceChange(index, 'categoriaEquipo', e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nivel de Competencia
                  </label>
                  <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={exp.nivelCompetencia}
                    onChange={(e) => handleExperienceChange(index, 'nivelCompetencia', e.target.value)}
                  />
                </div>
                
                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Logros
                  </label>
                  <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={3}
                    value={exp.logros}
                    onChange={(e) => handleExperienceChange(index, 'logros', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addExperience}
            className="flex items-center gap-2 bg-[#1d5126] text-white py-2 px-4 rounded hover:bg-[#143a1b] transition-colors"
          >
            <FaPlus /> Agregar Experiencia
          </button>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#1d5126] text-white py-2 px-6 rounded hover:bg-[#143a1b] transition-colors"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
      
      {showNotification && (
        <NotificationsForms
          message={notificationMessage}
          isError={false}
        />
      )}
      
      {showErrorNotification && (
        <NotificationsForms
          message={errorMessage}
          isError={true}
        />
      )}
    </div>
  );
};

export default ProfessionalInfo;
