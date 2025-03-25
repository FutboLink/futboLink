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
import { FaFutbol, FaXTwitter, FaYoutube } from "react-icons/fa6";

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
    <div className="flex min-h-screen mt-24 text-black bg-gray-50">
      {/* Panel izquierdo: Datos del usuario y navegación */}
      <aside className="w-72 bg-gradient-to-b from-[#1d5126] to-[#3e7c27] text-white p-6 rounded-r-lg shadow-xl">
        {/* Datos básicos del usuario */}
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
            { name: "Mi Perfil", section: "profile", icon: "👤" },
            { name: "Crear Oferta", section: "createOffers", icon: "📝" },
            { name: "Mis Ofertas", section: "appliedOffers", icon: "📜" },
            { name: "Configuración", section: "config", icon: "⚙️" },
          ].map(({ name, section, icon }) => (
            <button
              key={section}
              onClick={() => handleSectionChange(section)}
              className={`w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg transition duration-200 ${
                activeSection === section
                  ? "bg-[#4e722d] text-white"
                  : "hover:bg-[#3e7c27] hover:text-white"
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span>{name}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogOut}
          className="mt-6 w-full py-2 bg-red-600 rounded-lg text-white text-center font-medium hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-10">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Sección de Perfil */}
        {activeSection === "profile" && (
          <section
            className="bg-white p-10 rounded-xl shadow-xl mb-8 max-w-5xl mx-auto"
            data-aos="fade-up"
          >
            <h3 className="text-2xl font-semibold text-[#1d5126] mb-6">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-lg text-[#3e7c27] mb-4">
                  <span className="font-medium">País:</span>{" "}
                  {userData?.nationality}
                </p>
                <p className="text-lg text-[#3e7c27] mb-4">
                  <span className="font-medium">Ciudad:</span>{" "}
                  {userData?.location}
                </p>
                <p className="text-lg text-[#3e7c27] mb-4">
                  <span className="font-medium text-[#1d5126]">Teléfono:</span>{" "}
                  {userData?.phone}
                </p>

                {/* Redes Sociales con íconos */}
                <div className="flex space-x-4 mt-4">
                  {userData?.socialMedia?.x && (
                    <Link
                      href={`https://twitter.com/${userData.socialMedia.x}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1d5126] hover:text-[#3e7c27] transition-colors"
                    >
                      <FaXTwitter size={28} />
                    </Link>
                  )}
                  {userData?.socialMedia?.transfermarkt && (
                    <Link
                      href={`https://www.transfermarkt.com/${userData.socialMedia.transfermarkt}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1d5126] hover:text-[#3e7c27] transition-colors"
                    >
                      <FaFutbol size={28} />
                    </Link>
                  )}
                  {userData?.socialMedia?.youtube && (
                    <Link
                      href={`https://www.youtube.com/${userData.socialMedia.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1d5126] hover:text-[#3e7c27] transition-colors"
                    >
                      <FaYoutube size={28} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-600 mt-12">
              Haz click en{" "}
              <Link
                href="/profile"
                className="rounded border-2 w-full md:w-3/4 text-center font-semibold bg-[#1d5126] hover:bg-[#3e7c27] hover:cursor-pointer p-2 text-white"
              >
                Editar Perfil
              </Link>{" "}
              para completar tus datos.
            </p>
          </section>
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
