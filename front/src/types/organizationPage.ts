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

export interface OrganizationLeagueSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
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
  status: OrganizationPageStatus;
  rejectionReason?: string | null;
  ownerId?: string | null;
  owner?: { id: string; role: string } | null;
  leagueId?: string | null;
  league?: OrganizationLeagueSummary | null;
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
  logoUrl: string;
  bannerUrl: string;
  website: string;
  contactEmail: string;
  phone: string;
  socialMedia: OrganizationPageSocialMedia;
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
  logoUrl: "",
  bannerUrl: "",
  website: "",
  contactEmail: "",
  phone: "",
  socialMedia: {},
};

export const PAGE_DRAFT_STORAGE_KEY = "futbolink:page-create-draft";
