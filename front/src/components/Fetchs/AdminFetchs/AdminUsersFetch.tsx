import { IApplication } from "@/Interfaces/IOffer";
import { IProfileData } from "@/Interfaces/IUser";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


// Función para obtener los usuarios
export const getUsers =  async (): Promise<IProfileData[]> => {
    try {
      const response = await fetch(`${apiUrl}/user`); 
      if (!response.ok) {
        throw new Error('Error al obtener los usuarios');
      }
      const users: IProfileData[] = await response.json();
      return users;
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  

  export const fetchApplications = async (application: IApplication) => {
 
  
    const response = await fetch(`${apiUrl}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(application),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error desconocido");
    }
  
    const data = await response.json();
    return data;
  };