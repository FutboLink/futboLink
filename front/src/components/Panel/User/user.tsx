"use client";

import Image from "next/image";
import { useState, useEffect, useContext } from "react";
import userH from "../../../helpers/helperUser"; 
import AOS from "aos";
import "aos/dist/aos.css";  
import { IProfileData} from "@/Interfaces/IUser";
import { UserContext } from "@/components/Context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const UserProfile = () => {
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
    <div className="flex min-h-screen mt-24 text-black bg-gray-50">
      {/* Panel izquierdo: Datos del usuario y pestañas */}
      <div className="w-72 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-l-lg shadow-lg">
        {/* Datos Básicos del Usuario */}
        <div className="mb-8 flex flex-col items-center space-y-4">
        <Image
  src={userData ? 
       (userData.imgUrl || 
       (userData.genre === "Masculino" ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png" :
        userData.genre === "Femenino" ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740487974/Captura_de_pantalla_2025-02-25_095231_yf60vs.png" :
        "https://res.cloudinary.com/dagcofbhm/image/upload/v1740488144/Captura_de_pantalla_2025-02-25_095529_gxe0gx.png"))
       : "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"}  // Imagen predeterminada
  alt={userData?.name || "Foto de perfil"}
  width={100}
  height={100}
  className="rounded-full mb-4 md:mb-0"
