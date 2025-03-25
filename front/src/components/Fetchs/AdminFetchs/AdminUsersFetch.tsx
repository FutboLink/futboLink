import { ICurso } from "@/Interfaces/ICursos";
import { INotice } from "@/Interfaces/INews";
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

  
//Formulario crear noticias
export const fetchCreateNews = async (notice:INotice) => {

  const response = await fetch(`${apiUrl}/news`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

//Formulario crear cursos
export const fetchCreateCourse = async (curso:ICurso) => {

  const response = await fetch(`${apiUrl}/curso`, {
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
 export const fetchDeleteCurso = async (cursoId: string) => {
  try {
    const response = await fetch(`${apiUrl}/curso/${cursoId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar curso");
    }

    // Si el servidor responde con un cuerpo vacío (content-length: 0)
    if (response.status === 200 && response.statusText === 'OK') {
      return { message: "Curso eliminado con éxito" };  // Mensaje sin cuerpo
    }

    // Si la respuesta tiene contenido, procesar el JSON
    return await response.json();
  } catch (error) {
    console.error("Error en deleteUser:", error);
    throw error;
  }
};

export const fetchEditCourse = async (token: string, courseId: string, updatedCourse: ICurso) => {
  const response = await fetch(`/api/courses/${courseId}`, {
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


//Eliminar noticia
export const fetchDeleteNotice = async (cursoId: string) => {
  try {
    const response = await fetch(`${apiUrl}/curso/${cursoId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar curso");
    }

    // Si el servidor responde con un cuerpo vacío (content-length: 0)
    if (response.status === 200 && response.statusText === 'OK') {
      return { message: "Curso eliminado con éxito" };  // Mensaje sin cuerpo
    }

    // Si la respuesta tiene contenido, procesar el JSON
    return await response.json();
  } catch (error) {
    console.error("Error en deleteUser:", error);
    throw error;
  }
};

export const fetchEditNotice = async (token: string, courseId: string, updatedCourse: ICurso) => {
  const response = await fetch(`/api/courses/${courseId}`, {
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
