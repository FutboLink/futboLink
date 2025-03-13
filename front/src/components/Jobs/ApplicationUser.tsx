"use client"
import React, { useContext, useState } from "react";
import { IJobApplication, YesOrNo, YesOrNotravell } from "@/Interfaces/IOffer";
;
import useNationalities from "../Forms/FormUser/useNationalitys";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import { fetchApplications } from "../Fetchs/AdminFetchs/AdminUsersFetch";
import { UserContext } from "../Context/UserContext";

const position = [
  "Jugador", "Entrenador", "Fisioterapeuta", "Preparador Físico", "Analista",
  "Gerente", "Entrenador de Porteros", "Coordinador", "Ojeador Scout", "Marketing Digital",
  "Director Deportivo", "Comercial", "Jefe de Reclutamiento", "Periodista", "Nutricionista",
  "Administrativo", "Diseñador Gráfico", "Director Técnico", "Médico", "Psicólogo",
  "Recursos Humanos", "Abogado", "Científico Deportivo", "Director de Negocio", "Editor Multimedia",
  "Finanzas", "Árbitro", "Delegado", "Profesor", "Ejecutivo", "Inversor", "Utillero", "Agente",
  "Representante", "Terapeuta"
];

const sportGenres = ["Masculino", "Femenino"];
const categories = ["Amateur", "Semiprofesional", "Profesional", "Fútbol base"];
const sports = ["Fútbol 11", "Futsal", "Fútbol Base", "Fútbol Playa", "Pruebas"];
const minExperience = ["Amateur", "Semiprofesional", "Profesional", "Experiencia en ligas similares"];




