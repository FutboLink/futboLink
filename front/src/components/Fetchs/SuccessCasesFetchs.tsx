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

    // Use relative URL in production
    const url = process.env.NODE_ENV === 'production' 
      ? '/success-cases'
      : `${apiUrl}/success-cases`;
    
    console.log(`Fetching success cases from: ${url}`);
    const response = await fetch(url, {
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
    // Use relative URL in production
    const url = process.env.NODE_ENV === 'production' 
      ? '/success-cases/published'
      : `${apiUrl}/success-cases/published`;
    
    console.log(`Fetching published success cases from: ${url}`);
    const response = await fetch(url);
    
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

// Función para verificar si una URL es válida y accesible
const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    // Rechazar URLs inválidas
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      console.warn("URL de tipo blob o data URI rechazada:", url);
      return false;
    }
    
    // Verificar que la URL comience con http o https
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      console.warn("URL sin protocolo http/https rechazada:", url);
      return false;
    }
    
    // Verificar si es una URL de Cloudinary
    if (url.includes('cloudinary.com')) {
      console.log("URL de Cloudinary detectada:", url);
      return true;
    }
    
    // Para URLs que no son de Cloudinary, comprobamos que sean de dominios permitidos
    const allowedDomains = ['dummyimage.com', 'img.freepik.com'];
    const isAllowedDomain = allowedDomains.some(domain => url.includes(domain));
    
    if (!isAllowedDomain) {
      console.warn("URL de dominio no permitido rechazada:", url);
      return false;
    }
    
    // La URL parece válida
    return true;
  } catch (error) {
    console.error("Error al validar URL:", error);
    return false;
  }
};

// Obtener un caso de éxito por ID
export const fetchSuccessCaseById = async (id: string) => {
  try {
    // Use relative URL in production
    const url = process.env.NODE_ENV === 'production' 
      ? `/success-cases/${id}`
      : `${apiUrl}/success-cases/${id}`;
    
    console.log(`Fetching success case by ID from: ${url}`);
    
    // Añadimos cache: 'no-store' para evitar problemas de caché que puedan afectar la carga de imágenes
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // Add x-forward-to-backend header for the catch-all rewrite
        'x-forward-to-backend': '1'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API response error:", response.status, errorData);
      throw new Error(errorData.message || "Error al obtener el caso de éxito");
    }
    
    const data = await response.json();
    
    // Validar y sanitizar los datos recibidos
    if (!data || typeof data !== 'object') {
      throw new Error("Formato de datos inválido recibido del servidor");
    }
    
    // Asegurarse de que todos los campos esperados existan
    const sanitizedData = {
      ...data,
      name: data.name || "Caso de éxito",
      role: data.role || "Profesional del fútbol",
      testimonial: data.testimonial || "Sin testimonio disponible",
      imgUrl: data.imgUrl || ""
    };
    
    // Validar que la imgUrl existe y es válida
    if (sanitizedData.imgUrl) {
      // Verificar si la URL es válida según nuestra función
      if (!isValidUrl(sanitizedData.imgUrl)) {
        console.warn(`URL inválida detectada: ${sanitizedData.imgUrl}. Usando URL alternativa.`);
        // Si la URL no es válida, establecer una cadena vacía para que el componente use la imagen por defecto
        sanitizedData.imgUrl = "";
      } 
      // No hacemos pre-fetch de la imagen para evitar problemas CORS
    }
    
    return sanitizedData;
  } catch (error) {
    console.error("Error al obtener el caso de éxito:", error);
    throw error;
  }
};

// Crear un nuevo caso de éxito (requiere token de admin)
export const createSuccessCase = async (token: string, successCase: ISuccessCase) => {
  try {
    // Use relative URL in production
    const url = process.env.NODE_ENV === 'production' 
      ? '/success-cases'
      : `${apiUrl}/success-cases`;
    
    console.log(`Creating success case at: ${url}`);
    console.log("Data being sent:", JSON.stringify(successCase));
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // Add x-forward-to-backend header for the catch-all rewrite
        'x-forward-to-backend': '1'
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
    // Use relative URL in production
    const url = process.env.NODE_ENV === 'production' 
      ? `/success-cases/${id}`
      : `${apiUrl}/success-cases/${id}`;
    
    console.log(`Updating success case at: ${url}`);
    console.log("Data being sent:", JSON.stringify(successCase));
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // Add x-forward-to-backend header for the catch-all rewrite
        'x-forward-to-backend': '1'
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
    // Use relative URL in production
    const url = process.env.NODE_ENV === 'production' 
      ? `/success-cases/${id}`
      : `${apiUrl}/success-cases/${id}`;
    
    console.log(`Deleting success case at: ${url}`);
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        // Add x-forward-to-backend header for the catch-all rewrite
        'x-forward-to-backend': '1'
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
    // Use relative URL in production
    const url = process.env.NODE_ENV === 'production' 
      ? `/success-cases/${id}/publish`
      : `${apiUrl}/success-cases/${id}/publish`;
    
    console.log(`Toggling publish status at: ${url}`);
    console.log("Data being sent:", JSON.stringify({ isPublished }));
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // Add x-forward-to-backend header for the catch-all rewrite
        'x-forward-to-backend': '1'
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