import React, { useState } from "react";
import Image from "next/image";
import { ICurso } from "@/Interfaces/ICursos";
import Link from "next/link";
import { contact } from "@/components/Fetchs/UsersFetchs/UserFetchs";
import { NotificationsForms } from "@/components/Notifications/NotificationsForms";

const CardCurso: React.FC<{ curso: ICurso }> = ({ curso }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

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

    const { success } = await contact(email, name, mensaje);

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

  const asd = {
    id: "139f2cc9-e1cf-40b7-b895-a76c6f738bbe",
    image:
      "https://res.cloudinary.com/dagcofbhm/image/upload/v1746620093/e8fx36diyhko5adsq4k3.jpg",
    title: "Curso de Analista Táctico en Fútbol",
    description:
      "Aprendé a analizar partidos de forma profesional utilizando herramientas como Wyscout, LongoMatch y conceptos de táctica moderna. Ideal para entrenadores, scouts y analistas de video.",
    category: "Curso",
    country: "España ",
    language: "Español",
    modality: "100% Online Virtual",
    contact: "info@escueladefutbolpro.com",
  };
  return (
    <section className="max-w-[100rem] mx-auto overflow-hidden">
      {/* Botón de volver */}
      <div className="mb-6">
        <Link
          href="/cursos"
          className="inline-flex items-center text-green-600 hover:text-green-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Volver a cursos
        </Link>
      </div>

      {/* Imagen superior del curso */}
      <div className="relative h-64 md:h-96 rounded-[1.25rem] overflow-hidden border border-green-700 shadow-sm mb-8">
        <Image
          src={curso.image}
          alt={curso.title}
          layout="fill"
          objectFit="cover"
          className="w-full h-64 md:h-96 object-cover"
        />
      </div>

      {/* Contenido del curso */}
      <div className="bg-white rounded-[1.25rem] p-4 py-8 md:p-8 space-y-4">
        {/* Contenido del curso */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información principal */}
          <div className="h-full lg:col-span-2">
            <div className="bg-white h-full border border-green-700 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-green-700 py-4 px-6">
                <h1 className="text-white text-2xl font-bold">{curso.title}</h1>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-6">{curso.description}</p>

                <h2 className="text-lg font-semibold text-green-700 mb-3">
                  Información del curso
                </h2>
                <ul className="list-disc pl-5 pb-[2rem] mb-6 space-y-1">
                  <li className="text-gray-700">
                    <span className="text-gray-600 pr-2">Categoría:</span>
                    <span className="font-medium">{curso.category}</span>
                  </li>
                  <li className="text-gray-700 ">
                    <span className="text-gray-600 pr-2">País:</span>
                    <span className="font-medium">{curso.country}</span>
                  </li>
                  <li className="text-gray-700">
                    <span className="text-gray-600 pr-2">Idioma:</span>
                    <span className="font-medium">{curso.language}</span>
                  </li>
                  <li className="text-gray-700">
                    <span className="text-gray-600 pr-2">Modalidad:</span>
                    <span className="font-medium">{curso.modality}</span>
                  </li>
                </ul>

                {/* Botón de inscripción */}
                <Link
                  href={`https://wa.me/+393715851071?text=${encodeURIComponent(
                    `Hola! Quiero inscribirme al curso ${curso.title}...`
                  )}`}
                  target="_blank"
                  className="w-full md:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                >
                  Inscribirme en este curso
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar con información adicional */}
          <div>
            {/* <div className="bg-white border border-green-400 rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="bg-green-400 py-3 px-4">
                <h2 className="text-white font-semibold">
                  Información del curso
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Categoría:</span>
                  <span className="font-medium">{curso.category}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">País:</span>
                  <span className="font-medium">{curso.country}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Idioma:</span>
                  <span className="font-medium">{curso.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Modalidad:</span>
                  <span className="font-medium">{curso.modality}</span>
                </div>
              </div>
            </div> */}

            {/* Formulario de contacto */}
            <div className="bg-white border border-green-700 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-green-700 py-3 px-4">
                <h2 className="text-white font-semibold">
                  ¿Necesitas más información?
                </h2>
              </div>
              <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      aria-label="Nombre"
                      id="name"
                      type="text"
                      value={name} // Vinculamos el estado de `name` con el input
                      onChange={(e) => setName(e.target.value)} // Actualizamos el estado con el valor del input
                      placeholder="Nombre *"
                      className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-400"
                      required
                    />
                  </div>
                  <div>
                    <input
                      aria-label="Correo electrónico"
                      id="email"
                      type="email"
                      value={email} // Vinculamos el estado de `email` con el input
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Correo electrónico *"
                      className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-400"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      aria-label="Mensaje"
                      id="message"
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      placeholder="Tu consulta sobre este curso *"
                      className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-400 min-h-[100px] resize-none"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                  >
                    Enviar consulta
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">
                    También puedes contactarnos directamente:
                  </p>
                  <Link
                    href={`mailto:${curso.contact}`}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    {curso.contact}
                  </Link>

                  {/* Notificación */}
                  {showNotification && (
                    <div className="absolute top-12 left-0 right-0 mx-auto w-max z-50">
                      <NotificationsForms message={notificationMessage} />
                    </div>
                  )}
                  {/* <div className="flex space-x-2 mt-3">
                    <a
                      href="#"
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                        />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                        />
                      </svg>
                    </a>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CardCurso;