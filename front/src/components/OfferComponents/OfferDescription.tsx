import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // Importa los estilos de AOS

const OfferDescription = () => {
  useEffect(() => {
    // Inicializa AOS
    AOS.init({
      duration: 1000,
      once: false, 
      offset: 20, 
    });
  }, []);

  return (
    <div className="bg-white text-center p-6 rounded-lg shadow-lg text-black">
      <h2
        className="text-3xl font-semibold text-center mb-6"
        data-aos="fade-up"
      >
        ¿Estás buscando oportunidades laborales en el apasionante mundo del
        fútbol?
      </h2>

      <p className="text-lg mb-4" data-aos="fade-up">
        En <strong>FutbolJobs</strong>, aprovechamos nuestro profundo
        conocimiento de este deporte para brindarte las mejores ofertas de
        trabajo en el fútbol. Sabemos que el deporte rey es un mercado altamente
        competitivo y lucrativo, por lo que encontrar el empleo adecuado puede
        resultar todo un desafío si no se sabe dónde buscar. Es por eso que en
        FutbolJobs nos destacamos al ofrecer las mejores oportunidades de
        trabajo para aquellos que desean adentrarse en el mundo del fútbol
        profesional.
      </p>

      <p className="text-lg mb-4" data-aos="fade-up">
        Nuestra bolsa de empleo especializada en fútbol, ofreciendo trabajos en
        clubes o equipos, es tu mejor aliado en esta búsqueda. Al igual que en
        cualquier otro mercado, estar informado y estar en el lugar adecuado en
        el momento oportuno es fundamental para aprovechar las mejores ofertas.
        En FutbolJobs, te ofrecemos una amplia gama de posibilidades laborales
        en diferentes roles dentro de un club o equipo de fútbol. Desde
        posiciones técnicas hasta administrativas, nuestra bolsa de trabajo
        cubre todas las áreas especializadas de trabajos relacionados con el
        fútbol.
      </p>

      <p className="text-lg mb-4" data-aos="fade-up">
        No importa si estás buscando trabajar en un club de renombre o en un
        equipo en ascenso, en FutbolJobs tenemos lo que necesitas para encontrar
        tu próxima oferta de trabajo en el mercado laboral del fútbol. ¡Descubre
        las mejores ofertas de empleo en nuestra bolsa de trabajo y da el primer
        paso hacia una carrera profesional exitosa en el mundo del fútbol!
      </p>

      <p className="text-lg mb-4" data-aos="fade-up">
        ¿Te dedicas al mundo del fútbol? Únete a nuestra bolsa de trabajo y abre
        nuevas puertas en tu carrera profesional. Ya seas jugador, entrenador,
        preparador físico, ojeador o tengas cualquier otro perfil relacionado
        con este apasionante deporte, en Futboljobs te ofrecemos una amplia gama
        de oportunidades laborales tanto en España como en el extranjero.
      </p>

      <p className="text-lg mb-4" data-aos="fade-up">
        No importa si estás buscando mejorar tus opciones laborales o
        simplemente deseas un cambio de aires, en nuestra plataforma encontrarás
        ofertas que se adaptan a tus necesidades y objetivos. Sabemos que el
        mercado del fútbol está en constante movimiento, y es por eso que
        mantenemos nuestra bolsa de trabajo actualizada con las últimas
        oportunidades laborales disponibles.
      </p>

      <p className="text-lg mb-4" data-aos="fade-up">
        Aprovecha cualquier momento del año para explorar las posibilidades que
        tenemos para ti. Los clubs de fútbol siempre están buscando
        profesionales apasionados que deseen formar parte de este emocionante
        mundo. ¡No te pierdas ninguna oportunidad! Regístrate hoy mismo para
        estar al tanto de todas las novedades y oportunidades laborales
        relacionadas con el fútbol.
      </p>

      <p className="text-lg mb-4" data-aos="fade-up">
        Descubre las mejores oportunidades laborales en el mundo del fútbol a
        través de nuestra exclusiva Bolsa de Empleo. Estar al tanto de los
        movimientos del mercado es crucial para acceder a las mejores ofertas
        laborales, como suele decirse: estar en el lugar adecuado en el momento
        oportuno. La bolsa de empleo de Futboljobs te ofrece una amplia gama de
        oportunidades en diversos roles relacionados con el fútbol. Desde
        trabajar en un club hasta formar parte de un equipo, cada posición
        demanda una especialización específica, especialmente en los clubes de
        élite que suelen ofrecer salarios competitivos. Aquí, en nuestra
        plataforma, encontrarás todo lo necesario para insertarte en este
        emocionante mercado laboral. ¡Aprovecha estas ofertas y encuentra tu
        lugar en el mundo del fútbol!
      </p>
    </div>
  );
};

export default OfferDescription;
