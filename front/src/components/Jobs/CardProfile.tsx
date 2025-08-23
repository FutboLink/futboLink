import AOS from "aos";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FaBriefcase,
  FaRegIdCard,
  FaRunning,
  FaUser,
  FaYoutube,
} from "react-icons/fa";
import type { IProfileData } from "@/Interfaces/IUser";
import BackButton from "../utils/BackButton";
import "aos/dist/aos.css";
import { getDefaultPlayerImage } from "@/helpers/imageUtils";

interface CardProfileProps {
  profile: IProfileData;
}

const sections = ["Perfil", "Datos Físicos", "Trayectoria"];

const CardProfile: React.FC<CardProfileProps> = ({ profile }) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    AOS.init();
  }, []);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";

    try {
      // Handle different YouTube URL formats
      let videoId = null;

      if (url.includes("youtu.be/")) {
        // Short URL format: https://youtu.be/VIDEO_ID
        videoId = url.split("youtu.be/")[1].split("?")[0];
      } else if (url.includes("/watch?v=")) {
        // Standard URL format: https://www.youtube.com/watch?v=VIDEO_ID
        videoId = new URL(url).searchParams.get("v");
      } else if (url.includes("/embed/")) {
        // Embed URL format: https://www.youtube.com/embed/VIDEO_ID
        videoId = url.split("/embed/")[1].split("?")[0];
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
    }

    return "";
  };

  // Determinar el tipo de suscripción correcto
  const getSubscriptionType = () => {
    // Verificar primero subscriptionType, luego subscription
    if (profile.subscriptionType) {
      return profile.subscriptionType;
    } else if (profile.subscription) {
      return profile.subscription;
    } else {
      return "Amateur";
    }
  };

  // Determinar si es plan profesional o no (para la badge)
  const subscriptionType = getSubscriptionType();
  const hasPremiumPlan =
    subscriptionType === "Profesional" ||
    subscriptionType === "Semiprofesional" ||
    subscriptionType === "Semi";

  return (
    <div className="flex min-h-screen mt-24 text-black bg-gray-50 flex-col sm:flex-row">
      {/* Panel izquierdo */}
      <div className="w-full sm:w-72 bg-gradient-to-r from-[#1d5126] to-[#3e7c27] text-white p-6 rounded-t-lg sm:rounded-l-lg shadow-lg sm:shadow-none sm:mr-4">
        <div className="mb-8 flex flex-col items-center space-y-4">
          <div className="relative">
            <Image
              src={profile?.imgUrl || getDefaultPlayerImage(profile.genre)}
              alt={profile?.name || "Foto de perfil"}
              width={110}
              height={110}
              className="rounded-full mb-4 md:mb-0 border-4 border-white shadow-md object-cover"
            />
            {hasPremiumPlan && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                <FaRegIdCard className="text-sm" />
              </div>
            )}
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">
              {profile.name} {profile.lastname}
            </h2>
            <h2 className="text-xl font-medium">{profile.puesto}</h2>
            <p className="text-sm opacity-90">{profile.email}</p>
            <p className="text-sm opacity-90">{profile.phone}</p>

            {/* Subscription Badge */}
            <div
              className={`mt-2 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                hasPremiumPlan
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              <FaRegIdCard className="mr-1" />
              Plan: {subscriptionType}
            </div>
          </div>
        </div>

        {/* Barra de navegación */}
        <nav className="space-y-2">
          <ul className="space-y-1">
            {sections.map((section, index) => (
              <li key={section}>
                <button
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={`w-full py-2.5 px-4 flex items-center space-x-2 text-left rounded-lg transition duration-200 ${
                    activeSection === section
                      ? "bg-white bg-opacity-20 shadow-sm"
                      : "hover:bg-green-700 hover:bg-opacity-50"
                  }`}
                >
                  {/* Iconos para cada sección */}
                  {index === 0 && <FaUser className="text-white text-lg" />}
                  {index === 1 && <FaRunning className="text-white text-lg" />}
                  {index === 2 && (
                    <FaBriefcase className="text-white text-lg" />
                  )}
                  <span className="text-white">{section}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <BackButton />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-6 bg-gray-50 text-black">
        <div className="bg-gray-200 border-l-4 border-verde-oscuro text-gray-700 p-4 max-w-7xl mx-auto text-center rounded-lg shadow-sm mb-6">
          <p className="font-semibold text-sm">
            Perfil del profesional de fútbol. Revisa los detalles de su
            información.
          </p>
        </div>

        {activeSection === "Perfil" && (
          <div
            className="p-6 bg-gray-50 text-gray-700 rounded-lg shadow-sm"
            data-aos="fade-up"
          >
            <h3 className="text-2xl font-semibold mb-6 text-[#1d5126] border-b pb-2">
              Información Personal
            </h3>

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
                        <strong>Rol:</strong> {profile.puesto}
                      </p>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Email:</strong> {profile.email}
                      </p>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Teléfono:</strong> {profile.phone}
                      </p>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Nacionalidad:</strong> {profile.nationality}
                      </p>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Ciudad:</strong> {profile.location}
                      </p>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>País de Residencia:</strong>
                        {profile.ubicacionActual}
                      </p>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Género:</strong> {profile.genre}
                      </p>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Edad:</strong> {profile.age} años
                      </p>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Fecha de Nacimiento:</strong> {profile.birthday}
                      </p>
                      {profile.nameAgency && (
                        <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                          <strong>Agente:</strong> {profile.nameAgency}
                        </p>
                      )}

                      {/* Redes Sociales */}
                      <div className="mt-4">
                        <strong className="text-[#1d5126]">
                          Redes Sociales:
                        </strong>
                        <div className="flex space-x-4 mt-2 items-center">
                          {profile.socialMedia?.x && (
                            <a
                              href={`https://x.com/${profile.socialMedia.x}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:opacity-80 transition-opacity"
                            >
                              <Image
                                src="/logoX.png"
                                alt="Logo X Futbolink"
                                width={30}
                                height={30}
                                className="w-6 h-6 p-2 rounded-md bg-black shadow-sm"
                              />
                            </a>
                          )}
                          {profile.videoUrl && (
                            <a
                              href={profile.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <FaYoutube size={24} />
                            </a>
                          )}
                          {profile.socialMedia?.transfermarkt && (
                            <a
                              href={`${profile.socialMedia.transfermarkt}`}
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
                <div className="relative w-full pt-[56.25%] bg-black rounded-lg shadow-md mt-2 overflow-hidden">
                  {isClient && profile?.videoUrl ? (
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={getYouTubeEmbedUrl(profile.videoUrl)}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      title="Video del jugador"
                    ></iframe>
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <p className="text-white text-center p-4">
                        No hay video disponible
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CV Section */}
            {profile?.cv && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 text-[#1d5126] border-b pb-2">
                  Curriculum Vitae
                </h3>
                <div className="flex flex-col items-start">
                  <div className="border border-[#1d5126] bg-[#f5f5f5] p-4 rounded-md w-full md:w-1/2 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-[#1d5126] text-white p-2 rounded-lg mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                          >
                            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
                            <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-[#1d5126]">
                            Curriculum Vitae
                          </p>
                          <p className="text-xs text-gray-500">
                            Documento PDF/DOC
                          </p>
                        </div>
                      </div>
                      <a
                        href={profile.cv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#1d5126] hover:bg-[#3e7c27] text-white px-3 py-1.5 rounded-md text-sm transition-colors duration-200 flex items-center"
                      >
                        Ver CV
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === "Datos Físicos" && (
          <div
            className="flex-1 p-6 bg-gray-50 text-gary-700 transition-opacity duration-300 rounded-lg shadow-sm"
            data-aos="fade-up"
          >
            <h3 className="text-xl font-semibold text-[#1d5126] border-b pb-2 mb-4">
              Datos Generales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-2">
                  Puesto Principal
                </h4>
                <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-3 rounded-md shadow-sm">
                  {profile.primaryPosition || "No especificado"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-2">
                  Puesto Secundario
                </h4>
                <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-3 rounded-md shadow-sm">
                  {profile.secondaryPosition || "No especificado"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-2">
                  Pasaporte UE
                </h4>
                <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-3 rounded-md shadow-sm">
                  {profile.pasaporteUe || "No especificado"}
                </p>
              </div>
            </div>
            <div className="bg-gray-300 h-px my-6"></div>
            <h3 className="text-xl font-semibold text-[#1d5126] border-b pb-2 mb-4">
              Datos Físicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {profile.skillfulFoot && (
                <div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">
                    Pie Hábil
                  </h4>
                  <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-3 rounded-md shadow-sm">
                    {profile.skillfulFoot}
                  </p>
                </div>
              )}
              {profile.bodyStructure && (
                <div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">
                    Estructura Corporal
                  </h4>
                  <p className="border border-[#1d5126] bg-[#f5f5f5] text-gray-700 p-3 rounded-md shadow-sm">
                    {profile.bodyStructure}
                  </p>
                </div>
              )}
              {profile.height && (
                <div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">
                    Altura
                  </h4>
                  <p className="border border-[#1d5126] bg-[#f5f5f5] text-gray-700 p-3 rounded-md shadow-sm">
                    {profile.height} cm
                  </p>
                </div>
              )}
              {profile.weight && (
                <div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">
                    Peso
                  </h4>
                  <p className="border border-[#1d5126] bg-[#f5f5f5] text-gray-700 p-3 rounded-md shadow-sm">
                    {profile.weight} kg
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === "Trayectoria" && (
          <div
            className="flex-1 p-6 bg-gray-50 text-gary-700 transition-opacity duration-300 rounded-lg shadow-sm"
            data-aos="fade-up"
          >
            <h3 className="text-xl font-semibold text-[#1d5126] border-b pb-2 mb-4">
              Trayectoria
            </h3>

            {profile?.trayectorias && profile.trayectorias.length > 0 ? (
              <div className="space-y-4">
                {profile.trayectorias.map((experience, index) => (
                  <div
                    key={`${experience.club}-${index}`}
                    className="border border-[#1d5126] bg-[#f5f5f5] p-4 rounded-md shadow-sm mb-4"
                  >
                    <h4 className="font-semibold text-lg text-gray-800">
                      {experience.club || "Club no especificado"}
                    </h4>
                    <div className="flex flex-wrap gap-4 mt-2 text-gray-700">
                      {experience.fechaInicio && (
                        <p className="bg-white px-3 py-1 rounded-full text-sm">
                          <span className="font-medium">Inicio:</span>{" "}
                          {new Date(experience.fechaInicio).toLocaleDateString(
                            "es-ES"
                          )}
                        </p>
                      )}

                      {experience.fechaFinalizacion && (
                        <p className="bg-white px-3 py-1 rounded-full text-sm">
                          <span className="font-medium">Fin:</span>{" "}
                          {new Date(
                            experience.fechaFinalizacion
                          ).toLocaleDateString("es-ES")}
                        </p>
                      )}

                      {experience.categoriaEquipo && (
                        <p className="bg-white px-3 py-1 rounded-full text-sm">
                          <span className="font-medium">Categoría:</span>{" "}
                          {experience.categoriaEquipo}
                        </p>
                      )}

                      {experience.nivelCompetencia && (
                        <p className="bg-white px-3 py-1 rounded-full text-sm">
                          <span className="font-medium">Nivel:</span>{" "}
                          {experience.nivelCompetencia}
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
              <p className="text-gray-500 italic">
                No hay información de trayectoria disponible
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardProfile;
