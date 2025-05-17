"use client";

import { useContext, useState, useEffect } from "react";
import { IProfileData } from "@/Interfaces/IUser";
import PersonalInfo from "./PersonalInfo";
import ProfessionalInfo from "./ProfessionalInfo";
import { UserContext } from "../Context/UserContext";
import { fetchUserData } from "../Fetchs/UsersFetchs/UserFetchs";


const Profile = () => {
  const { token } = useContext(UserContext);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<IProfileData | null>(null);
  const [activeTab, setActiveTab] = useState("Personal");

  useEffect(() => {
    if (token) {
      fetchUserData(token)
        .then((data) => {
          // Ensure trayectorias is initialized as an array if it doesn't exist
          if (!data.trayectorias || !Array.isArray(data.trayectorias)) {
            // If there's legacy data, convert it to the new format
            if (data.club) {
              data.trayectorias = [{
                club: String(data.club || ''),
                fechaInicio: String(data.fechaInicio || ''),
                fechaFinalizacion: String(data.fechaFinalizacion || ''),
                categoriaEquipo: String(data.categoriaEquipo || ''),
                nivelCompetencia: String(data.nivelCompetencia || ''),
                logros: String(data.logros || '')
              }];
            } else {
              // Initialize with empty array if no legacy data
              data.trayectorias = [];
            }
          } else {
            // Ensure each property is properly formatted
            data.trayectorias = data.trayectorias.map((exp: any) => ({
              club: String(exp.club || ''),
              fechaInicio: String(exp.fechaInicio || ''),
              fechaFinalizacion: String(exp.fechaFinalizacion || ''),
              categoriaEquipo: String(exp.categoriaEquipo || ''),
              nivelCompetencia: String(exp.nivelCompetencia || ''),
              logros: String(exp.logros || '')
            }));
          }
          setUserData(data);
        })
        .catch(() => setError("Error al cargar los datos."));
    }
  }, [token]);

 
  return (
    <div className="mt-12"> {/* Reducir el margen superior */}
      <div className="p-4 max-w-4xl mx-auto"> {/* Reducir el padding */}
        
        {/* Pestañas */}
        <div className="flex space-x-3 border-b pb-1 mt-2 mb-3 text-gray-700"> {/* Reducir el espacio y márgenes */}
          {["Personal", "Profesional"].map((tab) => (
            <button
              key={tab}
              className={`py-1.5 px-3 mt-6 ${
                activeTab === tab ? "bg-green-300 shadow-md font-semibold" : "text-gray-600"
              }`} // Reducir el tamaño del padding y la altura
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
  
        {/* Contenido de cada pestaña */}
        {activeTab === "Personal" && userData && <PersonalInfo profileData={userData} />}
        {activeTab === "Profesional" && userData && <ProfessionalInfo profileData={userData} />}
  
        {error && <p className="text-red-600 mt-2">{error}</p>} {/* Reducir el margen inferior del error */}
      </div>
    </div>
  );
}  

export default Profile;