export default function ApplicationUser() {
        const { nationalities} = useNationalities();
        const [selectedNationality, setSelectedNationality] = useState<string>('');
        const [isOpen, setIsOpen] = useState<boolean>(false); 
        const [search, setSearch] = useState<string>('');
        const {user} = useContext(UserContext)
        const userId = user?.id;
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
        
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<IJobApplication>({
       
        nationality: "",
        location:"",
        position: "",
        category: "",
        sport: "",
        age:0,
        transport: [],
        sportGenres:"",
        minExperience: "",
        availabilityToTravel: "Si" as YesOrNotravell, 
        euPassport: "Si" as YesOrNo,
        gmail: "",
    });


    

 // Maneja el cambio en el campo de búsqueda
 const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);  // Actualiza el texto de búsqueda
    setIsOpen(true);  // Asegura que el dropdown se mantenga abierto mientras se escribe
  };


  // Maneja la selección de una nacionalidad
  const handleSelectNationality = (value: string) => {
    setSelectedNationality(value);  // Actualiza selectedNationality con el valor seleccionado
    setFormData((prevState) => ({
      ...prevState,
      nationality: value,  // Actualiza el estado del formulario
    }));
    setSearch('');  // Limpia el campo de búsqueda
    setIsOpen(false);  // Cierra el dropdown una vez se seleccione una opción
  };

   // Maneja la apertura y cierre del menú
   const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async () => {
    // Mostrar la notificación "Enviando..."
    setNotificationMessage("Enviando solicitud...");
    setShowNotification(true);
  
    // Aseguramos que la notificación se vea antes de enviar la solicitud
    setTimeout(async () => {
      setIsSubmitting(true); // Activar estado de envío
  
      try {
        const application = { jobId, userId };
        
        // Realizamos la solicitud de aplicación
        await fetchApplications(application);
  
        // Si la solicitud fue exitosa, mostramos un mensaje de éxito
        setNotificationMessage("Has enviado la solicitud.");
        setShowNotification(true);
  
        // Mantenemos la notificación visible por 2 segundos antes de cerrarla
        setTimeout(() => {
          setShowNotification(false);
        }, 2000);
  
      } catch (error) {
        console.error('Error al enviar la aplicación:', error);
  
        // Si es una instancia de Error, mostramos el mensaje de error
        if (error instanceof Error) {
          setNotificationMessage(`Error: ${error.message}`);
        } else {
          setNotificationMessage("Error desconocido al enviar la solicitud.");
        }
  
        setShowNotification(true);
  
        // Ocultar la notificación después de 2 segundos
        setTimeout(() => {
          setShowNotification(false);
        }, 2000);
  
      } finally {
        setIsSubmitting(false); // Desactivar el estado de envío
      }
    }, 500); // Aseguramos que la notificación se vea antes de iniciar la solicitud
  };
  


    return (
        <div className="max-w-6xl mt-24 mx-auto p-4 bg-gray-100  text-gray-700 rounded-lg shadow-lg shadow-gray-400  border-2 hover:cursor-pointer ">
           <div className="max-w-2xl  mx-auto p-4 ">
    <h1 className="text-xl font-bold mb-4 text-center bg-gray-600 text-white p-2 rounded">
        Postularse a Oferta Laboral
    </h1>
</div>

        <form className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4">
                
               
    
               {/* Nacionalidad */}
        <div className="col-span-1 mb-4 relative">
          <label htmlFor="nationalitySearch" className="block text-sm font-bold mb-2">Buscar Nacionalidad</label>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar nacionalidad..."
            onClick={toggleDropdown}
            className="w-full border text-gray-600 border-gray-300 rounded-lg p-1 mb-1"
          />
        </div>
  
        {/* Nacionalidad seleccionada */}
        <div className="col-span-1 relative mb-4">
          <label htmlFor="nationality" className="block text-sm font-bold mb-2">Nacionalidad seleccionada
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={selectedNationality}
            readOnly
            className="w-full border text-gray-600 border-gray-300 rounded-lg p-1 mb-1"
          />
        </div>
  
        <div className="flex flex-col">
                    <label className="text-sm font-bold mb-2">Ciudad:</label>
                    <input
                        type="text"
                        className="p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ciudad de la oferta laboral"
                    />
                </div>
    
        {/* Dropdown de opciones */}
        {isOpen && (
          <div className="absolute z-10 w-full sm:w-auto max-w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
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
    
                <div className="flex flex-col">
                    <label className="text-sm font-bold  mb-2">Posición</label>
                    <select
                        className="p-1 mb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData,position: e.target.value })}
                    >
                        {position.map((position, index) => (
                            <option key={index} value={position}>{position}</option>
                        ))}
                    </select>
                </div>
    
                <div className="flex flex-col">
                    <label className="text-sm font-bold mb-2">Categoría</label>
                    <select
                        className="p-1 mb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex flex-col">
                    <label className="text-sm font-bold mb-2">Género deporte</label>
                    <select
                        className="p-1 mb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
                        value={formData.sportGenres}
                        onChange={(e) => setFormData({ ...formData,sportGenres: e.target.value })}
                    >
                        {sportGenres.map((sportGenres, index) => (
                            <option key={index} value={sportGenres}>{sportGenres}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-bold mb-2">Modalidad</label>
                    <select
                        className="p-1 mb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
                        value={formData.sport}
                        onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    >
                        {sports.map((sport, index) => (
                            <option key={index} value={sport}>{sport}</option>
                        ))}
                    </select>
                </div>
 
               

      
                

          

                
<div className="flex flex-col">
    <label className="text-sm font-bold mb-2">Transporte</label>
    <input
        type="text"
        className="p-1 mb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-600 focus:ring-green-500"
        value={formData.transport.join(', ')} 
        onChange={(e) => {
            const transportArray = e.target.value.split(',').map(item => item.trim());
            setFormData({
                ...formData,
                transport: transportArray, 
            });
        }}
        placeholder="Escribe separados por coma"
    />
</div>


                <div className="flex flex-col">
                    <label className="text-sm font-bold mb-2">Edad:</label>
                    <input
                    type="number"
                    className="p-1 mb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
                    value={formData.age === 0 ? '' : formData.age}
                    onChange={(e) => {
                        const value = e.target.value;
                        setFormData({
                            ...formData,
                            age: value === '' ? 0 : Number(value),
                        });
                    }}
                />
                </div>
    
             

              
                                           
    
                <div className="flex flex-col">
                    <label className="text-sm font-bold mb-2">Experiencia mínima</label>
                    <select
                        className="p-1 mb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
                        value={formData.minExperience}
                        onChange={(e) => setFormData({ ...formData,minExperience: e.target.value })}
                    >
                        {minExperience.map((minExperience, index) => (
                            <option key={index} value={minExperience}>{minExperience}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-bold mb-2">Mínimo de experiencia:</label>
                    <input
                        type="text"
                        className="p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
                        value={formData.minExperience}
                        onChange={(e) => setFormData({ ...formData, minExperience: e.target.value })}
                        placeholder="Mínimo de experiencia de la oferta laboral"
                    />
                </div>
    
                <div className="flex flex-col">
                    <label className="text-sm font-bold mb-2">Disponibilidad para viajar</label>
                   
                        <select
                        className="p-1 mb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
                        value={formData.availabilityToTravel}
                        onChange={(e) => setFormData({ ...formData, availabilityToTravel: e.target.value as YesOrNotravell })} 
                    >
                        <option value="Si">Sí</option>
                        <option value="No">No</option>
                    </select>

                </div>
    
                <div className="flex flex-col">
                    <label className="text-sm font-bold mb-2">Pasaporte de la UE</label>
                    <select
                        className="p-1 mb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
                        value={formData.euPassport}
                        onChange={(e) => setFormData({ ...formData, euPassport: e.target.value as YesOrNo })}
                    >
                        <option value="Si">Sí</option>
                        <option value="No">No</option>
                    </select>

                </div>
    
                <div className="flex flex-col">
                    <label className="text-sm font-bold mb-2">Gmail (opcional)</label>
                    <input
                        type="email"
                        className="p-1 mb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
                        value={formData.gmail}
                        onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                    />
                </div>
                <div className="flex justify-center items-center">
  <button
    className="px-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    onClick={handleSubmit}
    disabled={isSubmitting}
  >
    {isSubmitting ? 'Enviando...' : 'Enviar Postulación'}
  </button>
</div>

            </form>
            {showNotification && (
        <div className="absolute top-12 left-0 right-0 mx-auto w-max z-50">
          <NotificationsForms message={notificationMessage} />
        </div>
      )}
        </div>
    );
    
};


