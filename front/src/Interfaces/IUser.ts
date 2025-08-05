export interface ILoginUser {
  email: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
}

export interface IProfileData {
  id?: string;
  name: string;
  lastname: string;
  age: string;
  nameAgency: string;
  email: string;
  password?: string;
  puesto: string;
  subscriptionType?: string;
  subscription?: string;
  role: UserType;
  imgUrl: string;
  cv?: string;
  phone: string;
  nationality: string;
  ubicacionActual?: string;
  location: string;
  genre?: string;
  birthday: string;
  height: number;
  weight: number;
  // Legacy properties (kept for backward compatibility)
  club?: string;
  fechaInicio?: string;
  fechaFinalizacion?: string;
  categoriaEquipo?: string;
  nivelCompetencia?: string;
  logros?: string;
  // Use trayectorias instead of career to match backend entity
  trayectorias?: {
    club: string;
    fechaInicio: string;
    fechaFinalizacion: string;
    categoriaEquipo: string;
    nivelCompetencia: string;
    logros: string;
  }[];
  pasaporteUe?: PasaporteUe;
  skillfulFoot: string;
  bodyStructure: string;
  habilities: string[];
  videoUrl: string;
  socialMedia?: Record<string, string>;
  primaryPosition?: string;
  secondaryPosition?: string;
  isVerified?: boolean;
  puestoDeportivo?: {
    position: string;
    experience: number;
  }[];
}

export enum PasaporteUe {
  SI = "Si",
  NO = "No",
}

export interface IRegisterUser {
  name: string;
  lastname: string;
  ubicacionActual: string;
  nameAgency?: string;
  puesto?: string;
  email: string;
  password: string;
  role?: UserType;
  imgUrl?: string;
  phone?: string;
  nationality?: string;
  location?: string;
  genre?: string;
  birthday?: Date;
  height?: number;
  weight?: number;
  skillfulFoot?: string;
  bodyStructure?: string;
  habilities?: string[];
  confirmPassword?: string;
  termsAccepted?: boolean;
}

export enum UserType {
  AGENCY = "AGENCY",
  RECRUITER = "RECRUITER",
  PLAYER = "PLAYER",
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface IUserResponse {
  id: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: UserType;
  imgUrl: string;
  applications?: IApplication[];
  jobs?: IJob[];
}

export interface IApplication {
  id: string;
  player: string;
  job: IJob;
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  appliedAt: string;
}

export interface IJob {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  createdAt: string;
  status: "OPEN" | "CLOSED";
  offerType: string;
  position: string;
  competencies: string[];
  countries: string[];
  imgUrl: string;
  type: string;
  recruiter: string;
  applications: string[];
}

export interface IUserWithToken extends IUserResponse {
  token: string;
}

export interface IUserContextType {
  user: IUserWithToken | null; // Cambia de IUserResponse a IUserWithToken
  setUser: React.Dispatch<React.SetStateAction<IUserWithToken | null>>; // Cambia de IUserResponse a IUserWithToken
  isLogged: boolean;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
  isAdmin: boolean;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  role: string | null;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
  signIn: (credentials: ILoginUser) => Promise<boolean>;
  signUp: (user: IRegisterUser) => Promise<boolean>;
  logOut: () => void;
  refreshUserData: () => Promise<boolean>;
}

export interface User {
  id: string;
  name?: string;
  lastname?: string;
  imgUrl?: string;
  age?: number;
  nationality?: string;
  primaryPosition?: string;
  secondaryPosition?: string;
  height?: number;
  weight?: number;
  skillfulFoot?: string;
  subscriptionType?: string;
  subscription?: string | boolean;
  role?: string;
  email?: string;
  phone?: string;
  ubicacionActual?: string;
  trayectorias?: { club: string }[];
}
