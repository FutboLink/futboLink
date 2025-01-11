export interface IOfferPanel {
  title: string;
  description: string;
  date: string;
}

export interface IPlayerPanel {
  profilePicture: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  nationality: string;
  location: string;
  email: string;
  cv: string;
  additionalDocument: string;
  presentationVideo: string;
  gender: string;
  birthDate: string;
  socialLinks: Record<string, string>;
  whatsapp: string;
  physicalStats: {
    weight: string;
    height: string;
    dominantFoot: string;
    bodyType: string;
  };
  gallery: {
    photos: string[];
    videos: string[];
  };
  skills: { skill: string; level: string; frequency: string }[];
  countriesAvailable: string[];
  languages: string[];
  career: {
    club: string;
    position: string;
    startDate: string;
    endDate: string;
    category: string;
    competitionLevel: string;
    achievements: string;
    summary: string;
  }[];
  education: {
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  appliedOffers: IOfferPanel[]; // Usamos IOfferPanel aquí
}
