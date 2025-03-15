import {  IOfferCard } from "@/Interfaces/IOffer";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export const getOfertas = async (): Promise<IOfferCard[]> => {
  try {
    const response = await fetch(`${apiUrl}/jobs`);
    if (!response.ok) {
      const errorDetails = await response.text();  // Captura el mensaje de error detallado
      throw new Error(`Error al obtener los trabajos: ${errorDetails}`);
    }
    const jobs: IOfferCard[] = await response.json();
    return jobs;
  } catch (error) {
    console.error("Error en getOfertas:", error);
    return [];
  }
};

  
  export const getOfertaById = async (id: string): Promise<IOfferCard | null> => {
    const response = await fetch(`${apiUrl}/jobs/${id}`);
    if (!response.ok) return null;
    return response.json();
  };
  