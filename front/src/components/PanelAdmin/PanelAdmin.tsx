"use client";

import Image from "next/image";
import { useState, useEffect, useContext } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; 
import {  FaBolt, FaChartBar, FaCog, FaInstagram, FaUser, FaUserCog, FaUsers, FaYoutube, FaShieldAlt } from "react-icons/fa";
import { IProfileData} from "@/Interfaces/IUser";
import { UserContext } from "@/components/Context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Offer from "./Ofertas/Offer";
import AllApplications from "./Applications/AllApplications";
import { PiSoccerBall } from "react-icons/pi";
import { FaX } from "react-icons/fa6";
import SuccessCasesAdmin from "./SuccessCasesAdmin";
import UsersComponent from "./Users/UsersComponent";
import VerificationRequests from "./VerificationRequests/VerificationRequests";

const PanelAdmin = () => {
  const {token,logOut} = useContext(UserContext);
  const [activeSection, setActiveSection] = useState("profile");
  const [userData, setUserData] = useState<IProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
 
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
 const router = useRouter();
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleLogOut = () => {
    logOut(); 
    router.push('/'); 
  };
  
  
  useEffect(() => {
    if (token) {
      try {
        const userId = JSON.parse(atob(token.split('.')[1])).id;

        if (userId) {
          fetch(`${apiUrl}/user/${userId}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error('Failed to fetch user data');
              }
              return response.json();
            })
            .then((data) => {
              setUserData(data);
            })
            .catch((error) => {
              console.error('Error fetching user data:', error);
              setError('Failed to load user data.');
            });
        }
      } catch (error) {
        setError('Error decoding token or fetching user data.');
        console.error('Error:', error);
      }
    }
  }, [token, apiUrl]);

  // Inicializamos AOS cuando el componente se monta
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div className="flex min-h-screen mt-24 text-black bg-gray-50 flex-col sm:flex-row">
    {/* Panel izquierdo: Datos del usuario y navegación */}
    <div className="w-full sm:w-72 bg-gradient-to-r from-[#1d5126] to-[#3e7c27] text-white p-6 rounded-t-lg sm:rounded-l-lg shadow-lg sm:shadow-none sm:mr-4">
      <div className="mb-8 flex flex-col items-center space-y-4">
        <Image
          src={
            userData?.imgUrl ||
            (userData?.genre === "Masculino"
              ? "/male-avatar.png"
              : userData?.genre === "Femenino"
              ? "/female-avatar.png"
              : "/default-avatar.png")
          }
          alt={userData?.name || "Foto de perfil"}
          width={100}
          height={100}
          className="rounded-full border-4 border-white"
        />
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold">
            {userData?.name} {userData?.lastname}
          </h2>
          <h2 className="text-xl font-semibold">{userData?.nameAgency}</h2>
          <p className="text-sm">{userData?.email}</p>
          <p className="text-sm">{userData?.phone}</p>
        </div>
      </div>

        {/* Barra de navegación (pestañas) */}
        <nav className="space-y-2">
       
       <ul>
         <li>
           <button
             onClick={() => handleSectionChange("profile")}
             className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
           >
             <FaUser className="text-white text-lg" />
             <span className="text-white">Mi Perfil</span>
           </button>
         </li>
            <li>
              <button
                onClick={() => handleSectionChange("postulaciones")}
                className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
                >
                <FaBolt className="text-white text-lg" />
                <span className="text-white">Postulaciones</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange("users")}
                className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
                >
                <FaUsers className="text-white text-lg" />
                <span className="text-white">Usuarios</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange("appliedOffers")}
                className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
                >
            <FaChartBar className="text-white text-lg" />
<span className="text-white">Estadísticas de Ofertas</span>

              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange("successCases")}
                className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
                >
                <PiSoccerBall className="text-white text-lg" />
                <span className="text-white">Casos de Éxito</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange("verifications")}
                className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
                >
                <FaShieldAlt className="text-white text-lg" />
                <span className="text-white">Verificaciones</span>
              </button>
            </li>
            
          </ul>
        </nav>
        <button
          onClick={handleLogOut}
          className="mt-6 w-full py-2 rounded-lg text-white text-center font-bold border-2 border-white hover:bg-white hover:text-gray-700"
        >
          Cerrar sesión
        </button>
      </div>

     
        {/* Si hay un error, mostramos un mensaje */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

      <div className="flex-1 p-8">
     
{/* Sección de Perfil */}
{activeSection === "profile" && (
  <div
    className="bg-white p-10 rounded-xl shadow-xl mb-8 max-w-5xl mx-auto min-h-[500px]"
    data-aos="fade-up"
  >
    <h3 className="text-2xl font-semibold mb-6 text-gray-800">
      Información
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Sección de Información */}
      <div className="flex flex-col sm:flex-col md:flex-row justify-between gap-6">
        <div className="md:w-1/2">
          <div className="flex items-start">
         
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-[#1d5126]">
                {userData?.name} {userData?.lastname}
              </h2>
              <div className="text-gray-700">
                <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                  <strong>Fecha de Nacimiento:</strong> {userData?.birthday || "No disponible"}
                </p>
                <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                  <strong>Edad:</strong> {userData?.age} años
                </p>
                <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                  <strong>Género:</strong> {userData?.genre}
                </p>
                <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                  <strong>Teléfono:</strong> {userData?.phone}
                </p>
                <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                  <strong>Ubicación:</strong> {userData?.location}
                </p>

              
             
           
              </div>
            </div>
          </div>

          {/* Botón Editar Perfil */}
          <Link href={"/profile"}>
            <div className="rounded border-2 md:w-1/2 text-center bg-[#1d5126] hover:bg-white hover:text-gray-700 hover:border-2 hover:border-[#1d5126] cursor-pointer p-2 text-white font-bold mt-4">
              Editar Perfil
            </div>
          </Link>
        </div>
      </div>
      
      {/* Otras secciones del perfil */}
      
    </div>
  </div>
)}

{/* Sección de Postulaciones */}
{activeSection === "postulaciones" && (
  <div
    className="bg-white p-6 rounded-xl shadow-lg"
    data-aos="fade-up"
  >
    <AllApplications />
  </div>
)}

{/* Sección de Usuarios */}
{activeSection === "users" && (
  <div
    className="bg-white p-6 rounded-xl shadow-lg"
    data-aos="fade-up"
  >
    <h3 className="text-2xl font-semibold mb-6 text-gray-800">
      Gestión de Usuarios
    </h3>
    <UsersComponent />
  </div>
)}

{/* Sección de Estadísticas de Ofertas */}
{activeSection === "appliedOffers" && (
  <div
    className="bg-white p-6 rounded-xl shadow-lg"
    data-aos="fade-up"
  >
    <Offer />
  </div>
)}

{/* Sección de Casos de Éxito */}
{activeSection === "successCases" && (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <SuccessCasesAdmin />
  </div>
)}

{/* Sección de Verificaciones */}
{activeSection === "verifications" && (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <VerificationRequests />
  </div>
)}
</div>
   
    </div>
  );
};

export default PanelAdmin;
