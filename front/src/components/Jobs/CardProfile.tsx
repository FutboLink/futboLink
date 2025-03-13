import { useState } from "react";
import Image from "next/image";
import { IProfileData } from "@/Interfaces/IUser";
import { FaUser, FaRunning, FaBriefcase } from "react-icons/fa"; 
import BackButton from "../utils/BackButton";

interface CardProfileProps {
  profile: IProfileData;
}

const sections = ["Perfil", "Datos Físicos", "Trayectoria"];

const CardProfile: React.FC<CardProfileProps> = ({ profile }) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]);

  return (
    <div className="flex min-h-screen mt-24 text-black bg-gray-50 flex-col sm:flex-row">
      {/* Barra Lateral */}
      <div className="w-full sm:w-72 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-lg sm:rounded-l-lg shadow-lg sm:shadow-none sm:mr-4">
        <div className="mb-8 flex flex-col items-center space-y-4">
        <Image
  src={profile ? 
       (profile.imgUrl || 
       (profile.genre === "Masculino" ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png" :
        profile.genre === "Femenino" ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740487974/Captura_de_pantalla_2025-02-25_095231_yf60vs.png" :
        "https://res.cloudinary.com/dagcofbhm/image/upload/v1740488144/Captura_de_pantalla_2025-02-25_095529_gxe0gx.png"))
       : "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"}  // Imagen predeterminada
  alt={profile?.name || "Foto de perfil"}
  width={100}
  height={100}
  className="rounded-full mb-4 md:mb-0"
/>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">
              {profile.name} {profile.lastname}
            </h2>
            <h2 className="text-2xl font-semibold">{profile.role}</h2>
            <p className="text-sm">{profile.phone}</p>
            <p className="text-sm">{profile.email}</p>
          </div>
        </div>

        {/* Barra de navegación */}
        <nav className="space-y-2">
          <ul>
            {sections.map((section, index) => (
              <li key={section}>
                <button
                  onClick={() => setActiveSection(section)}
                  className={`w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200 ${
                    activeSection === section ? "bg-green-700 text-white mb-2" : "mb-1"
                  }`}
                >
                  {/* Iconos para cada sección */}
                  {index === 0 && <FaUser className="text-xl" />}
                  {index === 1 && <FaRunning className="text-xl" />}
                  {index === 2 && <FaBriefcase className="text-xl" />}
                  <span>{section}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <BackButton/>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-6 bg-gray-50 text-black">
        {activeSection === "Perfil" && (
          <div className="transition-opacity duration-300">
            {/* Imagen y Datos de Perfil */}
            <div className="flex items-start">
            <Image
  src={profile ? 
       (profile.imgUrl || 
       (profile.genre === "Masculino" ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png" :
        profile.genre === "Femenino" ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740487974/Captura_de_pantalla_2025-02-25_095231_yf60vs.png" :
        "https://res.cloudinary.com/dagcofbhm/image/upload/v1740488144/Captura_de_pantalla_2025-02-25_095529_gxe0gx.png"))
       : "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"}  // Imagen predeterminada
  alt={profile?.name || "Foto de perfil"}
  width={100}
  height={100}
  className="rounded-full mb-4 md:mb-0"
/>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-green-600">
                  {profile.name} {profile.lastname}
                </h2>
                <div className="text-gray-700">
                  <p><strong>Rol:</strong> {profile.role}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Teléfono:</strong> {profile.phone}</p>
                  <p><strong>Nacionalidad:</strong> {profile.nationality}</p>
                  <p><strong>Género:</strong> {profile.genre}</p>
                  <p><strong>Fecha de Nacimiento:</strong> {profile.birthday}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "Datos Físicos" && (
          <div className="transition-opacity duration-300">
             <div className="flex items-start">
             <Image
  src={profile ? 
       (profile.imgUrl || 
       (profile.genre === "Masculino" ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png" :
        profile.genre === "Femenino" ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740487974/Captura_de_pantalla_2025-02-25_095231_yf60vs.png" :
        "https://res.cloudinary.com/dagcofbhm/image/upload/v1740488144/Captura_de_pantalla_2025-02-25_095529_gxe0gx.png"))
       : "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"}  // Imagen predeterminada
  alt={profile?.name || "Foto de perfil"}
  width={100}
  height={100}
  className="rounded-full mb-4 md:mb-0"
/>
              <div className="ml-4">
            <h2 className="text-xl font-semibold text-green-600">Datos Físicos</h2>
            <div className="text-gray-700">
              <p><strong>Pierna hábil:</strong> {profile.skillfulFoot}</p>
              <p><strong>Estructura corporal:</strong> {profile.bodyStructure}</p>
              </div>
              </div>
            </div>
          </div>
        )}

{activeSection === "Trayectoria" && (
  <div className="transition-opacity duration-300">
    {/* Imagen y Datos de Perfil */}
    <div className="flex items-start">
    <Image
  src={profile ? 
       (profile.imgUrl || 
       (profile.genre === "Masculino" ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png" :
        profile.genre === "Femenino" ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740487974/Captura_de_pantalla_2025-02-25_095231_yf60vs.png" :
        "https://res.cloudinary.com/dagcofbhm/image/upload/v1740488144/Captura_de_pantalla_2025-02-25_095529_gxe0gx.png"))
       : "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"}  // Imagen predeterminada
  alt={profile?.name || "Foto de perfil"}
  width={100}
  height={100}
  className="rounded-full mb-4 md:mb-0"
/>
      <div className="ml-4">
        <h2 className="text-xl font-semibold text-green-600">Trayectoria</h2>
        {profile.puesto && profile.puesto.length > 0 ? (
          profile.puesto.map((pos, index) => (
            <div key={index} className="text-gray-700">
              <p><strong>{pos.position}:</strong> {pos.experience} años de experiencia</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">Aún no tiene experiencias agregadas</p> 
        )}
      </div>
    </div>
  </div>
)}

 </div>
 </div>

  );
};

export default CardProfile;
