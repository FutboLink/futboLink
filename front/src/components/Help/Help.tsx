"use client";

import React, { useState } from "react";
import Image from "next/image";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  EffectFade,
  Keyboard,
  Mousewheel,
  Navigation,
  Pagination,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../Styles/help-swiper.css";

const helpData: IHelp[] = [
  {
    section: "Candidatos",
    image: "/contratacion.svg",
    topics: [
      {
        title: "¿Cómo me registro como jugador o profesional?",
        content: `Puedes registrarte en FutboLink como jugador o profesional ingresando a la sección 
        “Registrarse” en nuestra página web, luego seleccionas la opción “Jugadores y 
        Profesionales”. Debes completar el formulario de registro con el rol y datos 
        correspondientes.`,
      },
      {
        title: "¿Cómo postularse a una vacante?",
        content: `Los jugadores y profesionales pueden postularse desde la sección de “Ofertas”. Solo debes 
        seleccionar una oferta y hacer clic en "Aplicar". Asegúrate de que tu perfil esté completo 
        para mejorar tus posibilidades.`,
      },
      {
        title: "¿Cómo destacarse frente a los reclutadores?",
        content: `Completa tu perfil al 100%, incluyendo experiencia, certificaciones y videos, para aumentar 
        tus posibilidades de ser contactado.`,
      },
    ],
  },
  {
    section: "Ofertante",
    image: "/oferta-de-trabajo.svg",
    topics: [
      {
        title: "¿Cómo me registro como ofertante?",
        content: `Puedes registrarte en FutboLink como reclutador, club, agencia o agente ingresando a la 
sección “Registrarse” en nuestra página web, luego seleccionas la opción “Ofertante” 
Debes completar el formulario de registro con el rol y datos correspondientes.`,
      },
      {
        title: "¿Cómo publicar una oferta de trabajo en FutboLink?",
        content: `Si eres oferente, puedes publicar una oferta de forma gratuita desde tu panel de control. 
Haciendo clic sobre “Crear Oferta” luego debes completar los datos de la oferta que deseas 
publicar.`,
      },
      {
        title: "¿Cómo ver los postulados a una oferta?",
        content: `En el panel de control haz clic en “Mis Ofertas” luego selecciona la oferta publicada y 
accede a  “Ver Postulados”, junto con sus perfiles y datos de contacto.`,
      },
    ],
  },
  {
    section: "Suscripciones y Pagos",
    image: "/modelo-de-negocio-de-suscripcion.svg",
    topics: [
      {
        title: "No puedo acceder a mi cuenta, ¿qué hago?",
        content: (
          <>
            Ponte en contacto con nuestro soporte en{" "}
            <a
              href="mailto:futbolink.contacto@gmail.com"
              className="text-green-700 underline"
            >
              futbolink.contacto@gmail.com
            </a>
            .
          </>
        ),
      },
      {
        title: "¿Qué hacer si hay un error en el pago de mi suscripción? ",
        content: (
          <>
            Ponte en contacto con nuestro soporte en{" "}
            <a
              href="mailto:futbolink.contacto@gmail.com"
              className="text-green-700 underline"
            >
              futbolink.contacto@gmail.com
            </a>
            .
          </>
        ),
      },
      {
        title: "¿Cómo contratar una suscripción? ",
        content: `Desde la sección "Precios", elige el plan que mejor se adapte a tus necesidades y sigue el 
proceso de pago seguro.`,
      },
      {
        title: "¿Cómo dar de baja mi suscripción? ",
        content: `Puedes cancelar tu suscripción en la configuración de tu cuenta. La cancelación se hará 
efectiva al finalizar el período de facturación actual. `,
      },
      {
        title: "¿Qué diferencias hay entre cada suscripción?",
        content: `
    Suscripción Amateur (3,95€): Acceso a ofertas básicas. Acceso a cursos con descuento.
    Suscripción Profesional (7,95€): Acceso a todas las ofertas, incluyendo internacionales, cursos y entrenamientos con descuento. Perfil destacado.
  `,
      },
    ],
  },
  {
    section: "Seguridad y Uso de la Plataforma",
    image: "/seguro-de-vida.svg",
    topics: [
      {
        title: "¿Cómo identificar una oferta falsa? ",
        content: `Si una oferta parece sospechosa, revisa los datos del ofertante y contacta con nuestro 
soporte si tienes dudas.`,
      },
      {
        title: "¿Qué son las ofertas básicas y las internacionales?  ",
        content: `Las ofertas básicas están disponibles en el plan Amateur y en tu país o región, mientras que 
las internacionales solo pueden ser vistas por usuarios con el plan Profesional.`,
      },
      {
        title: "¿Cómo funciona el perfil destacado?",
        content: `Los usuarios con suscripción Profesional obtienen un ícono de botín color oro en su perfil, 
lo que les da mayor visibilidad ante los reclutadores.`,
      },
      {
        title: "¿Cómo puedo contactar con soporte técnico? ",
        content: (
          <>
            Puedes enviarnos un mensaje desde la sección de "Ayuda" o
            escribirnos a nuestro correo de atención al cliente:{" "}
            <a
              href="mailto:futbolink.contacto@gmail.com"
              className="text-green-700 underline"
            >
              futbolink.contacto@gmail.com
            </a>
            .
          </>
        ),
      },
    ],
  },
];
interface IHelpTopic {
  title: string;
  content: string | React.ReactNode;
}
interface IHelp {
  section: string;
  image: string;
  topics: IHelpTopic[];
}

