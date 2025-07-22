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
  sportGenres: string;
  availabilityToTravel: YesOrNotravell;
  euPassport: YesOrNo;
  customCurrencySign?: string;
  currencyType: string;
  salary: string;
  minAge: number;
  maxAge: number;
  createdAt: string;
  contractTypes: string;
  nationality: string;
  contractDurations: string;
  minExperience: string;
  location: string;
  category: string;
  sport: string;
  description: string;
  gmail?: string;
  imgUrl: string;
  extra: string[];
  status: string;
  type: string;
  countries?: string[];
  recruiter: {
    id: string;
    role: "RECRUITER" | "AGENCY"; // roles posibles para el reclutador
  };
}

export interface IApplication {
  message: string;
  userId: string;
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

export enum ApplicationStatus {
  PENDING = "PENDING",
  SHORTLISTED = "SHORTLISTED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface IJobApplication {
  id: string;
  appliedAt: string;
  message: string;
  status: ApplicationStatus;
  shortlistedAt?: string;
  player: {
    id: string;
    name?: string;
    lastname?: string;
    imgUrl?: string;
    nationality?: string;
    ubicacionActual?: string;
    genre?: string;
    subscription?: boolean;
    subscriptionType?: string;
  };
  nationality: string;
  location: string;
  position: string;
  category: string;
  sportGenres: string;
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
  currencyType: string;
  customCurrencySign?: string;
  location: string;
  description: string;
  category: string;
  sportGenres: string;
  sport: string;
  contractTypes: string;
  contractDurations: string;
  position?: string;
  nationality?: string;
  extra?: string[];
  salary: string;
  minAge: number;
  maxAge: number;
  availabilityToTravel: YesOrNotravell;
  euPassport: YesOrNo;
  imgUrl: string;
  minExperience: string;
  offerType: string;
  moneda: string;
  competencies: string[];
  countries: string[];
}

export enum YesOrNo {
  SI = "Si",
  NO = "No",
}

export enum YesOrNotravell {
  SI = "Si",
  NO = "No",
}
