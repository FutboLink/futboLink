export interface IOffer {
  id: number;
  title: string;
  description: string;
  projectDescription: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  country: string;
  location?: string; // Cambiado a opcional
  category: string;
  contract: string;
  position?: string;
  flagCode?: string;
  salary: string;
}




export interface IOfferCard {
  id?: string;
  title: string;
  position: string;
  sportGenres:string;
  availabilityToTravel: YesOrNotravell;
  euPassport: YesOrNo;
  salary: number;
  minAge: number;
  maxAge:number;
  createdAt: string;
  contractType: string; 
  nationality: string;
  contractDuration: string;
  minExperience: string;
  
  location: string;
  category: string;
  sport: string;
  description:string;
  gmail?: string;
  imgUrl: string;
  extra: string[];
  status: string;
  type: string;
  recruiter: {
    id: string;
    role: "RECRUITER" | "AGENCY"; // roles posibles para el reclutador
  };

}


export interface IApplication {
  message: string;
  userId:string;
  jobId: string;
}

export interface ICreateJobOffer {
  title: string;
  description: string;
  location: string;
  salary: number;
  offerType: string;
  position: string;
  competencies: string[];
  countries: string[];
  imgUrl: string;
  type: string;
}


export interface IJobApplication {
  id?: string;
 
  nationality: string;
  location: string;
  position: string;
  category: string;
  sportGenres:string;
  sport: string;
  transport: string[];
  age: number;
  availabilityToTravel: YesOrNotravell;
  euPassport: YesOrNo;
  gmail?: string;
  minExperience: string;

}

export enum JobStatus {
  OPEN = "OPEN",
  PENDING = "PENDING",
  CLOSED = "CLOSED",
}

export interface ICreateJob {
  title: string; 
  nationality: string;
  location: string;
  position: string;
  description:string;
  category: string;
  sportGenres:string;
  sport: string;
  contractTypes: string; 
  contractDurations: string;
  salary: number;
  minAge: number;
  maxAge:number;
  availabilityToTravel: YesOrNotravell;
  euPassport: YesOrNo;
  gmail?: string;
  imgUrl: string;
  extra: string[];
  minExperience: string;
}



export enum YesOrNo {
  SI = 'Si',
  NO = 'No'
}

export enum YesOrNotravell {
  SI = 'Si',
  NO = 'No'
}
