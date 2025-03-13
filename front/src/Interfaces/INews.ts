export interface INews {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

// Interfaz para las props de la página de noticia
export interface INewsPageProps {
  params: Promise<{ id: string }>;
}

