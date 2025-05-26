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
  console.log(`Iniciando restablecimiento de contraseña. Token: ${token.substring(0, 10)}...`);
  console.log(`Contraseña a establecer (longitud): ${password.length} caracteres`);
  
  try {
    // Crear URL absoluta
    const apiEndpoint = `${apiUrl}/login/reset-password`;
    console.log("Enviando solicitud a:", apiEndpoint);
    
    // Crear el cuerpo de la solicitud
    const requestBody = {
      token: token,
      newPassword: password
    };
    
    console.log("Enviando datos:", JSON.stringify({
      token: token.substring(0, 10) + "...",
      newPassword: "***" // No mostrar la contraseña real
    }));
    
    // Hacer la solicitud con configuración simple para evitar problemas CORS
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log("Estado de la respuesta:", response.status, response.statusText);
    
    // Intentar leer la respuesta
    let responseData;
    try {
      responseData = await response.json();
      console.log("Datos de respuesta:", responseData);
    } catch (e) {
      console.error("Error al parsear respuesta:", e);
      responseData = { message: "No se pudo leer la respuesta del servidor" };
    }
    
    // Manejar respuesta no exitosa
    if (!response.ok) {
      console.error("Respuesta no exitosa:", response.status, responseData);
      return { 
        success: false, 
        message: responseData.message || `Error ${response.status}: No se pudo restablecer la contraseña`
      };
    }
    
    // Respuesta exitosa
    console.log("Restablecimiento exitoso:", responseData);
    return { 
      success: true, 
      message: responseData.message || "Contraseña restablecida exitosamente"
    };
  } catch (error) {
    // Capturar y manejar errores
    console.error("Error en resetPassword:", error);
    
    // Verificar si es un error de CORS
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('CORS') || 
        errorMessage.includes('blocked') || 
        errorMessage.includes('Access-Control-Allow-Origin')) {
      return {
        success: false,
        message: "Error de CORS: No se puede acceder al servidor desde esta dirección. Por favor, utiliza la versión desplegada de la aplicación.",
        error: "CORS"
      };
    }
    
    return { 
      success: false, 
      message: "Error al conectar con el servidor. Inténtalo más tarde."
    };
  }
};


