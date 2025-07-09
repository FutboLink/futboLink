// components/AboutUs/about.tsx
import Image from "next/image";
import logo from "../../../public/logoD.png";

function About() {
  return (
    <section className="p-8 bg-white" id="sobre-futbolink">
      <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
        Sobre Futbolink
      </h2>
      <div className="flex flex-col lg:flex-row items-center gap-8 space-y-8 lg:space-y-0">
        {/* Imagen de la empresa o logo */}
        <div className="flex-shrink-0">
          <Image
            src={logo}
            alt="Futbolink Logo"
            width={250}
            height={250}
            className="rounded-full"
          />
        </div>

        {/* Descripción de la empresa */}
        <div className="text-lg text-gray-700 space-y-4 mt-6 lg:mt-0">
          <p className="text-base sm:text-lg">
            <strong>Futbolink</strong> es la plataforma líder que conecta jugadores, agentes, y
            clubes de fútbol con oportunidades únicas para crecer y
            desarrollarse en el mundo del fútbol profesional. En <strong>Futbolink</strong> ofrecemos
            ofertas de empleo, cursos de formación y todo lo necesario para
            llevar tu carrera al siguiente nivel.
          </p>
          <p className="text-base sm:text-lg">
            El equipo de <strong>Futbolink</strong> está formado por profesionales apasionados por el
            fútbol, comprometidos con brindar a nuestros usuarios las mejores
            herramientas para alcanzar el éxito en su carrera deportiva. <strong>Futbolink</strong> es 
            tu mejor aliado para encontrar oportunidades en el mundo del fútbol.
          </p>
          <p className="text-base sm:text-lg font-semibold text-verde-oscuro">
            ¿Por qué elegir Futbolink? Porque somos la conexión que necesitas para impulsar 
            tu futuro en el fútbol profesional.
          </p>
        </div>
      </div>
      <hr className="border-t-2 mt-14 border-gray-300 my-4" />
    </section>
  );
}

export default About;
