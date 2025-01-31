"use client";

import { useContext, useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { IProfileData, UserType } from "@/Interfaces/IUser";
import PersonalInfo from "./PersonalInfo";
import ProfessionalInfo from "./ProfessionalInfo";
import PhysicalDetails from "./PhysicalDetails";
import { useRouter } from "next/navigation";
import { UserContext } from "../Context/UserContext";

const Profile = () => {
  const { token } = useContext(UserContext);
  const router = useRouter();
  const [userData, setUserData] = useState<IProfileData | null>(null);
  const [formData, setFormData] = useState<IProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<IProfileData>({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    nationality: "",
    location: "",
    birthday: "",
    genre: "",
    role: UserType.PLAYER,
    habilities: [],
    height: undefined,
    weight: undefined,
    skillfulFoot: "",
    bodyStructure: ""
  });

  const [activeTab, setActiveTab] = useState("personal");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Calcular el porcentaje de completado
  const calculateCompletion = (): number => {
    const totalFields = Object.keys(profileData).length;
    const filledFields = Object.values(profileData).filter(
      (value) => value !== "" && value !== null && value !== undefined
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const handleRedirect = () => {
    router.push("/PanelUsers/Player");
  }
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !formData) {
      setError('No se pudo actualizar. Intenta iniciar sesión nuevamente.');
      return;
    }

    try {
      const userId = JSON.parse(atob(token.split('.')[1])).id;

      const response = await fetch(`${apiUrl}/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar los datos.');
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      alert('Datos actualizados correctamente');
    } catch (error) {
      console.error('Error actualizando los datos:', error);
      setError('Ocurrió un error al actualizar los datos.');
    }
  };

  useEffect(() => {
    if (profileData) {
      setFormData(profileData); // Mantener formData sincronizado
    }
  }, [profileData]);

  return (
    <div className="mt-20">
          <form onSubmit={handleSubmit} className="p-6 max-w-4xl mx-auto">
        <h1 className="flex space-x-4 border-b pb-2 mt-4 mb-4 text-gray-700">Datos de perfil</h1>
        <ProgressBar progress={calculateCompletion()} />

        {/* Pestañas */}
        <div className="flex space-x-4 border-b pb-2 mt-4 mb-4 text-gray-700">
          {["Personal", "Profesional", "Físico"].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 mt-8 ${activeTab === tab ? "border-b-2 border-gray-500 shadow-md font-bold" : "text-gray-600"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Contenido de cada pestaña */}
        {activeTab === "Personal" && <PersonalInfo profileData={profileData} setProfileData={setProfileData} />}
        {activeTab === "Profesional" && <ProfessionalInfo profileData={profileData} setProfileData={setProfileData} />}
        {activeTab === "Físico" && <PhysicalDetails profileData={profileData} setProfileData={setProfileData} />}

        {/* Botones de Guardar y Cerrar Sesión */}
        <div className="flex justify-between mt-6">
          <button
            type="submit"
            className="p-2 text-white bg-green-600 hover:bg-green-700 rounded"
         onClick={handleRedirect}
         >
            Guardar cambios
          </button>
        
        </div>
      </form>
    </div>
  );
};

export default Profile;
