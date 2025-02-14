import Image from "next/image";
import Link from "next/link";
import foto from "../../../public/fotoprof.png";

const RegistrationCards = () => {
  return (
    <div className="min-h-screen mt-28 text-black flex items-center justify-center bg-gray-100 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* Card Jugador */}

        <Link href="/OptionUsers/Player">


          <div className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition duration-300 h-[380px] flex flex-col items-center">
            <Image
              src={foto} // Cambia esta URL por la imagen adecuada
              alt="Jugador"
              width={200}
              height={200}
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Jugadores y Profesionales
            </h3>
            <p className="text-gray-600  text-center">
              Regístrate como jugador o profesional del mundo del deporte y comparte tus habilidades.
            </p>
          </div>
        </Link>

        {/* Card Representante */}
        <Link href="/OptionUsers/Manager">
          <div className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition duration-300 h-[380px] flex flex-col items-center">
            <Image
              src="https://img.freepik.com/foto-gratis/joven-apuesto-hombre-negocios-ordenador-portatil-oficina_1303-21060.jpg?t=st=1735402162~exp=1735405762~hmac=a9f53376cfd7059c1b7471743a8ec44c6afd61c7feabb2934b533ae785aa7a1b&w=1380" // Cambia esta URL por la imagen adecuada
              alt="Representante"
              width={200}
              height={200}
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Ofertante
            </h3>
            <p className="text-gray-600 text-center">
             Puedes publicar puestos o buscar jugadores para tus clientes.
            </p>
          </div>
        </Link>

        {/* Card Agencia */}
        <Link href="/OptionUsers/Agency">
          <div className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition duration-300 h-[380px] flex flex-col items-center">
            <Image
              src="https://img.freepik.com/foto-gratis/concepto-negocio-copia-espacio-mesa-escritorio-oficina-enfoque-pluma-analisis-grafico-computadora-bloc-notas-taza-cafe-tablero-desk-vintage-retro-filtro-enfoque-selectivo_1418-536.jpg?t=st=1735402112~exp=1735405712~hmac=6350a14095065e89bb8a0417032b314661f087cf856a24727cdd9ffd7f8a3cf2&w=1380" // Cambia esta URL por la imagen adecuada
              alt="Agencia"
              width={200}
              height={200}
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Agencia
            </h3>
            <p className="text-gray-600 text-center">
              Regístrate como agencia y gestiona varios representantes y
              jugadores.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default RegistrationCards;
