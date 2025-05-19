import { ISuccessCase } from "@/Interfaces/ISuccessCase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Obtener todos los casos de éxito
export const fetchAllSuccessCases = async (token?: string) => {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log(`Fetching success cases from: ${apiUrl}/success-cases`);
    const response = await fetch(`${apiUrl}/success-cases`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API response error:", response.status, errorData);
      throw new Error(errorData.message || "Error al obtener los casos de éxito");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener los casos de éxito:", error);
    throw error;
  }
};

// Obtener los casos de éxito publicados (para mostrar al público)
export const fetchPublishedSuccessCases = async () => {
  try {
    console.log(`Fetching published success cases from: ${apiUrl}/success-cases/published`);
    const response = await fetch(`${apiUrl}/success-cases/published`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API response error:", response.status, errorData);
      throw new Error(errorData.message || "Error al obtener los casos de éxito publicados");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error al obtener los casos de éxito publicados:", error);
    throw error;
  }
};

// Obtener un caso de éxito por ID
export const fetchSuccessCaseById = async (id: string) => {
  try {
    console.log(`Fetching success case by ID from: ${apiUrl}/success-cases/${id}`);
    const response = await fetch(`${apiUrl}/success-cases/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API response error:", response.status, errorData);
      throw new Error(errorData.message || "Error al obtener el caso de éxito");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error al obtener el caso de éxito:", error);
    throw error;
  }
};

// Crear un nuevo caso de éxito (requiere token de admin)
export const createSuccessCase = async (token: string, successCase: ISuccessCase) => {
  try {
    console.log(`Creating success case at: ${apiUrl}/success-cases`);
    console.log("Data being sent:", JSON.stringify(successCase));
    
    const response = await fetch(`${apiUrl}/success-cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(successCase),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API response error:", response.status, errorData);
      throw new Error(errorData.message || "Error al crear el caso de éxito");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al crear el caso de éxito:", error);
    throw error;
  }
};

// Actualizar un caso de éxito existente (requiere token de admin)
export const updateSuccessCase = async (token: string, id: string, successCase: Partial<ISuccessCase>) => {
  try {
    console.log(`Updating success case at: ${apiUrl}/success-cases/${id}`);
    console.log("Data being sent:", JSON.stringify(successCase));
    
    const response = await fetch(`${apiUrl}/success-cases/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(successCase),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API response error:", response.status, errorData);
      throw new Error(errorData.message || "Error al actualizar el caso de éxito");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al actualizar el caso de éxito:", error);
    throw error;
  }
};

// Eliminar un caso de éxito (requiere token de admin)
export const deleteSuccessCase = async (token: string, id: string) => {
  try {
    console.log(`Deleting success case at: ${apiUrl}/success-cases/${id}`);
    
    const response = await fetch(`${apiUrl}/success-cases/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API response error:", response.status, errorData);
      throw new Error(errorData.message || "Error al eliminar el caso de éxito");
    }

    return true;
  } catch (error) {
    console.error("Error al eliminar el caso de éxito:", error);
    throw error;
  }
};

// Publicar o despublicar un caso de éxito (requiere token de admin)
export const toggleSuccessCasePublish = async (token: string, id: string, isPublished: boolean) => {
  try {
    console.log(`Toggling publish status at: ${apiUrl}/success-cases/${id}/publish`);
    console.log("Data being sent:", JSON.stringify({ isPublished }));
    
    const response = await fetch(`${apiUrl}/success-cases/${id}/publish`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isPublished }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API response error:", response.status, errorData);
      throw new Error(errorData.message || "Error al cambiar el estado de publicación");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al cambiar el estado de publicación:", error);
    throw error;
  }
}; 