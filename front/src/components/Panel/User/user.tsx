"use client";

import Image from "next/image";
import { useState, useEffect, useContext } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { IProfileData } from "@/Interfaces/IUser";
import { UserContext } from "@/components/Context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaBolt, FaCog,   FaUser, FaYoutube } from "react-icons/fa";
import { PiSoccerBall } from "react-icons/pi";
import { FaX } from "react-icons/fa6";

const UserProfile = () => {
  const { token, logOut } = useContext(UserContext);
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
    router.push("/");
  };

 
  
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return ""; // Retorna vacío si no hay URL
  
    const regex = /(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([\w-]+)/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  };
  

  useEffect(() => {
    if (token) {
      try {
        const userId = JSON.parse(atob(token.split(".")[1])).id;

        if (userId) {
          fetch(`${apiUrl}/user/${userId}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to fetch user data");
              }
              return response.json();
            })
            .then((data) => {
              setUserData(data);
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
              setError("Failed to load user data.");
            });
        }
      } catch (error) {
        setError("Error decoding token or fetching user data.");
        console.error("Error:", error);
      }
    }
  }, [token, apiUrl]);

  // Inicializamos AOS cuando el componente se monta
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div className="flex min-h-screen mt-24 text-black bg-gray-50 flex-col sm:flex-row">
      {/* Panel izquierdo */}
      <div className="w-full sm:w-72 bg-gradient-to-r from-[#1d5126] to-[#3e7c27] text-white p-6 rounded-t-lg sm:rounded-l-lg shadow-lg sm:shadow-none sm:mr-4">
        <div className="mb-8 flex flex-col items-center space-y-4">
          <Image
            src={
              userData
                ? userData.imgUrl ||
                  (userData.genre === "Masculino"
                    ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"
                    : userData.genre === "Femenino"
                    ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740487974/Captura_de_pantalla_2025-02-25_095231_yf60vs.png"
                    : "https://res.cloudinary.com/dagcofbhm/image/upload/v1740488144/Captura_de_pantalla_2025-02-25_095529_gxe0gx.png")
                : "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"
            } // Imagen predeterminada
            alt={userData?.name || "Foto de perfil"}
            width={100}
            height={100}
            className="rounded-full mb-4 md:mb-0"
          />
           <div className="space-y-2 text-center">
           <h2 className="text-2xl font-semibold">
              {userData?.name} {userData?.lastname}
            </h2>
            <h2 className="text-xl font-semibold">{userData?.puesto}</h2>
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
      <FaUser className="text-white text-lg" />
      <span className="text-white">Mi Perfil</span>
    </button>
  </li>
  <li>
    <button
      onClick={() => handleSectionChange("skills")}
      className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
    >
      <FaBolt className="text-white text-lg" />
      <span className="text-white">Información Profesional</span>
    </button>
  </li>
  <li>
    <button
      onClick={() => handleSectionChange("config")}
      className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
    >
      <FaCog className="text-white text-lg" />
      <span className="text-white">Configuración</span>
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

      <div className="flex-1 p-1 ">
        <div className="bg-gray-200 border-l-4 border-verde-oscuro text-gray-700 p-4 max-w-xl mx-auto text-center rounded-lg">
          <p className="font-semibold text-sm">
            Es importante que completes tus datos y los mantengas actualizados
            para que los reclutadores conozcan más sobre ti.
          </p>
        </div>
        {activeSection === "profile" && (
  <div className="p-6 bg-gray-50 text-gray-700" data-aos="fade-up">
    <h3 className="text-2xl font-semibold mb-6 text-[#1d5126]">Información</h3>

    {/* Contenedor Principal con Flex */}
    <div className="flex flex-col sm:flex-col md:flex-row justify-between gap-6">
      
      {/* Sección de Información y Redes Sociales */}
      <div className="md:w-1/2">
        <div className="flex items-start">
          <Image
            src={userData?.imgUrl || "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"}
            alt={userData?.name || "Foto de perfil"}
            width={100}
            height={100}
            className="rounded-full mb-4 md:mb-0"
          />
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-[#1d5126]">
              {userData?.name} {userData?.lastname}
            </h2>
            <div className="text-gray-700">
            <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                <strong>Nacionalidad:</strong> {userData?.nationality || "No disponible"}
              </p>
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
    

              {/* Redes Sociales */}
              <div className="mt-4">
                <strong>Redes Sociales:</strong>
                <div className="flex space-x-4 mt-2 items-center">
                  {userData?.socialMedia?.x && (
                    <a href={`https://twitter.com/${userData.socialMedia.x}`} target="_blank" rel="noopener noreferrer"
                      className=" hover:text-gray-800">
                      <FaX size={24} />
                    </a>
                  )}
                  {userData?.socialMedia?.youtube && (
                    <a href={`https://www.youtube.com/${userData.socialMedia.youtube}`} target="_blank" rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-800">
                      <FaYoutube size={24} />
                    </a>
                  )}
                 {userData?.socialMedia?.transfermarkt && (
  <a
    href={`https://www.transfermarkt.com/${userData.socialMedia.transfermarkt}`}
    target="_blank"
    rel="noopener noreferrer"
    className="hover:opacity-80"
  >
    <Image
      src="/transfermarkt.png"
      alt="Transfermarkt"
      width={60}
      height={60}
    />
  </a>
)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Editar Perfil */}
        <Link href={"/profile"}>
          <div className="rounded border-2 md:w-1/2 text-center bg-[#1d5126] hover:bg-white hover:text-gray-700 hover:border-2 hover:border-[#1d5126]cursor-pointer p-2 text-white font-bold mt-4">
            Editar Perfil
          </div>
        </Link>
      </div>
{/* Video de Presentación */}
<div className="md:w-1/2">
  <span className="font-medium text-lg mb-4 text-gray-500 block">
    Video de Presentación:
  </span>
  <div className="relative w-full h-[250px] overflow-hidden rounded-lg bg-black">
    {userData?.videoUrl ? (
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={getYouTubeEmbedUrl(userData.videoUrl)}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
    ) : (
      <p className="text-white text-center p-4">No hay video disponible</p>
    )}
  </div>
</div>





    </div>
  </div>
)}


     {/* Sección de Habilidades */}
{activeSection === "skills" && (
  <div className="flex-1 p-6 bg-gray-50 text-gary-700 transition-opacity duration-300" data-aos="fade-up">
    <h3 className="text-xl font-semibold text-[#1d5126]">Datos Generales</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div>
        <h4 className="font-semibold text-lg text-gray-800">Puesto Principal</h4>
        <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-2 rounded-md">
          {userData?.primaryPosition}
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-lg text-gray-800">Puesto Secundario</h4>
        <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-2 rounded-md">
          {userData?.secondaryPosition}
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-lg text-gray-800">Pasaporte UE</h4>
        <p className="border border-[#1d5126 text-gray-700 bg-[#f5f5f5] p-2 rounded-md">
          {userData?.pasaporteUe}
        </p>
      </div>
    </div>
    <div className="bg-gray-300 m-4 p-2"></div>
    <h3 className="text-xl font-semibold text-[#1d5126] mt-4">Datos Físicos</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {userData?.skillfulFoot && (
        <div>
          <h4 className="font-semibold text-lg text-gray-800">Pie Hábil</h4>
          <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-2 rounded-md">
            {userData.skillfulFoot}
          </p>
        </div>
      )}
      {userData?.bodyStructure && (
        <div>
          <h4 className="font-semibold text-lg text-gray-800">Estructura Corporal</h4>
          <p className="border border-[#1d5126] bg-[#f5f5f5] text-gray-700 p-2 rounded-md">
            {userData.bodyStructure}
          </p>
        </div>
      )}
    </div>
    <div className="bg-gray-300 m-4 p-2"></div>
    <h3 className="text-xl font-semibold text-[#1d5126] mt-4 ">Trayectoria</h3>
    <div className="border border-[#1d5126] bg-[#f5f5f5] p-4 rounded-md">
      <h4 className="font-semibold text-lg text-gray-800">Club Almagro</h4>
      <p>1-03-2020</p>
      <p>1-03-2022</p>
      <p>Semiprofesional</p>
    </div>
  </div>
)}


        {/* Sección de Configuración */}
        {activeSection === "config" && (
          <div
            className="bg-white p-6 rounded-lg shadow-lg mb-6"
            data-aos="fade-up"
          >
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
