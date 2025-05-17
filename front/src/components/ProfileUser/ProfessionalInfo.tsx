"use client"
import { useState, useEffect, useContext } from "react";
import { IProfileData, PasaporteUe } from "@/Interfaces/IUser";
import { fetchUserData, updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";
import { UserContext } from "../Context/UserContext";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import { FaPlus, FaTrash } from "react-icons/fa";

// Define options for the dropdown fields
const CATEGORIAS_OPTIONS = ["Primer Equipo", "Reserva", "Infantil", "Juvenil", "Futbol Base", "Futbol Sala", "Femenino"];
const NIVEL_COMPETENCIA_OPTIONS = ["Profesional", "Amateur"];
const PUESTO_PRINCIPAL_OPTIONS = [
  "Delantero Centro", 
  "Extremo Derecho",
  "Extremo Izquierdo",
  "Mediocampista Ofensivo",
  "Mediocampista Central",
  "Mediocampista Defensivo",
  "Lateral Derecho",
  "Lateral Izquierdo",
  "Defensor Central",
  "Arquero",
  "Preparador Físico",
  "Entrenador",
  "Asistente Técnico",
  "Analista Táctico",
  "Utilero",
  "Médico",
  "Fisioterapeuta",
  "Nutricionista",
  "Psicólogo Deportivo",
  "Otro"
];
const PASAPORTE_UE_OPTIONS = ["Sí", "No"];
const ESTRUCTURA_CORPORAL_OPTIONS = ["Ectomorfo", "Mesomorfo", "Endomorfo", "Atlética", "Musculosa", "Robusta", "Delgada"];
const PIE_HABIL_OPTIONS = ["Derecho", "Izquierdo", "Ambidiestro"];

const ProfessionalInfo: React.FC<{ profileData: IProfileData }> = ({ profileData }) => {
  const { token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<IProfileData>(profileData);

  // Initialize with an empty experience
  const emptyExperience = {
    club: '',
    fechaInicio: '',
    fechaFinalizacion: '',
    categoriaEquipo: CATEGORIAS_OPTIONS[0],
    nivelCompetencia: NIVEL_COMPETENCIA_OPTIONS[0],
    logros: ''
  };

  // Información general del perfil
  const [primaryPosition, setPrimaryPosition] = useState<string>(profileData.primaryPosition || PUESTO_PRINCIPAL_OPTIONS[0]);
  const [secondaryPosition, setSecondaryPosition] = useState<string>(profileData.secondaryPosition || PUESTO_PRINCIPAL_OPTIONS[0]);
  const [pasaporteUE, setPasaporteUE] = useState<string>(
    profileData.pasaporteUe === PasaporteUe.SI ? 'Sí' : 'No'
  );
  
  // Datos físicos
  const [estructuraCorporal, setEstructuraCorporal] = useState<string>(profileData.bodyStructure || ESTRUCTURA_CORPORAL_OPTIONS[0]);
  const [pieHabil, setPieHabil] = useState<string>(profileData.skillfulFoot || PIE_HABIL_OPTIONS[0]);
  const [altura, setAltura] = useState<number>(profileData.height || 0);
  const [peso, setPeso] = useState<number>(profileData.weight || 0);

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
    // Initialize experiences from profileData
    if (profileData) {
      setFormData(profileData);
      
      // Initialize general profile information
      setPrimaryPosition(profileData.primaryPosition || PUESTO_PRINCIPAL_OPTIONS[0]);
      setSecondaryPosition(profileData.secondaryPosition || PUESTO_PRINCIPAL_OPTIONS[0]);
      setPasaporteUE(profileData.pasaporteUe === PasaporteUe.SI ? 'Sí' : 'No');
      
      // Initialize physical data
      setEstructuraCorporal(profileData.bodyStructure || ESTRUCTURA_CORPORAL_OPTIONS[0]);
      setPieHabil(profileData.skillfulFoot || PIE_HABIL_OPTIONS[0]);
      setAltura(profileData.height || 0);
      setPeso(profileData.weight || 0);
      
      // Initialize experiences from trayectorias
      if (profileData.trayectorias && Array.isArray(profileData.trayectorias) && profileData.trayectorias.length > 0) {
        // Map existing experiences
        const updatedExperiences = profileData.trayectorias.map(exp => ({
          club: exp.club || '',
          fechaInicio: exp.fechaInicio || '',
          fechaFinalizacion: exp.fechaFinalizacion || '',
          categoriaEquipo: exp.categoriaEquipo || CATEGORIAS_OPTIONS[0],
          nivelCompetencia: exp.nivelCompetencia || NIVEL_COMPETENCIA_OPTIONS[0],
          logros: exp.logros || ''
        }));
        
        setExperiences(updatedExperiences);
      } else if (profileData.club) {
        // Handle legacy data format (single experience)
        const legacyExperience = {
          club: profileData.club || '',
          fechaInicio: profileData.fechaInicio || '',
          fechaFinalizacion: profileData.fechaFinalizacion || '',
          categoriaEquipo: profileData.categoriaEquipo || CATEGORIAS_OPTIONS[0],
          nivelCompetencia: profileData.nivelCompetencia || NIVEL_COMPETENCIA_OPTIONS[0],
          logros: profileData.logros || ''
        };
        
        setExperiences([legacyExperience]);
      }
    }
  }, [profileData]);

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
      // Filter out empty experiences
      const validExperiences = experiences.filter(exp => exp.club.trim() !== '');
      
      // Format each experience properly
      const formattedExperiences = validExperiences.map(exp => ({
        club: String(exp.club || ''),
        fechaInicio: String(exp.fechaInicio || ''),
        fechaFinalizacion: String(exp.fechaFinalizacion || ''),
        categoriaEquipo: String(exp.categoriaEquipo || ''),
        nivelCompetencia: String(exp.nivelCompetencia || ''),
        logros: String(exp.logros || '')
      }));
      
      // Prepare the updated data
      const updatedData = {
        ...formData,
        primaryPosition: primaryPosition,
        secondaryPosition: secondaryPosition,
        pasaporteUe: pasaporteUE === 'Sí' ? PasaporteUe.SI : PasaporteUe.NO,
        bodyStructure: estructuraCorporal,
        skillfulFoot: pieHabil,
        height: altura,
        weight: peso,
        trayectorias: formattedExperiences
      };

      if (token) {
        // Extract userId from token
        const userId = JSON.parse(atob(token.split(".")[1])).id;
        
        console.log("Sending data:", JSON.stringify(updatedData));
        
        await updateUserData(userId, updatedData);
        setShowNotification(true);
        setNotificationMessage('Información profesional actualizada correctamente');
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error updating professional info:', error);
      setShowErrorNotification(true);
      setErrorMessage(`Error al actualizar la información profesional: ${error.message || 'Error desconocido'}`);
      setTimeout(() => {
        setShowErrorNotification(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-[#1d5126]">Información Profesional</h2>
      <form onSubmit={handleSubmit}>
        {/* Sección de información general del perfil */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-medium mb-4 text-[#1d5126]">Datos Generales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Puesto Principal
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={primaryPosition}
                onChange={(e) => setPrimaryPosition(e.target.value)}
              >
                {PUESTO_PRINCIPAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Puesto Secundario
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={secondaryPosition}
                onChange={(e) => setSecondaryPosition(e.target.value)}
              >
                {PUESTO_PRINCIPAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Pasaporte UE
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={pasaporteUE}
                onChange={(e) => setPasaporteUE(e.target.value)}
              >
                {PASAPORTE_UE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Sección de datos físicos */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-medium mb-4 text-[#1d5126]">Datos Físicos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Estructura Corporal
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={estructuraCorporal}
                onChange={(e) => setEstructuraCorporal(e.target.value)}
              >
                {ESTRUCTURA_CORPORAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Pie Hábil
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={pieHabil}
                onChange={(e) => setPieHabil(e.target.value)}
              >
                {PIE_HABIL_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Altura (cm)
              </label>
              <input
                type="number"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={altura}
                min="0"
                max="250"
                onChange={(e) => setAltura(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={peso}
                min="0"
                max="150"
                onChange={(e) => setPeso(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
        
        {/* Sección de trayectoria */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-4 text-[#1d5126]">Trayectoria</h3>
          
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
                    Club/Institución
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
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={exp.categoriaEquipo}
                    onChange={(e) => handleExperienceChange(index, 'categoriaEquipo', e.target.value)}
                  >
                    {CATEGORIAS_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nivel de Competencia
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={exp.nivelCompetencia}
                    onChange={(e) => handleExperienceChange(index, 'nivelCompetencia', e.target.value)}
                  >
                    {NIVEL_COMPETENCIA_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
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
