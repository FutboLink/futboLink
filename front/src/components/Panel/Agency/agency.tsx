"use client";

import Image from "next/image";
import { useState, useEffect, useContext } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; 
import { IProfileData} from "@/Interfaces/IUser";
import { UserContext } from "@/components/Context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import userH from "@/helpers/helperUser";
import FormComponent from "@/components/Jobs/CreateJob";

const PanelAgency = () => {
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
            <h2 className="text-2xl font-semibold">
              {userData?.nameAgency}
            </h2>
            <p className="text-sm">{userData?.phone}</p>
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
                onClick={() => handleSectionChange("postulantes")}
                className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
              >
                <span className="text-lg">⚡</span>
                <span>Mis postulantes</span>
              </button>
            </li>
            <li>
              
              <button
                onClick={() => handleSectionChange("createOffers")}
                className="w-full py-2 px-4 flex items-center space-x-2 text-left rounded-lg hover:bg-green-700 transition duration-200"
              >
                <span className="text-lg">📝</span>
                <span>Crear Oferta</span>
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
                  <span className="font-medium">País:</span>{" "}
                  {userData?.nationality  || undefined}
                </p>
                <p className="text-lg text-gray-600 mb-4">
                  <span className="font-medium">Ciudad:</span>{" "}
                  {userData?.location  || undefined}
                </p>
                <p className="text-lg text-gray-600 mb-4">
                  <span className="font-medium text-gray-700">Teléfono:</span>{" "}
                  {userData?.phone}
                </p>
                 <p className="text-lg text-gray-600 mb-4">
              <span className="font-medium">Fundado en:</span>{" "}
              {userData?.birthday  || undefined}
              </p>
              <div className="flex items-center space-x-4 mb-4">
                    <span className="font-medium text-gray-700">Redes Sociales:</span>
                    {userData?.socialMedia?.twitter ? (
                      <Link
                        href={`https://twitter.com/${userData.socialMedia.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-700"
                      >
                        <Image
                          src="/logo-black.png"
                          alt="Twitter Icon"
                          width={15}
                          height={15}
                          className="ml-2 cursor-pointer"
                        />
                        {userData.socialMedia.twitter}
                      </Link>
                    ) : (
                      <span className="text-gray-500">No disponible</span>
                    )}

                    {userData?.socialMedia?.instagram ? (
                      <Link
                        href={`https://instagram.com/${userData.socialMedia.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-700"
                      >
                        <Image
                          src="/transfermarkt.png"
                          alt="Instagram Icon"
                          width={25}
                          height={25}
                          className="ml-2 cursor-pointer rounded-sm"
                        />
                        {userData.socialMedia.instagram}
                      </Link>
                    ) : (
                      <span className="text-gray-500">No disponible</span>
                    )}
                  </div>
                              
                
              </div>

           
            </div>
            <p className="text-gray-600 mt-12">
          Haz click en <span className="font-semibold">Editar Perfil</span> para completar tus datos.
        </p>
          </div>
        )}
 {/* Sección de Postulantes */}
 {activeSection === "postulantes" && (
          <div
            className="bg-white p-6 rounded-lg shadow-lg mb-6"
            data-aos="fade-up"
          >
           


          </div>
        )}
        {/* Sección crear jobs */}
        {activeSection === "createOffers" && (
          <div
            className="bg-white p-6 rounded-lg shadow-lg mb-6"
            data-aos="fade-up"
          >
           
      <FormComponent/>

          </div>
        )}

        {/* Sección de Ofertas Aplicadas */}
        {activeSection === "appliedOffers" && (
          <div
            className="bg-white p-6 rounded-lg shadow-lg mb-6"
            data-aos="fade-up"
          >
            <h3 className="text-xl font-semibold mb-4">Ofertas Aplicadas</h3>
            <ul className="space-y-4">
              {userH.appliedOffers.map((offer, index) => (
                <li
                  key={index}
                  className="bg-gray-100 p-4 rounded-md shadow-sm"
                >
                  <h4 className="font-semibold">{offer.title}</h4>
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
      <Link href={"/profile"}>
            <div className="rounded border-2 md:w-3/4 sm:1/6 text-center bg-blue-300 hover:bg-blue-400 hover:cursor-pointer p-2 text-gray-800">
            Editar Perfil
              </div>
              </Link>
    </div>
  );
};

export default PanelAgency;
