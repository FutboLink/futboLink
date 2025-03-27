import { FaStar } from "react-icons/fa";
import Image from "next/image";

interface ClientProps {
  name: string;
  role: string;
  testimonial: string;
  imgUrl: string;
}

const clients: ClientProps[] = [
  {
    name: "Pablo Toani",
    role: "Jugador de Fútbol",
    testimonial:
      "Gracias a FutboLink, encontré mi oportunidad en Italia y hoy formo parte del ASD Mesoraca Calcio, un equipo de la Liga Promozione. ¡Gracias por todo el apoyo!",
    imgUrl: "/fotoPablo.jpg",
  },
];

const ClientsSection: React.FC = () => {
  return (
    <section className="bg-[#f5f5f5] py-12 ">
      <div className="container mx-auto text-center ">
        <h2 className="text-3xl font-semibold text-[#1d5126] mb-8">
          Nuestros Clientes
        </h2>
        <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {clients.map((client, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
            >
              <div className="flex flex-col items-center hover:scale-105">
                <Image
                  src={client.imgUrl}
                  alt={client.name}
                  width={120}
                  height={120}
                  className="rounded-full mb-4"
                />
                <h3 className="text-xl font-semibold text-[#1d5126]">
                  {client.name}
                </h3>
                <p className="text-sm text-gray-600">{client.role}</p>
              </div>
              <p className="text-gray-700 mt-4 italic">{client.testimonial}</p>
              <div className="flex justify-center mt-4">
                <FaStar className="text-yellow-500" />
                <FaStar className="text-yellow-500" />
                <FaStar className="text-yellow-500" />
                <FaStar className="text-yellow-500" />
                <FaStar className="text-yellow-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;
