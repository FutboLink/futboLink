import { ISuccessCase } from "@/Interfaces/ISuccessCase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Obtener todos los casos de éxito
export const fetchAllSuccessCases = async (token?: string) => {
  // Define los posibles endpoints a intentar
  const possibleEndpoints = [
    `${apiUrl}/testimonial`,
    `${apiUrl}/testimonials`, 
    `${apiUrl}/api/testimonial`,
    `${apiUrl}/api/testimonials`,
    `${apiUrl}/success-case`,
    `${apiUrl}/success-cases`
  ];
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  let lastError = null;
  
  // Intentar cada endpoint hasta que uno funcione
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`Intentando obtener casos de éxito desde: ${endpoint}`);
      
      const response = await fetch(endpoint, { headers });
      console.log(`Respuesta desde ${endpoint}, status:`, response.status);

      // Si la respuesta es exitosa, retornamos los datos
      if (response.ok) {
        const data = await response.json();
        console.log(`Casos de éxito obtenidos correctamente desde ${endpoint}:`, 
          Array.isArray(data) ? `${data.length} registros` : 'Formato no esperado');
        return data;
      }
      
      // Si no es exitosa, guardamos el error y continuamos con el siguiente endpoint
      lastError = new Error(`Error ${response.status} al obtener los casos de éxito desde ${endpoint}`);
      console.warn(`Endpoint ${endpoint} falló, probando siguiente...`);
      
    } catch (error) {
      console.error(`Error al intentar con endpoint ${endpoint}:`, error);
      lastError = error;
    }
  }
  
  // Si llegamos aquí, ningún endpoint funcionó
  console.error("Todos los endpoints fallaron. Último error:", lastError);
  throw lastError || new Error("No se pudieron obtener los casos de éxito de ningún endpoint");
};

// Obtener un caso de éxito por ID
export const fetchSuccessCaseById = async (id: string) => {
  // Define los posibles endpoints a intentar
  const possibleEndpoints = [
    `${apiUrl}/testimonial/${id}`,
    `${apiUrl}/testimonials/${id}`, 
    `${apiUrl}/api/testimonial/${id}`,
    `${apiUrl}/api/testimonials/${id}`,
    `${apiUrl}/success-case/${id}`,
    `${apiUrl}/success-cases/${id}`
  ];
  
  let lastError = null;
  
  // Intentar cada endpoint hasta que uno funcione
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`Intentando obtener caso de éxito desde: ${endpoint}`);
      
      const response = await fetch(endpoint);
      console.log(`Respuesta desde ${endpoint}, status:`, response.status);

      // Si la respuesta es exitosa, retornamos los datos
      if (response.ok) {
        const data = await response.json();
        console.log(`Caso de éxito obtenido correctamente desde ${endpoint}`);
        return data;
      }
      
      // Si no es exitosa, guardamos el error y continuamos con el siguiente endpoint
      lastError = new Error(`Error ${response.status} al obtener el caso de éxito desde ${endpoint}`);
      console.warn(`Endpoint ${endpoint} falló, probando siguiente...`);
      
    } catch (error) {
      console.error(`Error al intentar con endpoint ${endpoint}:`, error);
      lastError = error;
    }
  }
  
  // Si llegamos aquí, ningún endpoint funcionó
  console.error("Todos los endpoints fallaron. Último error:", lastError);
  throw lastError || new Error("No se pudo obtener el caso de éxito de ningún endpoint");
};

// Crear un nuevo caso de éxito (requiere token de admin)
export const createSuccessCase = async (token: string, successCase: ISuccessCase) => {
  // Define los posibles endpoints a intentar
  const possibleEndpoints = [
    `${apiUrl}/testimonial`,
    `${apiUrl}/testimonials`, 
    `${apiUrl}/api/testimonial`,
    `${apiUrl}/api/testimonials`,
    `${apiUrl}/success-case`,
    `${apiUrl}/success-cases`
  ];
  
  let lastError = null;
  
  // Intentar cada endpoint hasta que uno funcione
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`Intentando crear caso de éxito en: ${endpoint}`);
      console.log("Datos a enviar:", JSON.stringify(successCase));
      console.log("Token presente:", !!token);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(successCase),
      });

      console.log(`Respuesta desde ${endpoint}, status:`, response.status);

      // Si la respuesta es exitosa, retornamos los datos
      if (response.ok) {
        const data = await response.json();
        console.log("Caso de éxito creado correctamente:", data);
        return data;
      }
      
      // Si no es exitosa, guardamos el error y continuamos con el siguiente endpoint
      let errorMessage = `Error ${response.status} en ${endpoint}: `;
      
      try {
        const errorData = await response.json();
        errorMessage += errorData.message || "Error desconocido";
        console.error("Error detallado:", errorData);
      } catch (parseError) {
        errorMessage += response.statusText || "Error al crear el caso de éxito";
        console.error("No se pudo parsear el error:", parseError);
      }
      
      lastError = new Error(errorMessage);
      console.warn(`Endpoint ${endpoint} falló, probando siguiente...`);
      
    } catch (error) {
      console.error(`Error al intentar con endpoint ${endpoint}:`, error);
      lastError = error;
    }
  }
  
  // Si llegamos aquí, ningún endpoint funcionó
  console.error("Todos los endpoints fallaron. Último error:", lastError);
  throw lastError || new Error("No se pudo crear el caso de éxito en ningún endpoint");
};

// Actualizar un caso de éxito existente (requiere token de admin)
export const updateSuccessCase = async (token: string, id: string, successCase: Partial<ISuccessCase>) => {
  try {
    const response = await fetch(`${apiUrl}/testimonial/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(successCase),
    });

    if (!response.ok) {
      const errorData = await response.json();
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
    const response = await fetch(`${apiUrl}/testimonial/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el caso de éxito");
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
    const response = await fetch(`${apiUrl}/testimonial/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isPublished }),
    });

    if (!response.ok) {
      throw new Error("Error al cambiar el estado de publicación");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al cambiar el estado de publicación:", error);
    throw error;
  }
}; 