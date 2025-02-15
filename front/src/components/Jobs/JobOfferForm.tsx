import { ICreateJobOffer } from "@/Interfaces/IOffer";
import { useContext, useState } from "react";
import { fetchCreateOffer } from "../Fetchs/OfertasFetch/OfertasFetchs";
import { UserContext } from "../Context/UserContext";
import ImageUpload from "../Cloudinary/ImageUpload";

const JobOfferForm = () => {
  const [formData, setFormData] = useState<ICreateJobOffer>({
    title: "",
    description: "",
    location: "",
    salary: 0,
    offerType: "",
    position: "",
    competencies: [],
    countries: [],
    imgUrl: "", 
    type: "",
  });

  const { token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Para el mensaje de éxito

  const isValidImageUrl = (url: string) => {
    const imageRegex = /\.(jpeg|jpg|gif|png|webp|svg)$/i;
    try {
      const parsedUrl = new URL(url, window.location.href); // Se ajusta para URLs relativas también
      return imageRegex.test(parsedUrl.pathname); // Validar si es una imagen
    } catch {
      return false;
    }
  };


  const handleImageUpload = (url: string) => {
  
    setFormData((prev) => ({
      ...prev,
      imgUrl: url, 
    }));
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "salary" ? parseInt(value) || 0 : value,
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, key: "competencies" | "countries") => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [key]: value.split(",").map((item) => item.trim()),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Limpiar mensaje de éxito previo

    // Validación de la URL de la imagen
    if (!isValidImageUrl(formData.imgUrl)) {
      setError("La URL de la imagen no es válida.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Token no disponible.");
      setLoading(false);
      return;
    }

    // Establecer un timeout de 2 segundos (simulando un proceso de validación)
    setTimeout(async () => {
      try {
        const response = await fetchCreateOffer(formData, token);
        console.log("Oferta creada:", response);
        setSuccessMessage("¡Oferta creada exitosamente!"); // Mensaje de éxito
        setFormData({
          title: "",
          description: "",
          location: "",
          salary: 0,
          offerType: "",
          position: "",
          competencies: [],
          countries: [],
          imgUrl: "", 
          type: "",
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }, 2000); // Simula una espera de 2 segundos antes de enviar
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4">Crear Oferta de Trabajo</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Los campos del formulario */}
        {[ 
          { label: "Título", name: "title", type: "text" },
          { label: "Descripción", name: "description", type: "textarea" },
          { label: "Ubicación", name: "location", type: "text" },
          { label: "Salario", name: "salary", type: "number" },
          { label: "Tipo de Oferta", name: "offerType", type: "text" },
          { label: "Posición", name: "position", type: "text" },
          { label: "URL de la Imagen", name: "imgUrl", type: "text" },
          { label: "Tipo", name: "type", type: "text" },
        ].map((field) => (
          <div key={field.name} className="col-span-1">
            <label className="block font-medium mb-1">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={formData[field.name as keyof ICreateJobOffer] as string}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name as keyof ICreateJobOffer] as string}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            )}
          </div>
        ))}

        {/* Campo para cargar imagen */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <label className="block font-medium mb-1">Cargar Imagen</label>
        <ImageUpload onUpload={handleImageUpload} />
      </div>

    
        {/* Competencias y Países */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <label className="block font-medium mb-1">Competencias (separadas por coma)</label>
          <input
            type="text"
            onChange={(e) => handleArrayChange(e, "competencies")}
            className="w-full border rounded p-2"
            placeholder="Ej: Velocidad, Técnica de disparo"
            required
          />
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <label className="block font-medium mb-1">Países (separados por coma)</label>
          <input
            type="text"
            onChange={(e) => handleArrayChange(e, "countries")}
            className="w-full border rounded p-2"
            placeholder="Ej: España, Italia"
            required
          />
        </div>

        {/* Botón de enviar */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="w-full mt-4 p-2 text-white bg-green-800 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creando oferta..." : "Crear Oferta"}
          </button>
        </div>

        {/* Mensajes de notificación */}
        {error && <p className="col-span-1 md:col-span-2 lg:col-span-3 text-red-500 mt-2">{error}</p>}
        {successMessage && <p className="col-span-1 md:col-span-2 lg:col-span-3 text-green-700 mt-2">{successMessage}</p>}
      </form>
    </div>
  );
};

export default JobOfferForm;
