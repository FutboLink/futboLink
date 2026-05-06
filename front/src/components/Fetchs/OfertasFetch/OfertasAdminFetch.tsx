import {  IOfferCard } from "@/Interfaces/IOffer";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export interface PaginatedJobs {
  data: IOfferCard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Trae las ofertas del recruiter logueado (filtrado server-side, paginado).
// El backend usa el id del JWT, por eso no se manda en el query.
export const getMyOfertas = async (
  token: string,
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedJobs> => {
  const response = await fetch(
    `${apiUrl}/jobs/my?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok) {
    throw new Error(`Error al obtener mis ofertas (${response.status})`);
  }
  return response.json();
};


// Función para obtener jobs
export const getOfertas =  async (): Promise<IOfferCard[]> => {
  try {
    const response = await fetch(`${apiUrl}/jobs`); 
    if (!response.ok) {
      throw new Error('Error al obtener los usuarios');
    }
    const jobs: IOfferCard[] = await response.json();
    return jobs;
  } catch (error) {
    console.error(error);
    return [];
  }
};

  
export const getOfertaById = async (id: string): Promise<IOfferCard | null> => {
  try {
    const response = await fetch(`${apiUrl}/api/jobs/${id}`);
    if (!response.ok) {
      console.error('Error fetching job details:', await response.text());
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Exception fetching job details:', error);
    return null;
  }
};
  