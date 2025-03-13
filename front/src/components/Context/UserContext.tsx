"use client";
import {
  ILoginResponse,
  IRegisterUser,
  ILoginUser,
  IUserResponse,
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
      const data = await fetchRegisterUser(user);
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
        const { token, role, id } = JSON.parse(storedAuthData);
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
          setUser({
            token,
            role,
            id,
            name: "",
            lastname: "",
            email: "",
            password: "",
            imgUrl: "",
          }); // Se actualiza correctamente con valores predeterminados
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
        const { role, id } = JSON.parse(storedAuthData);
        setUser({
          token,
          role,
          id,
          name: "",
          lastname: "",
          email: "",
          password: "",
          imgUrl: "",
        }); // Se actualiza correctamente
      }
    }
  }, [token]);

  const logOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