// Función de recuperación de contraseña renovada
export const forgotPassword = async (email: string) => {
  console.log("Iniciando proceso de recuperación de contraseña para:", email);
  
  try {
    // Crear URL absoluta
    const apiEndpoint = `${apiUrl}/login/forgot-password`;
    console.log("Enviando solicitud a:", apiEndpoint);
    
    // Hacer solicitud simple
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email })
    });
    
    // Manejar respuesta
    if (!response.ok) {
      console.warn("Respuesta no exitosa:", response.status);
      // Si el status es 404, el usuario no existe
      if (response.status === 404) {
        return { 
          success: false, 
          message: "No existe una cuenta con este correo electrónico."
        };
      }
      
      // Intentar leer el cuerpo de la respuesta para otros errores
      try {
        const errorData = await response.json();
        return { 
          success: false, 
          message: errorData.message || "No se pudo procesar la solicitud"
        };
      } catch (jsonError) {
        return { 
          success: false, 
          message: `Error ${response.status}: No se pudo procesar la solicitud`
        };
      }
    }
    
    // Respuesta exitosa - ahora el backend devuelve el token directamente
    const data = await response.json();
    console.log("Respuesta exitosa, token recibido:", data.token ? "Sí" : "No");
    
    if (data.token) {
      // Almacenar el token en localStorage para usarlo en la página de reseteo
      localStorage.setItem('resetPasswordToken', data.token);
      localStorage.setItem('resetPasswordEmail', email);
      
      // Redirigir al usuario a la página de reseteo de contraseña
      if (typeof window !== 'undefined') {
        window.location.href = `/resetPassword?token=${data.token}`;
      }
      
      return { 
        success: true,
        directReset: true,
        message: "Verificación exitosa. Redirigiendo para restablecer contraseña.",
        token: data.token
      };
    } else {
      return { 
        success: true, 
        message: data.message || "Verificación exitosa. Revise su correo para continuar."
      };
    }
  } catch (error) {
    // Capturar errores específicos de red
    console.error("Error en solicitud de recuperación:", error);
    
    // Determinar si es un error de CORS
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isCorsError = errorMessage.includes('CORS') || 
                      errorMessage.includes('blocked') || 
                      errorMessage.includes('Access-Control-Allow-Origin');
    
    if (isCorsError) {
      return {
        success: false,
        message: "Error de CORS: No se puede acceder al servidor desde esta dirección.",
        error: "CORS"
      };
    }
    
    return { 
      success: false, 
      message: "Error al conectar con el servidor. Inténtalo más tarde."
    };
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

export const getCv = async (cvPath: string) => {
  try {
    // Si está vacío o es nulo, devolver error
    if (!cvPath) {
      throw new Error("CV path is empty or null");
    }
    
    // 1. Comprobar si ya es una URL completa de Cloudinary
    if (cvPath.match(/^https?:\/\/(res\.)?cloudinary\.com/)) {
      console.log("URL de Cloudinary detectada:", cvPath);
      
      // Para PDFs de Cloudinary, añadir parámetro fl_attachment para forzar descarga
      if (cvPath.endsWith('.pdf')) {
        // Opción 1: Añadir fl_attachment para forzar descarga
        // return `${cvPath.replace(/\.pdf$/, '')}/fl_attachment/${cvPath.split('/').pop()}`;
        
        // Opción 2: Simplemente retornar la URL directa para abrir en nueva pestaña
        return cvPath;
      }
      return cvPath;
    }
    
    // 2. Comprobar si es una URL de Cloudinary sin el protocolo
    if (cvPath.includes('cloudinary.com') || cvPath.includes('res.cloudinary.com')) {
      const fullUrl = `https://${cvPath.replace(/^\/\//, '')}`;
      console.log("URL de Cloudinary reconstruida:", fullUrl);
      return fullUrl;
    }
    
    // 3. Si parece ser un ID o path de Cloudinary
    if (cvPath.includes('upload/') || cvPath.includes('/pdf/')) {
      // Intentar construir una URL de Cloudinary
      const cloudinaryUrl = `https://res.cloudinary.com/dagcofbhm/${cvPath.startsWith('/') ? cvPath.substring(1) : cvPath}`;
      console.log("URL de Cloudinary construida:", cloudinaryUrl);
      return cloudinaryUrl;
    }
    
    // 4. Si es solo un nombre de archivo, intentar acceder a través del endpoint
    try {
      // Extraer solo el nombre del archivo si contiene una ruta
      const filename = cvPath.split('/').pop() || cvPath;
      console.log("Intentando obtener CV a través del endpoint con filename:", filename);
      
      const response = await fetch(`${apiUrl}/user/cv/${filename}`, {
        method: "GET",
      });

      if (!response.ok) {
        console.error(`Error del servidor: ${response.status} ${response.statusText}`);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.blob(); // Leemos la respuesta como un archivo binario
      const fileURL = URL.createObjectURL(data); // Creamos una URL para el archivo
      console.log("URL del blob creada:", fileURL);
      return fileURL; // Retornamos la URL que puede ser utilizada para mostrar el CV
    } catch (endpointError) {
      console.warn("Error al acceder al endpoint:", endpointError);
      
      // 5. Intentar como último recurso con la URL directa de Cloudinary
      if (cvPath.includes('v1') || cvPath.includes('upload')) {
        const cloudinaryDirectUrl = `https://res.cloudinary.com/dagcofbhm/image/upload/${cvPath}`;
        console.log("Intentando URL directa de Cloudinary:", cloudinaryDirectUrl);
        return cloudinaryDirectUrl;
      }
      
      throw endpointError;
    }
  } catch (error) {
    console.error("Error fetching CV:", error);
    throw error;
  }
};
