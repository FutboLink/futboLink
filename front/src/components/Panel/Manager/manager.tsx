"use client";

import Image from "next/image";
import { useState, useEffect, useContext } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { IProfileData } from "@/Interfaces/IUser";
import { UserContext } from "@/components/Context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import JobOfferDetails from "@/components/Jobs/JobOffertDetails";
import { IOfferCard } from "@/Interfaces/IOffer";
import FormComponent from "@/components/Jobs/CreateJob";
import { fetchUserId } from "@/components/Fetchs/UsersFetchs/UserFetchs";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import { FaX, FaYoutube } from "react-icons/fa6";
import { AiOutlineFileAdd, AiOutlineFileText, AiOutlineUser } from "react-icons/ai";
import { MdSettings } from "react-icons/md";
import { PiSoccerBall } from "react-icons/pi";
import { FaGlobe} from "react-icons/fa";

const PanelManager = () => {
  const { user, logOut } = useContext(UserContext);
  const [activeSection, setActiveSection] = useState("profile");
  const [userData, setUserData] = useState<IProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<IOfferCard[]>([]);
  const router = useRouter();

  // Inicializamos AOS para animaciones
  useEffect(() => {
    AOS.init();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (user && user.id) {
        try {
          const data = await fetchUserId(user.id);
          setUserData(data);
        } catch (error) {
          console.error("Error loading user data:", error);
          setError("No se pudo cargar los datos.");
        }
      }
    };
    loadUserData();
  }, [user]);

  useEffect(() => {
    const loadAppliedJobs = async () => {
      if (user && user.id) {
        try {
          const jobs = await getOfertas();
          console.log("Ofertas obtenidas:", jobs);
          const filteredJobs = jobs.filter(
            (job) => job.recruiter && job.recruiter.id === user.id
          );
          setAppliedJobs(filteredJobs);
        } catch (error) {
          console.error("Error loading applied jobs:", error);
          setError("Error al obtener las ofertas.");
        }
      }
    };
    loadAppliedJobs();
  }, [user]);

  const handleSectionChange = (section: string) => setActiveSection(section);
  const handleLogOut = () => {
    logOut();
    router.push("/");
  };

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
          </div>
        </div>

        {/* Menú de navegación */}
        <nav className="space-y-2">
          {[
           { name: "Mi Perfil", section: "profile", icon: <AiOutlineUser /> },
           { name: "Crear Oferta", section: "createOffers", icon: <AiOutlineFileAdd /> },
           { name: "Mis Ofertas", section: "appliedOffers", icon: <AiOutlineFileText /> },
           { name: "Configuración", section: "config", icon: <MdSettings /> },
          ].map(({ name, section, icon }) => (
            <button
              key={section}
              onClick={() => handleSectionChange(section)}
              className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
    >
              <span  className="text-white text-lg">{icon}</span>
              <span className="text-white">{name}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogOut}
          className="mt-6 w-full py-2 rounded-lg text-white text-center font-bold border-2 border-white hover:bg-white hover:text-gray-700"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Contenido principal */}
      <main className="flex-1 p-10">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Sección de Perfil */}
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
                      <strong>Nombre de la entidad:</strong> {userData?.nameAgency || "No disponible"}
                    </p>
                    <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                      <strong>Tipo de organización:</strong> {userData?.puesto}
                    </p>
                    <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                      <strong>Año de fundación:</strong> {userData?.age} 
                    </p>
                    <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md">
                      <strong>Región:</strong> {userData?.location}
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
                            <FaX  size={24} />
                          </a>
                        )}
                        {userData?.socialMedia?.youtube && (
                          <a href={`https://www.youtube.com/${userData.socialMedia.youtube}`} target="_blank" rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-800">
                            <FaYoutube size={24} />
                          </a>
                        )}
                        {userData?.socialMedia?.transfermarkt && (
                          <a href={`https://www.transfermarkt.com/${userData.socialMedia.transfermarkt}`} target="_blank" rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800">
                           <Image
      src="/transfermarkt.png"
      alt="Transfermarkt"
      width={60}
      height={60}
    />
                          </a>
                        )}
                        {userData?.socialMedia?.website && (
                <a href={userData.socialMedia.website} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800">
                  <FaGlobe size={24} />
                </a>
              )}

                      </div>
                    </div>
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
            </div>
            
        )}

        {/* Sección Crear Ofertas */}
        {activeSection === "createOffers" && (
          <section
            className="bg-white p-8 rounded-lg shadow-lg mb-8 max-w-5xl mx-auto"
            data-aos="fade-up"
          >
            <FormComponent />
          </section>
        )}

        {/* Sección Mis Ofertas */}
        {activeSection === "appliedOffers" && (
          <section
            className="bg-white p-8 rounded-lg shadow-lg mb-8 max-w-5xl mx-auto"
            data-aos="fade-up"
          >
            {appliedJobs.length === 0 ? (
              <p>No has publicado ninguna oferta.</p>
            ) : (
              appliedJobs.map((job) => (
                <div key={job.id} className="cursor-pointer">
                  <JobOfferDetails jobId={job.id || ""} />
                </div>
              ))
            )}
          </section>
        )}

        {/* Sección de Configuración */}
        {activeSection === "config" && (
          <section
            className="bg-white p-6 rounded-lg shadow-lg mb-8 max-w-5xl mx-auto"
            data-aos="fade-up"
          >
            <h3 className="text-xl font-semibold mb-4 text-[#1d5126]">
              Configuración
            </h3>
            <div className="space-y-6">
              <h4 className="font-semibold text-lg">Cambiar contraseña</h4>
              <h4 className="font-semibold text-lg">Idioma</h4>
              <h4 className="font-semibold text-lg">Suscripción</h4>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PanelManager;
