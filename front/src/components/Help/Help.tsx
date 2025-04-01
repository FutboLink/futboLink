"use client";

import React, { useState } from "react";

const helpData = [
  {
    section: "Candidatos",
    topics: [
      { 
        title: "¿Cómo me registro como jugador o profesional?", 
        content: `Puedes registrarte en FutboLink como jugador o profesional ingresando a la sección 
        “Registrarse” en nuestra página web, luego seleccionas la opción “Jugadores y 
        Profesionales”. Debes completar el formulario de registro con el rol y datos 
        correspondientes.`
      },
      { 
        title: "¿Cómo postularse a una vacante?", 
        content: `Los jugadores y profesionales pueden postularse desde la sección de “Ofertas”. Solo debes 
        seleccionar una oferta y hacer clic en "Aplicar". Asegúrate de que tu perfil esté completo 
        para mejorar tus posibilidades.`
      },
      { 
        title: "¿Cómo destacarse frente a los reclutadores?", 
        content: `Completa tu perfil al 100%, incluyendo experiencia, certificaciones y videos, para aumentar 
        tus posibilidades de ser contactado.`
      }
    ]
  },    
  {
    section: "Ofertante",
    topics: [
      { title: "¿Cómo me registro como ofertante?", content: `Puedes registrarte en FutboLink como reclutador, club, agencia o agente ingresando a la 
sección “Registrarse” en nuestra página web, luego seleccionas la opción “Ofertante” 
Debes completar el formulario de registro con el rol y datos correspondientes.`},
      { title: "¿Cómo publicar una oferta de trabajo en FutboLink?", content: `Si eres oferente, puedes publicar una oferta de forma gratuita desde tu panel de control. 
Haciendo clic sobre “Crear Oferta” luego debes completar los datos de la oferta que deseas 
publicar.` },
{ title: "¿Cómo ver los postulados a una oferta?", content: `En el panel de control haz clic en “Mis Ofertas” luego selecciona la oferta publicada y 
accede a  “Ver Postulados”, junto con sus perfiles y datos de contacto.` },
    ],
  },
  {
    section: "Suscripciones y Pagos",
    topics: [
        { title: "No puedo acceder a mi cuenta, ¿qué hago?", content: `Ponte en contacto con nuestro soporte en futbolink.contacto@gmail.com.` },
            { title: "¿Qué hacer si hay un error en el pago de mi suscripción? ", content: `Ponte en contacto con nuestro soporte en futbolink.contacto@gmail.com.` },
                { title: "¿Cómo contratar una suscripción? ", content: `Desde la sección "Precios", elige el plan que mejor se adapte a tus necesidades y sigue el 
proceso de pago seguro.` },
                    { title: "¿Cómo dar de baja mi suscripción? ", content: `Puedes cancelar tu suscripción en la configuración de tu cuenta. La cancelación se hará 
efectiva al finalizar el período de facturación actual. ` },
{ title: "¿Qué diferencias hay entre cada suscripción?", content: `
    Suscripción Amateur (3,95€): Acceso a ofertas básicas. Acceso a cursos con descuento.
    Suscripción Profesional (7,95€): Acceso a todas las ofertas, incluyendo internacionales, cursos y entrenamientos con descuento. Perfil destacado.
  `, },
    ],
  },
  {
    section: "Seguridad y Uso de la Plataforma",
    topics: [
      { title: "¿Cómo identificar una oferta falsa? ", content: `Si una oferta parece sospechosa, revisa los datos del ofertante y contacta con nuestro 
soporte si tienes dudas.`},
      { title: "¿Qué son las ofertas básicas y las internacionales?  ", content: `Las ofertas básicas están disponibles en el plan Amateur y en tu país o región, mientras que 
las internacionales solo pueden ser vistas por usuarios con el plan Profesional.` },
{ title: "¿Cómo funciona el perfil destacado?", content: `Los usuarios con suscripción Profesional obtienen un ícono de botín color oro en su perfil, 
lo que les da mayor visibilidad ante los reclutadores.` },
{ title: "¿Cómo puedo contactar con soporte técnico? ", content: `Puedes enviarnos un mensaje desde la sección de "Ayuda" o escribirnos a nuestro correo 
de atención al cliente. futbolink.contacto@gmail.com. 
` },
    ],
  },
];

const HelpPage = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="section w-4/6 p-6 mt-24 bg-white rounded-xl shadow-xl border border-gray-200">
        <div className="intro">
          <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800">Preguntas Frecuentes (FAQs) - FutboLink</h1>
        </div>
        <div className="space-y-6">
          {helpData.map((section) => (
            <div key={section.section} className="cardContainer border border-gray-300 rounded-lg bg-gray-50 shadow-md">
              <button
                onClick={() => setActiveSection(activeSection === section.section ? null : section.section)}
                className="button w-full text-left font-semibold text-lg text-gray-800 p-4 border-b border-gray-300 bg-gray-100 hover:bg-green-200 transition-colors rounded-t-lg"
              >
                {section.section}
              </button>
              {activeSection === section.section && (
                <div className="pl-6 mt-4 space-y-4 bg-gray-100 rounded-b-lg mb-4">
                  {section.topics.map((topic) => (
                    <div key={topic.title} className="bg-white border border-gray-300  rounded-lg shadow-sm">
                      <button
                        onClick={() => setActiveTopic(activeTopic === topic.title ? null : topic.title)}
                        className="w-full text-left text-gray-700 font-medium p-4 border-b border-gray-300 bg-gray-200 hover:bg-gray-300 transition-colors rounded-t-lg "
                      >
                        {topic.title}
                      </button>
                      {activeTopic === topic.title && (
                        <p className="p-4 bg-white rounded-md text-gray-600 text-sm">{topic.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
};

export default HelpPage;
