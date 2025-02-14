// components/AboutUs/about.tsx
import Image from "next/image";
import logo from "../../../public/logo.png";

function About() {
  return (
    <section className="p-8 bg-white">
      <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
        Sobre Nosotros
      </h2>
      <div className="flex flex-col lg:flex-row items-center gap-8 space-y-8 lg:space-y-0">
        {/* Imagen de la empresa o logo */}
        <div className="flex-shrink-0">
          <Image
            src={logo}
            alt="Futbol Career Logo"
            width={250}
            height={250}
            className="rounded-full"
          />
        </div>

        {/* Descripción de la empresa */}
        <div className="text-lg text-gray-700 space-y-4 mt-6 lg:mt-0">
          <p className="text-base sm:text-lg">
            En Futbol Career, nos dedicamos a conectar jugadores, agentes, y
            clubes de futbol con oportunidades únicas para crecer y
            desarrollarse en el mundo del futbol. Nuestra plataforma ofrece
            ofertas de empleo, cursos de formación y todo lo necesario para
            llevar tu carrera al siguiente nivel.
          </p>
          <p className="text-base sm:text-lg">
            Nuestro equipo está formado por profesionales apasionados por el
            futbol, comprometidos con brindar a nuestros usuarios las mejores
            herramientas para alcanzar el éxito en su carrera deportiva.
          </p>
        </div>
      </div>
      <hr className="border-t-2 mt-14 border-gray-300 my-4" />
    </section>
  );
}

export default About;
