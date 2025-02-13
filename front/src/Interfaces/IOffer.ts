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
  id: number;
  title: string;
  description: string;
  country: string;
  flagCode: string;
  salary?: string;
}


export interface IOfferCard {
  title: string;
  description: string;
  location: string;
  salary?: string;
  createdAt: string;
  status: string;
  offerType: string;
  position: string;
  competencies: string[];
  countries: string[];
  imgUrl: string;
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
