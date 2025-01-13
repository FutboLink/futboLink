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
