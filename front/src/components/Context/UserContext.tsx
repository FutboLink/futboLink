"use client";
import {
  ILoginResponse,
  IRegisterUser,
  ILoginUser,
  IUserResponse,
  UserType,
} from "@/Interfaces/IUser";
import { IUserContextType } from "@/Interfaces/IUser";
import {
  fetchRegisterUser,
  fetchLoginUser,
} from "../Fetchs/UsersFetchs/UserFetchs";
import { createContext, useEffect, useState } from "react";

// Extiende el tipo IUserResponse para incluir el token
export interface IUserWithToken extends IUserResponse {
  token: string;
}

export const UserContext = createContext<IUserContextType>({
  user: null,
  setUser: () => {},
  isLogged: false,
  isAdmin: false,
  setIsAdmin: () => {},
  setIsLogged: () => {},
  signIn: async () => false,
  signUp: async () => false,
  logOut: () => {},
  token: null,
  setToken: () => {},
  role: null,
  setRole: () => {},
  refreshUserData: async () => false,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUserWithToken | null>(null); // Cambiar tipo a IUserWithToken
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const signIn = async (credentials: ILoginUser): Promise<boolean> => {
    try {
      const data: ILoginResponse = await fetchLoginUser(credentials);
      if (data?.token) {
        const payload = JSON.parse(atob(data.token.split(".")[1])); // Decodificamos el JWT

        const userData: IUserWithToken = {
          token: data.token,
          role: payload.role,
          id: payload.id,
          name: "", // Deberías obtenerlo del backend si no está en el token
          lastname: "", // Igualmente, debería obtenerse del backend
          email: credentials.email,
          password: credentials.password, // Asegúrate de no guardar la contraseña en producción
          imgUrl: "", // Obtén esta información del backend
          applications: [],
          jobs: [],
        };

        localStorage.setItem("user", JSON.stringify(userData));

        // Also store email directly for more reliable access
        localStorage.setItem("userEmail", credentials.email);
        console.log("Stored user email in localStorage:", credentials.email);

        setToken(data.token);
        setIsLogged(true);
        setIsAdmin(payload.role === "ADMIN");
        setRole(payload.role);
        setUser(userData); // Actualizado con token

        return true;
      }
    } catch (error) {
      console.error("Error during sign in:", error);
    }
    return false;
  };

  const signUp = async (user: IRegisterUser): Promise<boolean> => {
    try {
      // Create a clean user object without frontend-only properties
      // Explicitly pick only the fields we want to send to the backend
      const cleanUserData = {
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        password: user.password,
        role: user.role || UserType.PLAYER,
        ubicacionActual: user.ubicacionActual || "",
        nationality: user.nationality || "",
        puesto: user.puesto || "",
        genre: user.genre || "",
        phone: user.phone || "",
      };

      // Log what we're sending to fetchRegisterUser
      console.log(
        "UserContext - sending to fetchRegisterUser:",
        JSON.stringify(cleanUserData, null, 2)
      );

      const data = await fetchRegisterUser(cleanUserData);
      if (data) {
        await signIn({ email: user.email, password: user.password });
        return true;
      }
      console.error(`Registration failed: ${JSON.stringify(data)}`);
      return false;
    } catch (error) {
      console.error(
        `Error during sign up: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw new Error(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  };

  useEffect(() => {
    const storedAuthData = localStorage.getItem("user");

    if (storedAuthData) {
      try {
        const parsedData = JSON.parse(storedAuthData);
        const { token, role, id } = parsedData;

        // Get email from dedicated storage or from user object
        let email = localStorage.getItem("userEmail");
        if (!email && parsedData.email) {
          email = parsedData.email;
          // Store it in dedicated storage for future use
          if (email) {
            localStorage.setItem("userEmail", email);
            console.log("Stored email from user object:", email);
          }
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        const isTokenExpired = payload.exp * 1000 < Date.now();

        if (isTokenExpired) {
          console.warn("Token expirado, cerrando sesión.");
          logOut();
        } else {
          setToken(token);
          setIsLogged(true);
          setIsAdmin(role === "ADMIN");
          setRole(role);

          console.log("Setting user with email:", email);
          setUser({
            token,
            role,
            id,
            name: parsedData.name || "",
            lastname: parsedData.lastname || "",
            email: email || "",
            password: "",
            imgUrl: parsedData.imgUrl || "",
            applications: parsedData.applications || [],
            jobs: parsedData.jobs || [],
          });
        }
      } catch (error) {
        console.error("Error verificando token:", error);
        logOut();
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      const storedAuthData = localStorage.getItem("user");
      if (storedAuthData) {
        const parsedData = JSON.parse(storedAuthData);
        const { role, id } = parsedData;

        // Get email from dedicated storage or from user object
        let email = localStorage.getItem("userEmail");
        if (!email && parsedData.email) {
          email = parsedData.email;
        }

        console.log("Token changed, setting user with email:", email);
        setUser({
          token,
          role,
          id,
          name: parsedData.name || "",
          lastname: parsedData.lastname || "",
          email: email || "",
          password: "",
          imgUrl: parsedData.imgUrl || "",
          applications: parsedData.applications || [],
          jobs: parsedData.jobs || [],
        });
      }
    }
  }, [token]);

  const refreshUserData = async () => {
    if (typeof window !== "undefined" && token) {
      try {
        // Refrescar los datos del usuario desde el token actualizado
        const storedAuthData = localStorage.getItem("user");
        if (storedAuthData) {
          const parsedData = JSON.parse(storedAuthData);
          const { role, id } = parsedData;
          
          // Get email from dedicated storage
          const email = localStorage.getItem("userEmail") || parsedData.email || "";
          
          // Actualizar el usuario en el contexto para forzar re-renders
          setUser({
            token,
            role,
            id,
            name: parsedData.name || "",
            lastname: parsedData.lastname || "",
            email: email,
            password: "",
            imgUrl: parsedData.imgUrl || "",
            applications: parsedData.applications || [],
            jobs: parsedData.jobs || [],
          });
          
          console.log("User data refreshed in context");
          return true;
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
        return false;
      }
    }
    return false;
  };

  const logOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");
      setUser(null);
      setToken(null);
      setIsLogged(false);
      setIsAdmin(false);
      setRole(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLogged,
        setIsLogged,
        token,
        setToken,
        isAdmin,
        setIsAdmin,
        signIn,
        signUp,
        logOut,
        role,
        setRole,
        refreshUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
