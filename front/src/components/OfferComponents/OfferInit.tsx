import Image from "next/image";

function OfferInit() {
  return (
    <div className="flex justify-between items-center p-8">
      {/* Imagen de la izquierda */}
      <div className="w-1/2">
        <Image
          src="https://img.freepik.com/foto-gratis/accion-jugador-futbol-estadio_1150-14600.jpg?t=st=1736277956~exp=1736281556~hmac=bb712c79f67dd1b2ab825c842d1717773e01d1cb32d90c5b5999e645e05b21d6&w=996"
          alt="Acción en el estadio de fútbol"
          width={996}
          height={561}
          className="rounded-lg shadow-lg"
        />
      </div>

      {/* Texto a la derecha */}
      <div className="w-1/2 pl-8">
        <h2 className="text-3xl font-semibold mb-4">
          Bolsa de empleo Futbol Career: Encuentra tu futuro en el fútbol
        </h2>
        <p className="text-lg mb-4">
          ¿Te apasiona el fútbol y buscas avanzar en tu carrera profesional? En
          FutbolJobs te ofrecemos una plataforma especializada para conectar con
          las mejores oportunidades laborales dentro del mundo del fútbol.
        </p>
        <p className="text-lg mb-4">
          Sabemos lo competitivo y demandante que puede ser el sector deportivo,
          por eso nos aseguramos de brindarte acceso a ofertas de trabajo que te
          ayudarán a destacar, ya sea en clubes de renombre o en equipos en
          ascenso.
        </p>
        <p className="text-lg mb-4">
          Con nuestra bolsa de empleo, tendrás la oportunidad de encontrar el
          puesto adecuado para ti, y dar el siguiente paso hacia una carrera
          exitosa en el mundo del fútbol. ¡No pierdas la oportunidad de
          encontrar el empleo que siempre has soñado!
        </p>
      </div>
    </div>
  );
}

export default OfferInit;