/>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">
              {userData?.name} {userData?.lastname}
            </h2>
            <p className="text-lg">{userData?.puesto}</p>
            <p className="text-sm">{userData?.email}</p>
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
                <span className="text-lg">👤</span>
                <span>Mi Perfil</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange("skills")}
                className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
              >
                <span className="text-lg">⚡</span>
                <span>Información Profesional</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange("appliedOffers")}
                className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
              >
                <span className="text-lg">📜</span>
                <span>Ofertas Aplicadas</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange("config")}
                className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
              >
                <span className="text-lg">⚙️</span>
                <span>Configuración</span>
              </button>
            </li>
          </ul>
        </nav>
        <button
        onClick={handleLogOut}
        className="mt-4 p-2 text-white bg-green-800 rounded"
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
              <div>
                <p className="text-lg text-gray-600 mb-4">
                  <span className="font-medium">Fecha de Nacimiento:</span>{" "}
                  {userData?.birthday  || undefined}
                </p>
                <p className="text-lg text-gray-600 mb-4">
                  <span className="font-medium text-gray-700">Edad:</span>{" "}
                  {userData?.age}
                </p>
                <p className="text-lg text-gray-600 mb-4">
                  <span className="font-medium">Género:</span> {userData?.genre}
                </p>
                <p className="text-lg text-gray-600 mb-4">
                  <span className="font-medium text-gray-700">Teléfono:</span>{" "}
                  {userData?.phone}
                </p>
               
                <div className="flex items-center space-x-4 mb-4">
  <span className="font-medium text-gray-700">Redes Sociales:</span>
  
  {/* Twitter (X) */}
  {userData?.socialMedia?.x ? (
    <Link
    href={`https://www.youtube.com/${userData.socialMedia.youtube}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-blue-500 hover:text-blue-700"
    >
      <Image
        src="/logo-black.png" // Asegúrate de tener el icono correcto de Twitter (X)
        alt="Twitter Icon"
        width={15}
        height={15}
        className="ml-2 cursor-pointer"
      />
      {userData.socialMedia.x}
    </Link>
  ) : (
    <span className="text-gray-500">No disponible</span>
  )}
  
  {/* Transfermarkt */}
  {userData?.socialMedia?.transfermarkt ? (
    <Link
      href={`https://www.transfermarkt.com/${userData.socialMedia.transfermarkt}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-blue-500 hover:text-blue-700"
    >
      <Image
        src="/transfermarkt.png" // Asegúrate de tener el icono correcto de Transfermarkt
        alt="Transfermarkt Icon"
        width={25}
        height={25}
        className="ml-2 cursor-pointer"
      />
      {userData.socialMedia.transfermarkt}
    </Link>

    
  ) : (
    <span className="text-gray-500">No disponible</span>
  )}
   {/* Twitter (X) */}
   {userData?.socialMedia?.youtube ? (
    <Link
      href={`https://twitter.com/${userData.socialMedia.youtube}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-blue-500 hover:text-blue-700"
    >
      <Image
        src="/logo-black.png" // Asegúrate de tener el icono correcto de Twitter (X)
        alt="Youtube Icon"
        width={15}
        height={15}
        className="ml-2 cursor-pointer"
      />
      {userData.socialMedia.youtube}
    </Link>
  ) : (
    <span className="text-gray-500">No disponible</span>
  )}
</div>



              
                
              </div>

              {/* Video de Presentación incrustado a la derecha */}
              <div className="flex justify-center items-center">
                <span className="font-medium text-lg mb-4 text-gray-500">
                  Video de Presentación:
                </span>
                <div className="relative w-full max-w-[500px] h-[250px] overflow-hidden rounded-lg bg-black ml-4">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/lscs_jCKz58?si=gKpwYaZit93EGAlZ"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
            <Link href={"/profile"}>
            <div className="rounded border-2 md:w-1/4 sm:1/6 text-center bg-blue-300 hover:bg-blue-400 hover:cursor-pointer p-2 text-gray-800">
                Editar Perfil
              </div>
              </Link>
          </div>
        )}

       {/* Sección de Habilidades */}
{activeSection === "skills" && (
  <div className="bg-white p-6 rounded-lg shadow-lg mb-6" data-aos="fade-up">
    <h3 className="text-xl font-semibold mb-4">Datos Generales</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Título Puesto Principal */}
      <div>
        <h4 className="font-semibold text-lg">Puesto Principal</h4>
        <div className="bg-gray-100 p-4 rounded-md shadow-sm">
          <p className="text-gray-500">{userData?.primaryPosition}</p>
        </div>
      </div>

      {/* Título Puesto Secundario */}
      <div>
        <h4 className="font-semibold text-lg mt-4 md:mt-0">Puesto Secundario</h4>
        <div className="bg-gray-100 p-4 rounded-md shadow-sm">
          <p className="text-gray-500">{userData?.secondaryPosition}</p>
        </div>
      </div>

      {/* Título Pasaporte UE */}
      <div className="mt-4 md:mt-0">
        <h4 className="font-semibold text-lg">Pasaporte UE</h4>
        <div className="bg-gray-100 p-4 rounded-md shadow-sm">
          <p className="text-gray-500">{userData?.pasaporteUe}</p>
        </div>
      </div>
    </div>

    {/* Separador con fondo diferente */}
    <div className="bg-gray-300 m-4 p-2"></div>

    {/* Sección de Datos Físicos */}
    <h3 className="text-xl font-semibold mt-4 mb-4">Datos Físicos</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {userData?.skillfulFoot && (
        <div className="bg-gray-100 p-4 rounded-md shadow-sm">
          <h4 className="font-semibold text-lg">Pie Hábil</h4>
          <p className="text-gray-500">{userData.skillfulFoot}</p>
        </div>
      )}
      {userData?.bodyStructure && (
        <div className="bg-gray-100 p-4 rounded-md shadow-sm">
          <h4 className="font-semibold text-lg">Estructura Corporal</h4>
          <p className="text-gray-500">{userData.bodyStructure}</p>
        </div>
      )}
    </div>

    {/* Separador con fondo diferente */}
    <div className="bg-gray-300 m-4 p-2"></div>

    {/* Sección de Trayectoria */}
    <h3 className="text-xl font-semibold mt-4 mb-4">Trayectoria</h3>
    <div className="bg-gray-100 p-4 rounded-md shadow-sm">
      <h4 className="font-semibold text-lg">Club Almagro</h4>
      <p className="text-gray-500">1-03-2020</p>
      <p className="text-gray-500">1-03-2022</p>
      <p className="text-gray-500">Semiprofesional</p>
    </div>
  </div>
)}

{/* Sección de Ofertas Aplicadas */}
{activeSection === "appliedOffers" && (
  <div className="bg-white p-6 rounded-lg shadow-lg mb-6" data-aos="fade-up">
    <h3 className="text-xl font-semibold mb-4">Ofertas Aplicadas</h3>
    <ul className="space-y-6">
      {userH.appliedOffers.map((offer, index) => (
        <li key={index} className="bg-gray-100 p-4 rounded-md shadow-sm">
          <h4 className="font-semibold text-lg">{offer.title}</h4>
          <p className="text-gray-500">{offer.description}</p>
          <p className="text-gray-500 text-sm">Fecha: {offer.date}</p>
        </li>
      ))}
    </ul>
  </div>
)}

{/* Sección de Configuración */}
{activeSection === "config" && (
  <div className="bg-white p-6 rounded-lg shadow-lg mb-6" data-aos="fade-up">
    <h3 className="text-xl font-semibold mb-4">Configuración</h3>
    <div className="space-y-6">
      <h4 className="font-semibold text-lg">Cambiar contraseña</h4>
      <h4 className="font-semibold text-lg">Idioma</h4>
      <h4 className="font-semibold text-lg">Suscripción</h4>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default UserProfile;
