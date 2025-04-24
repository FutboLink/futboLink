import { useState } from "react";
import Image from "next/image";
import { IProfileData } from "@/Interfaces/IUser";
import { FaUser, FaRunning, FaBriefcase } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import BackButton from "../utils/BackButton";
import { FaX } from "react-icons/fa6";

interface CardProfileProps {
  profile: IProfileData;
}

const sections = ["Perfil", "Datos Físicos", "Trayectoria"];

const CardProfile: React.FC<CardProfileProps> = ({ profile }) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]);

  return (
    <div className="flex min-h-screen mt-24 text-black bg-gray-50 flex-col sm:flex-row">
      {/* Barra Lateral */}
      <div className="w-full sm:w-72 bg-gradient-to-r from-[#1d5126] to-[#3e7c27] text-white p-6 rounded-t-lg sm:rounded-l-lg shadow-lg sm:shadow-none sm:mr-4">
        <div className="mb-8 flex flex-col items-center space-y-4">
          <Image
            src={
              profile?.imgUrl ||
              "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"
            }
            alt={profile?.name || "Foto de perfil"}
            width={100}
            height={100}
            className="rounded-full mb-4 md:mb-0"
          />
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">
            {profile.name} {profile.lastname}
            </h2>
            <h2 className="text-xl font-medium">{profile.puesto}</h2>
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
                    activeSection === section
                      ? "bg-green-700 text-white mb-2"
                      : "mb-1"
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
        <BackButton />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-6 bg-gray-50 text-black">
        {activeSection === "Perfil" && (
          <div className="transition-opacity duration-300">
            <div className="flex items-start">
              <Image
                src={
                  profile?.imgUrl ||
                  "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"
                }
                alt={profile?.name || "Foto de perfil"}
                width={100}
                height={100}
                className="rounded-full mb-4 md:mb-0"
              />
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-[#1d5126]">
                  {profile.name} {profile.lastname}
                </h2>
                <div className="text-gray-700">
                  <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                    <strong>Rol:</strong> {profile.puesto}
                  </p>
                  <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                    <strong>Email:</strong> {profile.email}
                  </p>
                  <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                    <strong>Teléfono:</strong> {profile.phone}
                  </p>
                  <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                    <strong>Nacionalidad:</strong> {profile.nationality}
                  </p> 
                  <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                    <strong>Ciudad:</strong> {profile.location}
                  </p>
                  <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                    <strong>Ubicación actual:</strong> {profile.ubicacionActual}
                  </p>
                  <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                    <strong>Género:</strong> {profile.genre}
                  </p>
                  <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                    <strong>Edad:</strong> {profile.age} años
                  </p>
                  <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                    <strong>Fecha de Nacimiento:</strong> {profile.birthday}
                  </p>
                  <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                    <strong>Pasaport UE:</strong> {profile.pasaporteUe}
                  </p>

                  {/* Redes Sociales */}
                  <div className="mt-4 border-s-verde-oscuro">
                    <strong>Redes Sociales:</strong>
                    <div className="flex space-x-4 mt-2 items-center">
                      <a
                        href={profile.socialMedia?.x || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                     
                      >
                        <FaX size={24} />
                      </a>
                      <a
                        href={profile.socialMedia?.youtube || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaYoutube size={24} />
                      </a>
                      <a
                        href={profile.socialMedia?.transfermarkt || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800"
                      >
                                  <Image
      src="/transfermarkt.png"
      alt="Transfermarkt"
      width={60}
      height={60}
    />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "Datos Físicos" && (
          <div className="transition-opacity duration-300">
            <div className="flex items-start">
              <Image
                src={
                  profile?.imgUrl ||
                  "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"
                }
                alt={profile?.name || "Foto de perfil"}
                width={100}
                height={100}
                className="rounded-full mb-4 md:mb-0"
              />
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-[#1d5126]">
                  Datos Físicos
                </h2>
                <div className="text-gray-700">
                  <p>
                    <strong>Pierna hábil:</strong> {profile.skillfulFoot}
                  </p>
                  <p>
                    <strong>Estructura corporal:</strong>{" "}
                    {profile.bodyStructure}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "Trayectoria" && (
          <div className="transition-opacity duration-300">
            <div className="flex items-start">
              <Image
                src={
                  profile?.imgUrl ||
                  "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"
                }
                alt={profile?.name || "Foto de perfil"}
                width={100}
                height={100}
                className="rounded-full mb-4 md:mb-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardProfile;
