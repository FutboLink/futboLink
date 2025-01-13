"use client";
import { ILoginResponse,IRegisterUser,ILoginUser,IUserResponse } from "@/Interfaces/IUser";
import { IUserContextType } from "@/Interfaces/IUser";
import { fetchRegisterUser, fetchLoginUser } from "../Fetchs/UsersFetchs/UserFetchs";
import { createContext, useEffect, useState } from "react";

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
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUserResponse | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  
  const signIn = async (credentials: ILoginUser): Promise<boolean> => {
    try {
      const data: ILoginResponse = await fetchLoginUser(credentials);
      if (data?.token) {
        const payload = JSON.parse(atob(data.token.split('.')[1])); // Decodificamos el JWT
    
        const userData = {
          token: data.token,
          role: payload.role,
          id: payload.id // Asumiendo que el id del usuario está en el payload
        };
        
        localStorage.setItem("user", JSON.stringify(userData)); // Guardamos el id en el localStorage
    
        setToken(data.token);
        setIsLogged(true);
        setIsAdmin(payload.role === "admin");
    
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
      console.error(`Error during sign up: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(error instanceof Error ? error.message : 'Error desconocido'); 
  }
};

useEffect(() => {
    const storedAuthData = localStorage.getItem("user");
  
    if (storedAuthData) {
      const { token, role } = JSON.parse(storedAuthData);
      const payload = JSON.parse(atob(token.split('.')[1]));
  
      const isTokenExpired = payload.exp * 1000 < Date.now();
  
      if (isTokenExpired) {
        logOut();
      } else {
        setToken(token);
        setIsLogged(true);
        setIsAdmin(role === "admin");
      }
    }
  }, []);
  




const logOut = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user"); 
    setUser(null);
    setToken(null);
    setIsLogged(false);
    setIsAdmin(false);
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};