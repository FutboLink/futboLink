import { IOfferCard } from "@/Interfaces/IOffer";

export const mockOffers: IOfferCard[] = [
  {
    title: "Entrenador de Fútbol Profesional",
    description: "Buscamos un entrenador con experiencia para equipo profesional de fútbol.",
    location: "Madrid, España",
    salary: "50000",
    createdAt: "2025-02-13T10:00:00Z",
    status: "activo", // Estado de la oferta
    offerType: "Full-time",
    position: "Entrenador Principal",
    competencies: ["Liderazgo", "Estrategia", "Trabajo en equipo"],
    countries: ["ES"],
    imgUrl: "/publicarOfertas.JPG", // Imágen por defecto
    type: "Deportes", // Tipo de oferta
    recruiter: {
      id: "recruiter1",
      role: "RECRUITER", // Rol del reclutador
    },
  },
  {
    title: "Fisioterapeuta Deportivo",
    description: "Se busca fisioterapeuta especializado en fútbol para equipo de Primera División.",
    location: "Buenos Aires, Argentina",
    salary: "35000",
    createdAt: "2025-02-10T09:30:00Z",
    status: "activo", // Estado de la oferta
    offerType: "Full-time",
    position: "Fisioterapeuta",
    competencies: ["Atención al detalle", "Trabajo bajo presión", "Conocimiento en rehabilitación"],
    countries: ["AR"],
    imgUrl: "/cursosYformaciones.JPG", // Imágen por defecto
    type: "Deportes", // Tipo de oferta
    recruiter: {
      id: "recruiter2",
      role: "AGENCY", // Rol del reclutador
    },
  },
  {
    title: "Preparador Físico de Fútbol",
    description: "Se necesita preparador físico para equipo profesional con enfoque en alto rendimiento.",
    location: "Lima, Perú",
    salary: "40000",
    createdAt: "2025-02-05T08:15:00Z",
    status: "activo", // Estado de la oferta
    offerType: "Part-time",
    position: "Preparador Físico",
    competencies: ["Planificación", "Resistencia", "Nutrición deportiva"],
    countries: ["PE"],
    imgUrl: "/buscador.JPG", // Imágen por defecto
    type: "Deportes", // Tipo de oferta
    recruiter: {
      id: "recruiter3",
      role: "RECRUITER", // Rol del reclutador
    },
  },
];
