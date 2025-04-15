import { CategoryCursos, ICurso } from "@/Interfaces/ICursos";

// Simula una función para obtener cursos desde un servidor
export const fetchCursos = (): ICurso[] => {
  const cursosMock: ICurso[] = [
    {
      id: "1",
      image: "/cesped.jpg",
      description:"",
      title: "Curso de Desarrollo Web",
      category: CategoryCursos.Curso,
      country: "Perú",
      language: "Español",
      modality: "Online",
      contact: "contacto@desarrolloweb.com"
    },
    {
      id: "2",
      image: "/cesped.jpg",
      description:"",
      title: "Master en Inteligencia Artificial",
      category: CategoryCursos.Master,
      country: "Argentina",
      language: "Inglés",
      modality: "Presencial",
      contact: "info@ai-master.com"
    },
    {
      id: "3",
      image: "/cesped.jpg",
      description:"",
      title: "Seminario de Marketing Digital",
      category: CategoryCursos.Seminario,
      country: "Chile",
      language: "Español",
      modality: "Híbrido",
      contact: "contacto@marketingseminario.com"
    }
  ];

  return cursosMock; // Retorna los datos directamente
};
