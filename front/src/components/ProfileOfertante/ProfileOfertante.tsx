"use client";

import { useContext, useState, useEffect } from "react";
import { IProfileData } from "@/Interfaces/IUser";
import PersonalInfo from "./PersonalInfo";
import ContactDetails from "./ContactDetails";
import { UserContext } from "../Context/UserContext";
import { fetchUserData } from "../Fetchs/UsersFetchs/UserFetchs";


const ProfileOfertante = () => {
  const { token } = useContext(UserContext);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<IProfileData | null>(null);
  const [activeTab, setActiveTab] = useState("Personal");

  useEffect(() => {
    if (token) {
      fetchUserData(token)
        .then((data) => setUserData(data))
        .catch(() => setError("Error al cargar los datos."));
    }
  }, [token]);

 
  return (
    <div className="mt-20">
      <div className="p-6 max-w-4xl mx-auto">
       
        {/* Pestañas */}
        <div className="flex space-x-4 border-b pb-2 mt-4 mb-4 text-gray-700 ">
          {["Personal", "Redes"].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 mt-8 ${
                activeTab === tab ? " bg-green-300 shadow-md font-bold" : "text-gray-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contenido de cada pestaña */}
        {activeTab === "Personal" && userData && <PersonalInfo profileData={userData} />}
        {activeTab === "Redes" && userData && <ContactDetails profileData={userData} />}

        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default ProfileOfertante;
