"use client";
import React, { useContext, useEffect, useState } from "react";
import { ICurso } from "@/Interfaces/ICursos";
import Image from "next/image";
import { getCursos } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import Link from "next/link";
import CursoCard from "./CursoCard";
import { useRouter } from "next/navigation";
import { contact } from "../Fetchs/UsersFetchs/UserFetchs";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import AOS from "aos";
import "aos/dist/aos.css";

const CursosList = () => {
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [filteredCursos, setFilteredCursos] = useState<ICurso[]>([]);
  const [languageFilter, setLanguageFilter] = useState<string>("");
  const [modalityFilter, setModalityFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCurso, setLoadingCurso] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // Opciones de idiomas
  const languages = ["Español", "Ingles", "Italiano"];

  // Opciones de modalidad de cursos
  const modalitys = ["Presencial", "Online", "Presencial + Online"];

  useEffect(() => {
    if (typeof window !== "undefined") {
      AOS.init();
    }
    const fetchCursos = async () => {
      try {
        const cursosData = await getCursos();
        setCursos(cursosData);
        setFilteredCursos(cursosData);
      } catch {
        setError("No se pudieron cargar los cursos");
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, []);

  useEffect(() => {
    let filtered = cursos;

    // Filtro por idioma
    if (languageFilter) {
      filtered = filtered.filter((curso) =>
        curso.language?.includes(languageFilter)
      );
    }

    // Filtro por modalidad
    if (modalityFilter) {
      filtered = filtered.filter((offer) =>
        offer.modality?.includes(modalityFilter)
      );
    }

    // Filtro por términos de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((curso) => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          curso.language?.toLowerCase().includes(lowerSearchTerm) ||
          curso.modality?.toLowerCase().includes(lowerSearchTerm) ||
          curso.title?.toLowerCase().includes(lowerSearchTerm) ||
          curso.country?.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }

    setFilteredCursos(filtered);
  }, [searchTerm, languageFilter, modalityFilter, cursos]);

  if (error) return <p>{error}</p>;

  const handleVerCursoClick = (id: string) => {
    setLoadingCurso(true);

    setTimeout(() => {
      setLoadingCurso(false);
      router.push(`/cursos/${id}`);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !name || !mensaje) {
      setNotificationMessage("⚠️ Por favor, completa todos los campos.");
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return;
    }

    setLoading(true);

    const { success } = await contact(email, name, mensaje);

    setLoading(false);

    if (success) {
      setNotificationMessage("✅ Se ha enviado tu mensaje.");
      setEmail("");
      setName("");
      setMensaje("");
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    } else {
      setNotificationMessage("❌ Ocurrió un error al enviar el mensaje.");
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
  };

  return (
    <div className="min-h-[80vh] mt-12 p-4 pt-[4rem] bg-gray-100 sm:p-6 sm:pt-[4rem] lg:p-12 lg:pb-16">
      <h1 className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white text-[1.8rem] p-2 font-semibold text-center ">
        CURSOS Y FORMACIONES
      </h1>
      {/* Formulario de contacto compacto */}
      <div className="rounded-b-md bg-white border-x border-b border-green-400 px-4 py-3 mb-4 flex flex-col md:px-6 lg:flex-row gap-3 items-center justify-between">
        <p className="text-center md:text-start text-green-700 font-medium">
          ¿Estás interesado en alguno de nuestros cursos?
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-2 w-full md:w-auto"
        >
          <input
            aria-label="Nombre"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre *"
            className="w-full text-gray-700 md:w-36 h-9 px-3 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-400"
          />
          <input
            aria-label="Correo electrónico"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico *"
            className="w-full text-gray-700 md:w-48 h-9 px-3 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-400"
          />
          <input
            aria-label="Mensaje"
            id="message"
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Mensaje *"
            className="w-full text-gray-700 md:w-48 h-9 px-3 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-400"
          />
          <button
            type="submit"
            className="h-9 px-4 bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
          >
            Enviar
          </button>
        </form>
      </div>
      {/* Notificación */}
      {showNotification && (
        <div className="absolute top-12 left-0 right-0 mx-auto w-max z-50">
          <NotificationsForms message={notificationMessage} />
        </div>
      )}
      {/* <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 p-4">
        <h1 className="text-white text-[1.8rem] p-2 font-semibold text-center mb-4">
          CURSOS Y FORMACIONES
        </h1>
        <p className="text-center text-white/90 max-w-2xl mx-auto">
          Descubre nuestra selección de cursos especializados para profesionales
          del fútbol.{" "}
          <Link
            href="/Contact"
            className="underline font-medium hover:text-white"
          >
            ¿Tienes dudas? Contáctanos
          </Link>
        </p>
      </div> */}

      <div className="flex flex-col gap-4 justify-between w-full py-[1.5rem] max-w-[100rem] mx-auto md:flex-row">
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 lg:flex-nowrap">
          {/* Filtro por tipo de contrato */}

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="w-full md:max-w-[15rem] md:min-w-[12rem] p-2 border border-gray-300 rounded-md text-gray-700"
          >
            <option value="">Idioma</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* Filtro por posición */}

          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="w-full md:max-w-[15rem] md:min-w-[12rem] p-2 border border-gray-300 rounded-md text-gray-700"
          >
            <option value="">Modalidad de curso</option>
            {modalitys.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex justify-center items-center w-full md:max-w-[20rem] sm:text-xs md:text-md lg:text-md">
          <input
            type="text"
            placeholder="Buscar por título, modalidad, idioma o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
          />
        </div>
      </div>

      <div
        data-aos="fade-up"
        data-aos-duration="1000"
        className="grid grid-cols-1 max-w-[100rem] mx-auto sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4"
      >
        {filteredCursos.length ? (
          filteredCursos.map((curso, index) => (
            <CursoCard
              curso={curso}
              key={index}
              handleVerCursoClick={() => handleVerCursoClick(curso.id)}
            />
          ))
        ) : (
          <p className="text-gray-700 text-[1.2rem]">
            No se encontraron cursos.
          </p>
        )}
      </div>

      {loadingCurso && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-400"></div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-400"></div>
        </div>
      )}
    </div>
  );
};

export default CursosList;