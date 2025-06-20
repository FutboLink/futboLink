import { ICreateCurso, ICurso } from "@/Interfaces/ICursos";
import { ICreateNotice, INotice } from "@/Interfaces/INews";
import { IApplication } from "@/Interfaces/IOffer";
import { IProfileData } from "@/Interfaces/IUser";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ;

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
    try {
    const response = await fetch(`${apiUrl}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(application),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error applying:", errorData);
      
      // Si es un error 403, probablemente está relacionado con la suscripción
      if (response.status === 403) {
        throw new Error(errorData.message || "Se requiere una suscripción activa Semiprofesional o Profesional para aplicar a trabajos. Por favor, suscríbete para continuar.");
      }
      
      // Si ya existe una aplicación (409 Conflict)
      if (response.status === 409) {
        throw new Error("Ya has enviado una solicitud para este trabajo.");
      }
      
      throw new Error(errorData.message || "Error desconocido al enviar la solicitud");
    }
  
    const data = await response.json();
    return data;
    } catch (error) {
      console.error("Error in fetchApplications:", error);
      throw error;
    }
  };

 //Eliminar usuarios
 export const deleteUser = async (userId: string) => {
  try {
    const response = await fetch(`${apiUrl}/user/${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar usuario");
    }

    // Si el servidor responde con un cuerpo vacío (content-length: 0)
    if (response.status === 200 && response.statusText === 'OK') {
      return { message: "Usuario eliminado con éxito" };  // Mensaje sin cuerpo
    }

    // Si la respuesta tiene contenido, procesar el JSON
    return await response.json();
  } catch (error) {
    console.error("Error en deleteUser:", error);
    throw error;
  }
};

  

// Función para obtener las noticias
export const getNews = async (page?: number): Promise<INotice[]> => {
  try {
    const url = page ? `${apiUrl}/News?page=${page}` : `${apiUrl}/News`;
    const response = await fetch(url); 
    if (!response.ok) {
      throw new Error('Error al obtener las noticias');
    }
    const notice: INotice[] = await response.json();
    return notice;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getNewsById = async (noticeId: string) => {
  // Debug information
  console.log("==== getNewsById Debug Info ====");
  console.log("API URL from env:", process.env.NEXT_PUBLIC_API_URL);
  console.log("Using apiUrl:", apiUrl);
  console.log("Notice ID:", noticeId);
  
  try {
    // Definimos la URL base, con fallback a localhost si no está configurada
    const baseUrl = apiUrl || 'http://localhost:3001';
    
    // Creamos la URL completa para la petición
    const requestUrl = `${baseUrl}/News/${noticeId}`;
    console.log(`Making request to: ${requestUrl}`);
    
    // Añadimos un timestamp para evitar caché
    const urlWithNoCache = `${requestUrl}?_t=${Date.now()}`;
    console.log(`Final URL with cache busting: ${urlWithNoCache}`);
    
    // Realiza la petición GET al endpoint con el noticeId
    const response = await fetch(urlWithNoCache, {
      method: "GET", // Método de la solicitud
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      },
    });

    // Registramos la respuesta para depuración
    console.log(`API response status: ${response.status} (${response.statusText})`);
    console.log("Response headers:", Object.fromEntries([...response.headers.entries()]));

    // Verifica si la respuesta es exitosa (status 200)
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response body: ${errorText}`);
      throw new Error(`Error al obtener la noticia: ${response.status} ${response.statusText}`);
    }

    // Si la respuesta es exitosa, parseamos el JSON de la respuesta
    const data = await response.json();
    console.log("Response data:", data);
    return data; // Retorna la noticia obtenida

  } catch (error) {
    console.error("Error al obtener la noticia:", error);
    throw error; // Lanza el error para que se pueda manejar en el componente que lo llame
  }
};


export const getCursosById = async (cursoId: string) => {
  try {
  
    const response = await fetch(`${apiUrl}/cursos/${cursoId}`, {
      method: "GET", // Método de la solicitud
      headers: {
        "Content-Type": "application/json",
     
      },
    });

    // Verifica si la respuesta es exitosa (status 200)
    if (!response.ok) {
      throw new Error("Error al obtener el curso");
    }

    // Si la respuesta es exitosa, parseamos el JSON de la respuesta
    const data = await response.json();
    return data; // Retorna la noticia obtenida

  } catch (error) {
    console.error("Error al obtener el curso:", error);
    throw error; // Lanza el error para que se pueda manejar en el componente que lo llame
  }
};


//Formulario crear noticias
export const fetchCreateNews = async (notice:ICreateNotice, token:string) => {

  const response = await fetch(`${apiUrl}/News`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(notice),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error desconocido");
  }

  const data = await response.json();
  return data;
};

// Función para obtener los cursos
export const getCursos =  async (): Promise<ICurso[]> => {
  try {
    const response = await fetch(`${apiUrl}/cursos`); 
    if (!response.ok) {
      throw new Error('Error al obtener las noticias');
    }
    const curso: ICurso[] = await response.json();
    return curso;
  } catch (error) {
    console.error(error);
    return [];
  }
};

//Formulario crear cursos
export const fetchCreateCourse = async (curso:ICreateCurso) => {

  const response = await fetch(`${apiUrl}/cursos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(curso),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error desconocido");
  }

  const data = await response.json();
  return data;
};


 //Eliminar curso
 export const fetchDeleteCurso = async (cursoId: string,token:string) => {
  try {
    const response = await fetch(`${apiUrl}/cursos/${cursoId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al eliminar noticia");
    }

    // Si el servidor responde con un cuerpo vacío (content-length: 0)
    if (response.status === 200 && response.statusText === 'OK') {
      return { ok: true, status: response.status, message: "Noticia eliminada con éxito" };  // Devuelve el estado y mensaje
    }

    // Si la respuesta tiene contenido, procesar el JSON
    return { ok: false, status: response.status, message: await response.json() };
  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    throw error;
  }
};

export const fetchEditCourse = async (token: string, courseId: string, updatedCourse: ICurso) => {
  const response = await fetch(`${apiUrl}/cursos/${courseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(updatedCourse),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el curso");
  }

  return await response.json();
};


// Eliminar noticia
export const fetchDeleteNotice = async (noticeId: string, token: string) => {
  try {
    const response = await fetch(`${apiUrl}/News/${noticeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al eliminar noticia");
    }

    // Si el servidor responde con un cuerpo vacío (content-length: 0)
    if (response.status === 200 && response.statusText === 'OK') {
      return { ok: true, status: response.status, message: "Noticia eliminada con éxito" };  // Devuelve el estado y mensaje
    }

    // Si la respuesta tiene contenido, procesar el JSON
    return { ok: false, status: response.status, message: await response.json() };
  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    throw error;
  }
};


// Definimos un tipo para la actualización que no incluye el id
type UpdateNoticeData = {
  title: string;
  imageUrl: string;
  description: string;
};

export const fetchEditNotice = async (token: string, noticeId: string, updateData: UpdateNoticeData) => {
  console.log("Enviando datos al backend:", JSON.stringify(updateData, null, 2));
  
  try {
    const response = await fetch(`${apiUrl}/News/${noticeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    // Capturamos información de la respuesta para depuración
    console.log("Respuesta del servidor:", {
      status: response.status,
      statusText: response.statusText
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error del servidor:", errorText);
      throw new Error("Error al actualizar la noticia");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en fetchEditNotice:", error);
    throw error;
  }
};
