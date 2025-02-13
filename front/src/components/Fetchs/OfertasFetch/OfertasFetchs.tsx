import { ICreateJobOffer } from "@/Interfaces/IOffer";

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