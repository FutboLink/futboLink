export interface ILoginUser {
    email:string;
    password:string;
}

export interface ILoginResponse {
    token: string;
  }

  export interface IProfileData {
    id?:string;
      name: string;
      lastname: string;
      nameAgency: string;
      email: string;
      password?: string;
      role: UserType.PLAYER;
      imgUrl: string;
      phone: string;
      nationality: string;
      location: string;
      genre?: string;
      birthday: string; 
      height: number;
      weight: number;
      skillfulFoot: string;
      bodyStructure: string;
      habilities: string[]; 
      videoUrl: string;
      socialMedia?: {
        instagram?: string;
        twitter?: string;
      };
      puesto: {
        position: string;
        experience: number;
      }[];
    }
    

  
export interface IRegisterUser {
    name: string;
    lastname: string;
    nameAgency?: string;
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
    AGENCY = 'AGENCY',
    RECRUITER = 'RECRUITER',
    PLAYER = 'PLAYER',
    ADMIN = 'ADMIN',
    USER = 'USER',
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
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    appliedAt: string; 
  }
  
  export interface IJob {
    id: string;
    title: string; 
    description: string; 
    location: string; 
    salary: number; 
    createdAt: string;
    status: 'OPEN' | 'CLOSED'; 
    offerType: string;
    position: string;
    competencies: string[]; 
    countries: string[]; 
    imgUrl: string;
    type: string; 
    recruiter: string; 
    applications: string[]; 
  }
  

  export interface IUserContextType {
    user: IUserResponse | null;
    setUser: React.Dispatch<React.SetStateAction<IUserResponse | null>>;
    isLogged: boolean;
    isAdmin: boolean;
    setIsAdmin: (isAdmin: boolean) => void;
    setIsLogged: (isLogged: boolean) => void;
    signIn: (credentials: ILoginUser) => Promise<boolean>;
    signUp: (user: IRegisterUser) => Promise<boolean>;
    logOut: () => void;
    token: string | null;
    role:string | null;
    setToken: React.Dispatch<React.SetStateAction<string | null>>;
    setRole: React.Dispatch<React.SetStateAction<string | null>>;
  }