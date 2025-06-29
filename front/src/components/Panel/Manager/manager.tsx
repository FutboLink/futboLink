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
import { FaX, FaYoutube, FaBolt } from "react-icons/fa6";
import { AiOutlineFileAdd, AiOutlineFileText, AiOutlineUser } from "react-icons/ai";
import { MdSettings } from "react-icons/md";
import { FaGlobe } from "react-icons/fa";

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
          <div className="p-6 bg-white text-gray-700 rounded-xl shadow-md" data-aos="fade-up">
            <h3 className="text-2xl font-semibold mb-6 text-[#1d5126] border-b border-gray-200 pb-2">Información Personal</h3>
      
            {/* Contenedor Principal con dos columnas */}
            <div className="flex flex-col md:flex-row justify-between gap-8">
              
              {/* Columna Izquierda */}
              <div className="md:w-1/2">
                <div className="flex items-start">
                  <div className="w-full">
                    <h2 className="text-xl font-semibold text-[#1d5126] mb-4">
                      {userData?.name} {userData?.lastname}
                    </h2>
                    <div className="text-gray-700 mt-2 space-y-3">
                      <p className="border border-gray-200 bg-gray-50 p-3 mb-2 rounded-lg shadow-sm flex justify-between">
                        <strong className="text-[#1d5126]">Nombre de la entidad:</strong> <span>{userData?.nameAgency || "No disponible"}</span>
                      </p>
                      <p className="border border-gray-200 bg-gray-50 p-3 mb-2 rounded-lg shadow-sm flex justify-between">
                        <strong className="text-[#1d5126]">Email:</strong> <span>{userData?.email}</span>
                      </p>
                      <p className="border border-gray-200 bg-gray-50 p-3 mb-2 rounded-lg shadow-sm flex justify-between">
                        <strong className="text-[#1d5126]">Tipo de organización:</strong> <span>{userData?.puesto}</span>
                      </p>
                      <p className="border border-gray-200 bg-gray-50 p-3 mb-2 rounded-lg shadow-sm flex justify-between">
                        <strong className="text-[#1d5126]">Año de fundación:</strong> <span>{userData?.age}</span>
                      </p>
                      <p className="border border-gray-200 bg-gray-50 p-3 mb-2 rounded-lg shadow-sm flex justify-between">
                        <strong className="text-[#1d5126]">Región:</strong> <span>{userData?.location}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
                      
              {/* Columna Derecha */}
              <div className="md:w-1/2">
                <div className="mt-1">
                  <div className="text-gray-700 space-y-3">
                    <p className="border border-gray-200 bg-gray-50 p-3 mb-2 rounded-lg shadow-sm flex justify-between">
                      <strong className="text-[#1d5126]">Teléfono:</strong> <span>{userData?.phone}</span>
                    </p>
                    <p className="border border-gray-200 bg-gray-50 p-3 mb-2 rounded-lg shadow-sm flex justify-between">
                      <strong className="text-[#1d5126]">Nacionalidad:</strong> <span>{userData?.nationality || "No disponible"}</span>
                    </p>
                    <p className="border border-gray-200 bg-gray-50 p-3 mb-2 rounded-lg shadow-sm flex justify-between">
                      <strong className="text-[#1d5126]">Ubicación actual:</strong> <span>{userData?.ubicacionActual || "No disponible"}</span>
                    </p>
                    
                    {/* Redes Sociales */}
                    <div className="mt-6">
                      <strong className="text-[#1d5126] text-lg">Redes Sociales:</strong>
                      <div className="flex space-x-4 mt-3 items-center p-3 bg-gray-50 rounded-lg">
                        {userData?.socialMedia?.x && (
                          <a href={`https://x.com/${userData.socialMedia.x}`} target="_blank" rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity">
                            <Image 
                              src="/logoX.png" 
                              alt="Logo X Futbolink" 
                              width={30} 
                              height={30} 
                              className="w-8 h-8 p-1 rounded-md bg-black shadow-sm hover:shadow-md transition-all" 
                            />
                          </a>
                        )}
                        {userData?.socialMedia?.youtube && (
                          <a href={`https://www.youtube.com/${userData.socialMedia.youtube}`} target="_blank" rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 transition-colors">
                            <FaYoutube size={28} className="hover:scale-110 transition-transform" />
                          </a>
                        )}
                        {userData?.socialMedia?.transfermarkt && (
                          <a href={`https://www.transfermarkt.com/${userData.socialMedia.transfermarkt}`} target="_blank" rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity">
                            <Image
                              src="/transfermarkt.png"
                              alt="Transfermarkt"
                              width={60}
                              height={60}
                              className="shadow-sm rounded-sm hover:shadow-md transition-all"
                            />
                          </a>
                        )}
                        {userData?.socialMedia?.website && (
                          <a href={userData.socialMedia.website} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors">
                            <FaGlobe size={26} className="hover:scale-110 transition-transform" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      
            {/* Video de Presentación */}
            {userData?.videoUrl && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-[#1d5126]">Video de Presentación</h3>
                <div className="relative w-full bg-black shadow-md rounded-lg overflow-hidden">
                  {userData.videoUrl && (
                    <iframe
                      src={userData.videoUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-[350px] rounded-lg"
                    ></iframe>
                  )}
                </div>
              </div>
            )}
      
            {/* CV Section - If available */}
            {userData?.cv && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-[#1d5126]">Curriculum Vitae</h3>
                <div className="flex flex-col items-start">
                  <div className="border border-gray-200 bg-gray-50 p-5 rounded-xl w-full md:w-1/2 mb-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-[#1d5126] text-white p-3 rounded-lg mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                            <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-[#1d5126]">Curriculum Vitae</p>
                          <p className="text-xs text-gray-500">Documento PDF/DOC</p>
                        </div>
                      </div>
                      <a 
                        href={userData.cv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#1d5126] hover:bg-[#3e7c27] text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center"
                      >
                        Ver CV
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
      
            {/* Botón Editar Perfil */}
            <Link href={"/profile"}>
              <div className="mt-8 bg-[#1d5126] hover:bg-[#3e7c27] text-white px-4 py-2 rounded-lg text-sm md:w-1/4 text-center transition-colors duration-200 cursor-pointer inline-flex items-center justify-center shadow-sm hover:shadow-md">
                <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                </svg>
                Editar Perfil
              </div>
            </Link>
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
              [...appliedJobs]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((job) => (
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
            <Link className="group relative" href="/forgotPassword">
  <h4 className="font-semibold text-lg  group-hover:underline ">
    Cambiar contraseña
  </h4>
</Link>
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
