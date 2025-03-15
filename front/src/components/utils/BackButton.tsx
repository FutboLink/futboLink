import { useRouter } from "next/navigation";
import { BsArrowLeft } from "react-icons/bs"; // Importa la flecha

const BackButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()} // Regresa a la página anterior
      className="flex items-center gap-2 px-4 py-2 bg-white font-semibold text-gray-600 border rounded-lg hover:bg-gray-300 transition"
    >
      <BsArrowLeft size={20} className="text-gray-600" /> Volver a aplicaciones
    </button>
  );
};

export default BackButton;
