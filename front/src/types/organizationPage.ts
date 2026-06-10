export const ORGANIZATION_PAGE_TYPE = {
  CLUB: "CLUB",
  ACADEMY: "ACADEMY",
  TOURNAMENT_ORGANIZER: "TOURNAMENT_ORGANIZER",
  FORMATION_SCHOOL: "FORMATION_SCHOOL",
  AGENCY: "AGENCY",
  LEAGUE: "LEAGUE",
  FEDERATION: "FEDERATION",
  NATIONAL_TEAM: "NATIONAL_TEAM",
} as const;

export type OrganizationPageType =
  (typeof ORGANIZATION_PAGE_TYPE)[keyof typeof ORGANIZATION_PAGE_TYPE];

export const ORGANIZATION_PAGE_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  DEACTIVATED: "DEACTIVATED",
} as const;

export type OrganizationPageStatus =
  (typeof ORGANIZATION_PAGE_STATUS)[keyof typeof ORGANIZATION_PAGE_STATUS];

export interface OrganizationPageSocialMedia {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  facebook?: string;
  tiktok?: string;
}

/**
 * Divisiones canónicas para páginas de tipo LEAGUE. Los strings deben
 * coincidir EXACTAMENTE con el validador @IsIn del backend.
 */
export const LEAGUE_DIVISIONS = [
  "Primera división",
  "Segunda división",
  "Tercera división",
  "Cuarta división",
  "Quinta división",
  "Sexta división",
  "Séptima división",
  "Octava división",
  "Novena división",
] as const;

export type LeagueDivision = (typeof LEAGUE_DIVISIONS)[number];

export interface OrganizationLeagueSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  division?: string | null;
}

/**
 * Jugador del portafolio del dueño de la página, expuesto en la página
 * pública. Solo campos seguros (NUNCA email, teléfono ni password).
 */
export interface OrganizationPortfolioPlayer {
  id: string;
  name?: string;
  lastname?: string;
  imgUrl?: string | null;
  primaryPosition?: string | null;
  age?: number | null;
}

export interface OrganizationPage {
  id: string;
  type: OrganizationPageType;
  name: string;
  slug: string;
  country?: string | null;
  region?: string | null;
  foundationYear?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  website?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  socialMedia?: OrganizationPageSocialMedia | null;
  photoUrls?: string[] | null;
  status: OrganizationPageStatus;
  rejectionReason?: string | null;
  ownerId?: string | null;
  owner?: {
    id: string;
    role: string;
    portfolioPlayers?: OrganizationPortfolioPlayer[];
  } | null;
  leagueId?: string | null;
  league?: OrganizationLeagueSummary | null;
  federationId?: string | null;
  federation?: OrganizationLeagueSummary | null;
  division?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageDraft {
  step: 1 | 2 | 3 | 4;
  type: OrganizationPageType | null;
  name: string;
  country: string;
  region: string;
  foundationYear: string;
  description: string;
  leagueId: string | null;
  federationId: string | null;
  division: string | null;
  logoUrl: string;
  bannerUrl: string;
  website: string;
  contactEmail: string;
  phone: string;
  socialMedia: OrganizationPageSocialMedia;
  photoUrls: string[];
}

export const EMPTY_PAGE_DRAFT: PageDraft = {
  step: 1,
  type: null,
  name: "",
  country: "",
  region: "",
  foundationYear: "",
  description: "",
  leagueId: null,
  federationId: null,
  division: null,
  logoUrl: "",
  bannerUrl: "",
  website: "",
  contactEmail: "",
  phone: "",
  socialMedia: {},
  photoUrls: [],
};

export const PAGE_DRAFT_STORAGE_KEY = "futbolink:page-create-draft";
