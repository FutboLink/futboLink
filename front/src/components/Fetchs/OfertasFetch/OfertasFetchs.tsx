import { ICreateJob, ICreateJobOffer, IJobApplication, IOfferCard } from "@/Interfaces/IOffer";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


//Formulario crear job
export const fetchCreateOffer = async (offer:ICreateJobOffer, token:string) => {

  const response = await fetch(`${apiUrl}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(offer),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error desconocido");
  }

  const data = await response.json();
  return data;
};


//Formulario crear job
export const fetchCreateJob = async (offer: ICreateJob, token: string) => {
  console.log("Sending job offer data:", JSON.stringify(offer, null, 2));
  
  try {
    const response = await fetch(`${apiUrl}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(offer),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Error response from server:", data);
      throw new Error(data.message || "Error desconocido al crear oferta");
    }

    return data;
  } catch (error) {
    console.error("Error in fetchCreateJob:", error);
    throw error;
  }
};



//Listar aplicaciones de un trabajo por Id
export const fetchApplicationsByJobId = async (jobId: string): Promise<IJobApplication[]> => {
  try {
    const response = await fetch(`${apiUrl}/applications/jobs/${jobId}`);
    if (!response.ok) throw new Error("Error al obtener aplicaciones");
    return await response.json();
  } catch (error) {
    console.error("Error en fetchApplicationsByJobId:", error);
    return [];
  }
};




export const fetchJobOfferById = async (jobId: string): Promise<IOfferCard | null> => {
  try {
    const response = await fetch(`${apiUrl}/jobs/${jobId}`);
    if (!response.ok) throw new Error("No se pudo obtener la oferta de trabajo");
    return await response.json();
  } catch (error) {
    console.error("Error en fetchJobOfferById:", error);
    return null;
  }
};
