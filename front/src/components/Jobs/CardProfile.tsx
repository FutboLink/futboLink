import { useState, useEffect } from "react";
import Image from "next/image";
import { IProfileData } from "@/Interfaces/IUser";
import { FaUser, FaRunning, FaBriefcase, FaYoutube } from "react-icons/fa";
import BackButton from "../utils/BackButton";
import { FaX } from "react-icons/fa6";
import dynamic from 'next/dynamic';

interface CardProfileProps {
  profile: IProfileData;
}

const sections = ["Perfil", "Datos Físicos", "Trayectoria"];

// Client-side only component for YouTube embed
const YouTubeEmbed = dynamic(() => Promise.resolve(({ url }: { url: string }) => {
  return (
    <div className="relative w-full pt-[56.25%]">
      <iframe
        src={url}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
      ></iframe>
    </div>
  );
}), { ssr: false });

const CardProfile: React.FC<CardProfileProps> = ({ profile }) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component is mounted
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    
    try {
      // Handle different YouTube URL formats
      let videoId = null;
      
      if (url.includes('youtu.be/')) {
        // Short URL format: https://youtu.be/VIDEO_ID
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('/watch?v=')) {
        // Standard URL format: https://www.youtube.com/watch?v=VIDEO_ID
        videoId = new URL(url).searchParams.get('v');
      } else if (url.includes('/embed/')) {
        // Embed URL format: https://www.youtube.com/embed/VIDEO_ID
        videoId = url.split('/embed/')[1].split('?')[0];
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
    }
    
    return "";
  };

  return (
    <div className="flex min-h-screen mt-24 text-black bg-gray-50 flex-col sm:flex-row">
      {/* Barra Lateral */}
      <div className="w-full sm:w-72 bg-gradient-to-r from-[#1d5126] to-[#3e7c27] text-white p-6 rounded-t-lg sm:rounded-l-lg shadow-lg sm:shadow-none sm:mr-4">
        <div className="mb-8 flex flex-col items-center space-y-4">
          <div className="relative">
            <Image
              src={
                profile?.imgUrl ||
                (profile?.genre === "Masculino"
                  ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"
                  : profile?.genre === "Femenino"
                  ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740487974/Captura_de_pantalla_2025-02-25_095231_yf60vs.png"
                  : "https://res.cloudinary.com/dagcofbhm/image/upload/v1740488144/Captura_de_pantalla_2025-02-25_095529_gxe0gx.png")
              }
              alt={profile?.name || "Foto de perfil"}
              width={110}
              height={110}
              className="rounded-full mb-4 md:mb-0 border-4 border-white shadow-md object-cover"
            />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">
              {profile.name} {profile.lastname}
            </h2>
            <h2 className="text-xl font-semibold">{profile.puesto}</h2>
            <p className="text-sm opacity-90">{profile.email}</p>
            <p className="text-sm opacity-90">{profile.phone}</p>
          </div>
        </div>

        {/* Barra de navegación */}
        <nav className="space-y-2">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveSection("Perfil")}
                className={`w-full py-2.5 px-4 flex items-center space-x-2 text-left rounded-lg transition duration-200 ${
                  activeSection === "Perfil" 
                    ? "bg-white bg-opacity-20 shadow-sm" 
                    : "hover:bg-green-700 hover:bg-opacity-50"
                }`}
              >
                <FaUser className="text-white text-lg" />
                <span className="text-white">Perfil</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("Datos Físicos")}
                className={`w-full py-2.5 px-4 flex items-center space-x-2 text-left rounded-lg transition duration-200 ${
                  activeSection === "Datos Físicos" 
                    ? "bg-white bg-opacity-20 shadow-sm" 
                    : "hover:bg-green-700 hover:bg-opacity-50"
                }`}
              >
                <FaRunning className="text-white text-lg" />
                <span className="text-white">Datos Físicos</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("Trayectoria")}
                className={`w-full py-2.5 px-4 flex items-center space-x-2 text-left rounded-lg transition duration-200 ${
                  activeSection === "Trayectoria" 
                    ? "bg-white bg-opacity-20 shadow-sm" 
                    : "hover:bg-green-700 hover:bg-opacity-50"
                }`}
              >
                <FaBriefcase className="text-white text-lg" />
                <span className="text-white">Trayectoria</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="mt-8">
          <BackButton />
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-1">
        <div className="bg-gray-200 border-l-4 border-verde-oscuro text-gray-700 p-4 max-w-7xl mx-auto text-center rounded-lg shadow-sm">
          <p className="font-semibold text-sm">
            Perfil del candidato - Información completa
          </p>
        </div>

        {isClient || process.browser ? (
          <>
            {/* Sección de Perfil */}
            {activeSection === "Perfil" && (
              <div className="p-6 bg-gray-50 text-gray-700 rounded-lg shadow-sm mt-4">
                <h3 className="text-2xl font-semibold mb-6 text-[#1d5126] border-b pb-2">Información Personal</h3>

                {/* Contenedor Principal con Flex */}
                <div className="flex flex-col sm:flex-col md:flex-row justify-between gap-6">
                  
                  {/* Sección de Información y Redes Sociales */}
                  <div className="md:w-1/2">
                    <div className="flex items-start">
                      <div className="ml-4">
                        <h2 className="text-xl font-semibold text-[#1d5126]">
                          {profile.name} {profile.lastname}
                        </h2>
                        <div className="text-gray-700 mt-2">
                          <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                            <strong>Nacionalidad:</strong> {profile.nationality || "No disponible"}
                          </p>
                          <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                            <strong>Ubicación actual:</strong> {profile.ubicacionActual || "No disponible"}
                          </p>
                          <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                            <strong>Fecha de Nacimiento:</strong> {profile.birthday || "No disponible"}
                          </p>
                          <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                            <strong>Edad:</strong> {profile.age || "No disponible"} años
                          </p>
                          <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                            <strong>Género:</strong> {profile.genre || "No disponible"}
                          </p>
                          <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                            <strong>Teléfono:</strong> {profile.phone || "No disponible"}
                          </p>
                          <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                            <strong>Email:</strong> {profile.email || "No disponible"}
                          </p>

                          {/* Redes Sociales */}
                          <div className="mt-4">
                            <strong className="text-[#1d5126]">Redes Sociales:</strong>
                            <div className="flex space-x-4 mt-2 items-center">
                              {profile?.socialMedia?.x && (
                                <a 
                                  href={`https://x.com/${profile.socialMedia.x}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:opacity-80 transition-opacity"
                                >
                                  <Image 
                                    src="/logoX.png" 
                                    alt="Logo X" 
                                    width={30} 
                                    height={30} 
                                    className="w-6 h-6 p-2 rounded-md bg-black shadow-sm" 
                                  />
                                </a>
                              )}
                              {profile?.videoUrl && (
                                <a 
                                  href={profile.videoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                >
                                  <FaYoutube size={24} />
                                </a>
                              )}
                              {profile?.socialMedia?.transfermarkt && (
                                <a
                                  href={`https://www.transfermarkt.com/${profile.socialMedia.transfermarkt}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:opacity-80 transition-opacity"
                                >
                                  <Image
                                    src="/transfermarkt.png"
                                    alt="Transfermarkt"
                                    width={60}
                                    height={60}
                                    className="shadow-sm rounded-sm"
                                  />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video de Presentación */}
                  <div className="md:w-1/2">
                    <span className="font-medium text-lg mb-4 text-[#1d5126] block border-b pb-1">
                      Video de Presentación
                    </span>
                    <div className="mt-2 rounded-lg overflow-hidden shadow-md">
                      {profile?.videoUrl ? (
                        <YouTubeEmbed url={getYouTubeEmbedUrl(profile.videoUrl)} />
                      ) : (
                        <div className="flex items-center justify-center h-[200px] bg-gray-100 text-gray-500">
                          <p>No hay video disponible</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sección de Datos Físicos */}
            {activeSection === "Datos Físicos" && (
              <div className="p-6 bg-gray-50 text-gray-700 rounded-lg shadow-sm mt-4">
                <h3 className="text-xl font-semibold text-[#1d5126] border-b pb-2 mb-4">Datos Generales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">Posición Principal</h4>
                    <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-3 rounded-md shadow-sm">
                      {profile?.primaryPosition || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">Posición Secundaria</h4>
                    <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-3 rounded-md shadow-sm">
                      {profile?.secondaryPosition || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">Pasaporte UE</h4>
                    <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-3 rounded-md shadow-sm">
                      {profile?.pasaporteUe || "No especificado"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-300 h-px my-6"></div>
                <h3 className="text-xl font-semibold text-[#1d5126] border-b pb-2 mb-4">Datos Físicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {profile?.skillfulFoot && (
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">Pie Hábil</h4>
                      <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-3 rounded-md shadow-sm">
                        {profile.skillfulFoot}
                      </p>
                    </div>
                  )}
                  {profile?.bodyStructure && (
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">Estructura Corporal</h4>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] text-gray-700 p-3 rounded-md shadow-sm">
                        {profile.bodyStructure}
                      </p>
                    </div>
                  )}
                  {profile?.height && (
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">Altura</h4>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] text-gray-700 p-3 rounded-md shadow-sm">
                        {profile.height} cm
                      </p>
                    </div>
                  )}
                  {profile?.weight && (
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">Peso</h4>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] text-gray-700 p-3 rounded-md shadow-sm">
                        {profile.weight} kg
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección de Trayectoria */}
            {activeSection === "Trayectoria" && (
              <div className="p-6 bg-gray-50 text-gray-700 rounded-lg shadow-sm mt-4">
                <h3 className="text-xl font-semibold text-[#1d5126] border-b pb-2 mb-4">Trayectoria</h3>
                
                {profile?.trayectorias && profile.trayectorias.length > 0 ? (
                  <div className="space-y-4">
                    {profile.trayectorias.map((experience, index) => (
                      <div key={index} className="border border-[#1d5126] bg-[#f5f5f5] p-4 rounded-md shadow-sm mb-4">
                        <h4 className="font-semibold text-lg text-gray-800">{experience.club || "Club no especificado"}</h4>
                        <div className="flex flex-wrap gap-4 mt-2 text-gray-700">
                          {experience.fechaInicio && (
                            <p className="bg-white px-3 py-1 rounded-full text-sm">
                              <span className="font-medium">Inicio:</span> {new Date(experience.fechaInicio).toLocaleDateString('es-ES')}
                            </p>
                          )}
                          
                          {experience.fechaFinalizacion && (
                            <p className="bg-white px-3 py-1 rounded-full text-sm">
                              <span className="font-medium">Fin:</span> {new Date(experience.fechaFinalizacion).toLocaleDateString('es-ES')}
                            </p>
                          )}
                          
                          {experience.categoriaEquipo && (
                            <p className="bg-white px-3 py-1 rounded-full text-sm">
                              <span className="font-medium">Categoría:</span> {experience.categoriaEquipo}
                            </p>
                          )}
                          
                          {experience.nivelCompetencia && (
                            <p className="bg-white px-3 py-1 rounded-full text-sm">
                              <span className="font-medium">Nivel:</span> {experience.nivelCompetencia}
                            </p>
                          )}
                        </div>
                        
                        {experience.logros && (
                          <div className="mt-3 bg-white p-3 rounded-md">
                            <p className="font-medium text-gray-800">Logros:</p>
                            <p className="text-gray-700">{experience.logros}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No hay información de trayectoria disponible</p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="p-6 bg-white rounded-lg shadow-sm mt-4 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d5126]"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardProfile;
