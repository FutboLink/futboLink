import { ILoginUser, IRegisterUser } from "@/Interfaces/IUser";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

//Formulario de login
export const fetchLoginUser = async (credentials: ILoginUser) => {
  try {
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


//Formulario de Registro
export const fetchRegisterUser = async (user: IRegisterUser) => {
  console.log("Datos del usuario a enviar:", user);

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