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
    
    // Make sure trayectorias is properly formatted for the backend
    if (dataToSend.trayectorias) {
      // Filter out empty entries
      const validTrayectorias = dataToSend.trayectorias.filter(exp => exp.club.trim() !== '');
      
      // Ensure each property is properly formatted
      const formattedTrayectorias = validTrayectorias.map(exp => ({
        club: String(exp.club || ''),
        fechaInicio: String(exp.fechaInicio || ''),
        fechaFinalizacion: String(exp.fechaFinalizacion || ''),
        categoriaEquipo: String(exp.categoriaEquipo || ''),
        nivelCompetencia: String(exp.nivelCompetencia || ''),
        logros: String(exp.logros || '')
      }));
      
      // PostgreSQL expects a specific format for jsonb arrays
      // Since the column is defined as jsonb, we send it as a stringified JSON
      dataToSend.trayectorias = formattedTrayectorias;
      
      // Log the formatted data for debugging
      console.log("Formatted trayectorias:", JSON.stringify(dataToSend.trayectorias));
    }
    
    // Deep clone and stringify nested objects for proper JSON serialization
    const stringifiedData = JSON.stringify(dataToSend);
    const finalData = JSON.parse(stringifiedData);
    
    console.log("Final data being sent:", stringifiedData);
    
    const response = await fetch(`${apiUrl}/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: stringifiedData, // Use the properly stringified data
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar los datos.");
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
  console.log("Token desde fetch", { token, password });
  try {
    const res = await fetch(`${apiUrl}/login/reset-password`, {
      method: "POST",
      body: JSON.stringify({ token, newPassword: password }),  // Enviar tanto el token como la nueva contraseña en el cuerpo
      headers: { 
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return { success: res.ok, message: data.message };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error al conectar con el servidor." };
  }
};


export const forgotPassword = async (email: string) => {
  try {
    const res = await fetch(`${apiUrl}/login/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    return { success: res.ok, message: data.message };
  } catch (error) {
    console.error(error);
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
