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
  nationality: string;
  location: string;
  position: string;
  category: string;
  sportGenres:string;
  sport: string;
  contractTypes: string; 
  contractDurations: string;
  salary: number;
  transport: string[];
  minAge: number;
  maxAge:number;
  availabilityToTravel: YesOrNotravell;
  euPassport: YesOrNo;
  gmail?: string;
  imgUrl: string;
  extra: string[];
  minExperience: string;
  createdAt: string;
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
  id: string;
  message: string;
  status: JobStatus;
  appliedAt: string;
  recruiter: {
    id:string;
  }
  player: {
    id:string;
  }
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
  category: string;
  sportGenres:string;
  sport: string;
  contractTypes: string; 
  contractDurations: string;
  salary: number;
  transport: string[];
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
