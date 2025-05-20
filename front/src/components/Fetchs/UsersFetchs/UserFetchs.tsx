import { ILoginUser, IProfileData, IRegisterUser } from "@/Interfaces/IUser";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const fetchLoginUser = async (credentials: ILoginUser) => {
  try {
    console.log("Llamando a la API en:", apiUrl);
    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Error en la autenticación");
    }

    const data = await response.json();
    console.log("Response data from login:", data);
    return data;
  } catch (error) {
    console.error("Error en el login:", error);
    throw error;
  }
};

// Formulario de Registro
export const fetchRegisterUser = async (user: IRegisterUser) => {
  console.log("Datos del usuario a enviar:", user);
  console.log("Llamando a la ruta:", `${apiUrl}/user/register`);
  const response = await fetch(`${apiUrl}/user/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error desconocido");
  }

  const data = await response.json();
  return data;
};

export const fetchUserData = async (token: string) => {
  try {
    const userId = JSON.parse(atob(token.split(".")[1])).id;
    const response = await fetch(`${apiUrl}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al cargar los datos del usuario.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    throw error;
  }
};

export const fetchUserId = async (userId: string) => {
  try {
    const response = await fetch(`${apiUrl}/user/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const updateUserData = async (
  userId: string | number,
  formData: IProfileData
) => {
  try {
    // Create a copy of the data to avoid modifying the original
    const dataToSend = { ...formData };
    
    // Verificar si hay trayectorias para formatear correctamente
    if (dataToSend.trayectorias && Array.isArray(dataToSend.trayectorias)) {
      // Formatear cada trayectoria correctamente
      const formattedTrayectorias = dataToSend.trayectorias
        .filter(exp => exp.club && exp.club.trim() !== '')
        .map(exp => ({
          club: String(exp.club || ''),
          fechaInicio: String(exp.fechaInicio || ''),
          fechaFinalizacion: String(exp.fechaFinalizacion || ''),
          categoriaEquipo: String(exp.categoriaEquipo || ''),
          nivelCompetencia: String(exp.nivelCompetencia || ''),
          logros: String(exp.logros || '')
        }));
      
      // Asignamos las trayectorias formateadas de vuelta al objeto
      dataToSend.trayectorias = formattedTrayectorias;
      
      console.log("Trayectorias formateadas:", JSON.stringify(dataToSend.trayectorias));
    }
    
    // Remove any undefined values that might cause issues
    Object.keys(dataToSend).forEach(key => {
      if ((dataToSend as any)[key] === undefined) {
        delete (dataToSend as any)[key];
      }
    });
    
    console.log("Enviando datos completos:", JSON.stringify(dataToSend));
    
    // Vamos a acceder directamente a la ruta del backend para la actualización
    const fullApiUrl = `${apiUrl}/user/${userId}`;
    console.log("Enviando petición a:", fullApiUrl);
    
    const headers = {
      "Content-Type": "application/json"
    };
    
    // Enviar la solicitud con los datos completos
    const response = await fetch(fullApiUrl, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(dataToSend)
    });
    
    if (!response.ok) {
      // Si obtenemos un error, intentar leer el mensaje de error
      try {
        const errorData = await response.json();
        console.error("Error de respuesta:", errorData);
        throw new Error(errorData.message || "Error al actualizar los datos.");
      } catch (parseError) {
        // Si no pudimos parsear el error, lanzar uno genérico
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error actualizando los datos:", error);
    throw error;
  }
};

export const fetchDeleteJob = async (token: string, jobId: string) => {
  try {
    const response = await fetch(`${apiUrl}/jobs/${jobId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error en fetchDeleteJob:", error);
    throw error;
  }
};

// Actualiza la función para aceptar formData
export const fetchEditJob = async (
 
  id: string,
  formData: object
) => {
  try {
    const response = await fetch(`${apiUrl}/jobs/${id}`, {
      method: "PUT",
      headers: {
       
        "Content-Type": "application/json", // Agregar el tipo de contenido
      },
      body: JSON.stringify(formData), // Enviar formData como cuerpo de la solicitud
    });

    if (!response.ok) {
      throw new Error("Error al editar la oferta.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al editar la oferta:", error);
    throw error;
  }
};


export const resetPassword = async (token: string, password: string) => {
  try {
    console.log(`Intentando restablecer contraseña con token: ${token.substring(0, 10)}...`);
    console.log(`URL de API: ${apiUrl}/login/reset-password`);
    
    const response = await fetch(`${apiUrl}/login/reset-password`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ 
        token,
        newPassword: password 
      }),
      credentials: 'include',
      mode: 'cors'
    });

    const data = await response.json();
    console.log("Respuesta del servidor:", response.status, data);
    
    if (!response.ok) {
      console.error("Error en resetPassword:", data);
      return { 
        success: false, 
        message: data.message || "Error al restablecer la contraseña. Por favor, intenta nuevamente."
      };
    }
    
    return { 
      success: true, 
      message: data.message || "Contraseña restablecida exitosamente." 
    };
  } catch (error) {
    console.error("Error en la solicitud resetPassword:", error);
    
    // Mensaje específico para errores de CORS o de red
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return { 
        success: false, 
        message: "No se pudo conectar con el servidor. Esto podría deberse a un problema de CORS o a que el servidor no está disponible."
      };
    }
    
    return { 
      success: false, 
      message: "Error al conectar con el servidor. Verifica tu conexión e intenta nuevamente."
    };
  }
};


export const forgotPassword = async (email: string) => {
  try {
    const res = await fetch(`${apiUrl}/login/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: 'include',
      mode: 'cors'
    });

    const data = await res.json();
    return { success: res.ok, message: data.message };
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return { 
        success: false, 
        message: "No se pudo conectar con el servidor. Esto podría deberse a un problema de CORS o a que el servidor no está disponible." 
      };
    }
    return { success: false, message: "Error al conectar con el servidor." };
  }
}

export const contact = async (email: string, name: string, mensaje: string) => {
  try {
    const res = await fetch(`${apiUrl}/email/contact`, {  
      method: "POST",
      body: JSON.stringify({ email, name, mensaje }),  
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, message: errorData.message || "Hubo un problema al enviar el mensaje." };
    }

    const data = await res.json();
    return { success: true, message: data.message || "Mensaje enviado exitosamente." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error al conectar con el servidor." };
  }
};

export const getCv = async (filename: string) => {
  try {
    const response = await fetch(`${apiUrl}/user/cv/${filename}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch CV");
    }

    const data = await response.blob(); // Leemos la respuesta como un archivo binario
    const fileURL = URL.createObjectURL(data); // Creamos una URL para el archivo
    return fileURL; // Retornamos la URL que puede ser utilizada para mostrar el CV
  } catch (error) {
    console.error("Error fetching CV:", error);
    throw error;
  }
};