const HelpPage = () => {
  const [activeSection, setActiveSection] = useState<IHelp | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  function handleButton(data: IHelp) {
    if (activeSection?.section && activeSection === data) {
      setActiveSection(null);
      return;
    }
    setActiveSection(data);
  }

  return (
    <div className="mt-12 p-4 py-[4rem] bg-gray-100 sm:p-6 sm:py-[4rem] lg:p-12 lg:pb-16">
      <h1 className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white text-[1.8rem] p-2 font-semibold text-center">
        Preguntas Frecuentes (FAQs) - FutboLink
      </h1>
      <div className="relative section mx-auto w-full  lg:w-4/6 p-6 mt-8 bg-white rounded-xl shadow-xl border border-gray-200">
        <div className="grid grid-cols-2 gap-4 items-center md:grid-cols-2">
          {helpData.map((section) => (
            <div
              key={section.section}
              className="w-full h-full min-h-[12rem] border border-[#3e7c27] rounded-[1.25rem] overflow-hidden bg-gray-50 shadow-md"
            >
              <button
                onClick={() => handleButton(section)}
                className={`flex flex-col items-center justify-center gap-4 button w-full h-full text-center font-semibold text-[1rem] md:text-lg text-gray-800 p-4 border-b border-gray-300 bg-gray-100 hover:bg-[#3e7c271a] transition-colors rounded-[1.25rem] leading-[1.2]
                ${
                  activeSection?.section === section.section
                    ? "bg-[#3e7c271a]"
                    : "hover:bg-[#3e7c271a]"
                }`}
              >
                <Image
                  src={section.image}
                  alt={section.section}
                  width={50}
                  height={50}
                />

                {section.section}
              </button>
            </div>
          ))}
        </div>
        {activeSection && (
          <div className="absolute top-0 left-0 w-full min-h-full bg-white p-6 space-y-4 rounded-[1.25rem] mb-4">
            <div className="flex items-center gap-4 font-semibold text-[#3e7c27] text-lg text-gray-800">
              <button
                className="text-[1.5rem]"
                type="button"
                onClick={() => setActiveSection(null)}
              >
                ❮
              </button>
              <h2>{activeSection.section}</h2>
            </div>
            {activeSection?.topics?.map((topic) => (
              <div
                key={topic.title}
                className="bg-white border rounded-lg shadow-sm"
              >
                <button
                  onClick={() =>
                    setActiveTopic(
                      activeTopic === topic.title ? null : topic.title
                    )
                  }
                  className="w-full text-left text-gray-700 font-medium p-4 border-b border-gray-300  bg-gray-100 hover:bg-gray-200 transition-colors rounded-t-lg "
                >
                  {topic.title}
                </button>
                {activeTopic === topic.title && (
                  <p className="p-4 bg-white rounded-md text-gray-600 text-sm">
                    {topic.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 className="text-green-800 text-[1.8rem] p-2 font-semibold text-center pt-[4rem] pb-[2rem]">
        Tutoriales útiles
      </h2>
      <Swiper
        slidesPerView={"auto"}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        cssMode={true}
        navigation={true}
        mousewheel={true}
        keyboard={true}
        modules={[Navigation, Pagination, Mousewheel, Keyboard]}
        loop
        className="w-full min-h-[20rem] max-w-[100rem] mx-auto"
      >
        <SwiperSlide className="!w-fit">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/HGVwe0oQpoU?si=1P-L-8sRc3WRnm8g"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full rounded-[1.25rem] md:min-w-[35rem]"
          ></iframe>
        </SwiperSlide>
        <SwiperSlide className="!w-fit">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/FxByNvqjMyE?si=tWadxAYnhqO0WBpt"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full  rounded-[1.25rem] md:min-w-[35rem]"
          ></iframe>
        </SwiperSlide>
        <SwiperSlide className="!w-fit">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/6BNkrYEQIeQ?si=FGrWTquXasGDuTS3"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full  rounded-[1.25rem] md:min-w-[35rem]"
          ></iframe>
        </SwiperSlide>
        <SwiperSlide className="!w-fit">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/u9wKO0s0qGg?si=sfyrvdsjkOTo5ry2"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full rounded-[1.25rem] md:min-w-[35rem]"
          ></iframe>
        </SwiperSlide>
        <SwiperSlide className="!w-fit">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/upidCYmgeOE?si=hDp-VNYJJd0U63tJ"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full rounded-[1.25rem] md:min-w-[35rem]"
          ></iframe>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default HelpPage;
