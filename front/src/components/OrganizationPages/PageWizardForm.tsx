"use client";

import { AnimatePresence, motion } from "framer-motion";
import NextImage from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CountryFlag from "react-country-flag";
import type { IconType } from "react-icons";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBriefcase,
  FaBuilding,
  FaChevronDown,
  FaCrown,
  FaFacebookF,
  FaFlag,
  FaFutbol,
  FaGlobe,
  FaGlobeAmericas,
  FaGraduationCap,
  FaInstagram,
  FaPhone,
  FaShieldAlt,
  FaTrophy,
  FaTwitter,
  FaUsers,
  FaYoutube,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import ImageUploadwithCrop from "@/components/Cloudinary/ImageUploadWithCrop";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import { CountryToCode } from "@/components/countryFlag/countryFlag";
import useNationalities from "@/components/Forms/FormUser/useNationalitys";
import PageTypeTag from "@/components/OrganizationPages/PageTypeTag";
import SocialMediaIcons from "@/components/OrganizationPages/SocialMediaIcons";
import TypeCard, {
  type TypeCardAccent,
} from "@/components/OrganizationPages/TypeCard";
import WizardStepIndicator from "@/components/OrganizationPages/WizardStepIndicator";
import PhoneNumberInput from "@/components/utils/PhoneNumberInput";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import {
  EMPTY_PAGE_DRAFT,
  LEAGUE_DIVISIONS,
  ORGANIZATION_PAGE_TYPE,
  type OrganizationPage,
  type OrganizationPageType,
  type PageDraft,
} from "@/types/organizationPage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type TypeOption = {
  type: OrganizationPageType;
  titleKey: string;
  descKey: string;
  originalTitle: string;
  originalDesc: string;
  Icon: IconType;
  accent: TypeCardAccent;
  adminOnly?: boolean;
};

const TYPE_OPTIONS: TypeOption[] = [
  {
    type: ORGANIZATION_PAGE_TYPE.CLUB,
    titleKey: "typeCLUB",
    descKey: "typeCLUBDesc",
    originalTitle: "Club",
    originalDesc: "Club deportivo. Compite en una liga.",
    Icon: FaShieldAlt,
    accent: "emerald",
  },
  {
    type: ORGANIZATION_PAGE_TYPE.AGENCY,
    titleKey: "typeAGENCY",
    descKey: "typeAGENCYDesc",
    originalTitle: "Agencia",
    originalDesc: "Agencia de representación.",
    Icon: FaBriefcase,
    accent: "orange",
  },
  {
    type: ORGANIZATION_PAGE_TYPE.FORMATION_SCHOOL,
    titleKey: "typeFORMATION_SCHOOL",
    descKey: "typeFORMATION_SCHOOLDesc",
    originalTitle: "Escuela de Formación",
    originalDesc: "Escuela de formación.",
    Icon: FaGraduationCap,
    accent: "emerald",
  },
  {
    type: ORGANIZATION_PAGE_TYPE.ACADEMY,
    titleKey: "typeACADEMY",
    descKey: "typeACADEMYDesc",
    originalTitle: "Academia",
    originalDesc: "Academia de formación.",
    Icon: FaBuilding,
    accent: "teal",
  },
  {
    type: ORGANIZATION_PAGE_TYPE.TOURNAMENT_ORGANIZER,
    titleKey: "typeTOURNAMENT_ORGANIZER",
    descKey: "typeTOURNAMENT_ORGANIZERDesc",
    originalTitle: "Organizador de Torneos",
    originalDesc: "Organizador de torneos.",
    Icon: FaTrophy,
    accent: "amber",
  },
  {
    type: ORGANIZATION_PAGE_TYPE.LEAGUE,
    titleKey: "typeLEAGUE",
    descKey: "typeLEAGUEDesc",
    originalTitle: "Liga",
    originalDesc: "Liga deportiva.",
    Icon: FaFutbol,
    accent: "sky",
    adminOnly: true,
  },
  {
    type: ORGANIZATION_PAGE_TYPE.FEDERATION,
    titleKey: "typeFEDERATION",
    descKey: "typeFEDERATIONDesc",
    originalTitle: "Federación",
    originalDesc: "Federación deportiva.",
    Icon: FaCrown,
    accent: "violet",
    adminOnly: true,
  },
  {
    type: ORGANIZATION_PAGE_TYPE.NATIONAL_TEAM,
    titleKey: "typeNATIONAL_TEAM",
    descKey: "typeNATIONAL_TEAMDesc",
    originalTitle: "Selección Nacional",
    originalDesc: "Selección nacional.",
    Icon: FaFlag,
    accent: "rose",
    adminOnly: true,
  },
];

// Placeholder de ejemplo para el campo "Nombre" según el tipo de página.
// Un placeholder de club ("River Plate") no tiene sentido al crear una
// Federación, así que lo hacemos dependiente de draft.type.
const NAME_PLACEHOLDER_BY_TYPE: Record<OrganizationPageType, string> = {
  [ORGANIZATION_PAGE_TYPE.CLUB]: "Ej: Club Atlético River Plate",
  [ORGANIZATION_PAGE_TYPE.ACADEMY]: "Ej: Academia de Fútbol Carlos Bianchi",
  [ORGANIZATION_PAGE_TYPE.FORMATION_SCHOOL]: "Ej: Escuela de Formación La Cantera",
  [ORGANIZATION_PAGE_TYPE.AGENCY]: "Ej: Representaciones Deportivas Sur",
  [ORGANIZATION_PAGE_TYPE.TOURNAMENT_ORGANIZER]: "Ej: Copa Verano Juvenil",
  [ORGANIZATION_PAGE_TYPE.LEAGUE]: "Ej: Liga Profesional de Fútbol",
  [ORGANIZATION_PAGE_TYPE.FEDERATION]: "Ej: Asociación del Fútbol Argentino",
  [ORGANIZATION_PAGE_TYPE.NATIONAL_TEAM]: "Ej: Selección Argentina",
};

const NAME_PLACEHOLDER_FALLBACK = "Ej: Nombre de la organización";

// Clases estáticas por accent para el chip "Estás creando:" del paso 2.
// Espeja el patrón de ACCENT_MAP de TypeCard (Tailwind necesita strings
// estáticos, por eso se replican acá en vez de derivarlos en runtime).
const BADGE_ACCENT_MAP: Record<
  TypeCardAccent,
  { bg: string; text: string; border: string }
> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-200" },
  teal: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-500", border: "border-amber-200" },
  sky: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
};

const SOCIAL_FIELDS: Array<{
  key: keyof PageDraft["socialMedia"];
  labelKey: string;
  originalLabel: string;
  Icon: IconType;
  placeholder: string;
}> = [
  { key: "instagram", labelKey: "instagram", originalLabel: "Instagram", Icon: FaInstagram, placeholder: "https://instagram.com/..." },
  { key: "facebook", labelKey: "facebook", originalLabel: "Facebook", Icon: FaFacebookF, placeholder: "https://facebook.com/..." },
  { key: "twitter", labelKey: "twitter", originalLabel: "X (Twitter)", Icon: FaTwitter, placeholder: "https://x.com/..." },
  { key: "youtube", labelKey: "youtube", originalLabel: "YouTube", Icon: FaYoutube, placeholder: "https://youtube.com/@..." },
];

const MIN_FOUNDATION_YEAR = 1800;

const normalizeCountryKey = (raw: string): string =>
  raw.replace(/\s+y\s+/gi, "Y").replace(/[\s-]+/g, "");

const getCountryCode = (name: string): string | null => {
  if (!name) return null;
  const direct = CountryToCode[name];
  if (direct) return direct;
  const normalized = CountryToCode[normalizeCountryKey(name)];
  return normalized ?? null;
};

export type PageWizardSubmitBody = {
  type?: OrganizationPageType;
  name: string;
  country?: string;
  region?: string;
  foundationYear?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  leagueId?: string | null;
  federationId?: string | null;
  division?: string | null;
  socialMedia?: Record<string, string>;
  photoUrls?: string[];
};

export interface PageWizardFormProps {
  mode: "create" | "edit";
  initialDraft?: PageDraft;
  storageKey: string;
  role: string | null;
  submitLabelKey: string;
  submitLabelOriginal: string;
  viewHref?: string;
  submittingLabelKey: string;
  submittingLabelOriginal: string;
  errorLabelKey: string;
  errorLabelOriginal: string;
  onSubmit: (body: PageWizardSubmitBody) => Promise<OrganizationPage | null>;
  onCancelHref?: string;
}

const PageWizardForm: React.FC<PageWizardFormProps> = ({
  mode,
  initialDraft,
  storageKey,
  role,
  submitLabelKey,
  submitLabelOriginal,
  submittingLabelKey,
  submittingLabelOriginal,
  errorLabelKey,
  errorLabelOriginal,
  onSubmit,
  onCancelHref,
  viewHref,
}) => {
  const { isNextIntlEnabled } = useI18nMode();
  const tOrg = useNextIntlTranslations("organizationPages");
  const { nationalities, loading: nationalitiesLoading } = useNationalities();

  const getText = (original: string, key: string) =>
    isNextIntlEnabled ? tOrg.t(key) : original;

  const firstStep: PageDraft["step"] = mode === "edit" ? 2 : 1;

  const buildInitial = (): PageDraft => {
    if (initialDraft) {
      return { ...initialDraft, step: initialDraft.step ?? firstStep };
    }
    return { ...EMPTY_PAGE_DRAFT, step: firstStep };
  };

  const [draft, setDraft] = useState<PageDraft>(buildInitial);
  const [hydrated, setHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [contactEmailError, setContactEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [websiteError, setWebsiteError] = useState<string | null>(null);
  // Error específico de la "gate" de duplicados — se muestra adentro del
  // bloque de coincidencias, no en el input del nombre. Así el cliente
  // ve el mensaje en el lugar donde tiene que tomar acción (el checkbox).
  const [duplicateGateError, setDuplicateGateError] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<OrganizationPage[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(false);
  // Filtro local (NO se persiste en el draft del club). Acota las ligas
  // disponibles por división. Vacío = todas las ligas del país.
  const [clubDivisionFilter, setClubDivisionFilter] = useState("");
  const [federations, setFederations] = useState<OrganizationPage[]>([]);
  const [federationsLoading, setFederationsLoading] = useState(false);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryRef = useRef<HTMLDivElement | null>(null);

  const [leagueOpen, setLeagueOpen] = useState(false);
  const leagueRef = useRef<HTMLDivElement | null>(null);

  const [federationOpen, setFederationOpen] = useState(false);
  const federationRef = useRef<HTMLDivElement | null>(null);

  // Detección de duplicados: solo aplica al crear (en edit no chequeamos).
  type WizardSimilarMatch = {
    id: string;
    name: string;
    slug: string;
    type: OrganizationPageType;
    country: string | null;
    status: string;
    score: number;
  };
  const [duplicateMatches, setDuplicateMatches] = useState<WizardSimilarMatch[]>(
    [],
  );
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [topScore, setTopScore] = useState(0);
  const [willBePending, setWillBePending] = useState(false);
  const [confirmedNotMine, setConfirmedNotMine] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as PageDraft;
        const merged = { ...EMPTY_PAGE_DRAFT, ...(initialDraft ?? {}), ...parsed };
        if (mode === "edit" && (!merged.step || merged.step < 2)) {
          merged.step = 2;
        }
        setDraft(merged);
      } else if (initialDraft) {
        setDraft({ ...initialDraft, step: initialDraft.step ?? firstStep });
      }
    } catch (err) {
      console.error("Error hydrating draft:", err);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    const handler = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch (err) {
        console.error("Error saving draft:", err);
      }
    }, 500);
    return () => window.clearTimeout(handler);
  }, [draft, hydrated, storageKey]);

  // Reset confirmation when name/type/country change so the user re-acknowledges.
  useEffect(() => {
    setConfirmedNotMine(false);
  }, [draft.name, draft.type, draft.country]);

  // Debounced search for similar pages while the user fills step 2.
  // Only in create mode — edit doesn't re-check duplicates.
  useEffect(() => {
    if (mode === "edit" || !API_URL) return;
    const trimmed = draft.name.trim();
    if (
      !draft.type ||
      !draft.country ||
      trimmed.length < 2 ||
      draft.step !== 2
    ) {
      setDuplicateMatches([]);
      setTopScore(0);
      setWillBePending(false);
      return;
    }
    const controller = new AbortController();
    const handler = window.setTimeout(async () => {
      setDuplicateLoading(true);
      try {
        // El early return de arriba ya garantiza que draft.type != null aquí.
        const params = new URLSearchParams({
          type: draft.type as string,
          name: trimmed,
          country: draft.country,
        });
        const res = await fetch(
          `${API_URL}/organization-pages/check-duplicates?${params.toString()}`,
          { signal: controller.signal },
        );
        if (res.ok) {
          const data = await res.json();
          setDuplicateMatches(data.matches ?? []);
          setTopScore(data.topScore ?? 0);
          setWillBePending(!!data.willBePending);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error checking duplicates:", err);
        }
      } finally {
        setDuplicateLoading(false);
      }
    }, 400);
    return () => {
      window.clearTimeout(handler);
      controller.abort();
    };
  }, [draft.name, draft.type, draft.country, draft.step, mode]);

  useEffect(() => {
    if (draft.type !== "CLUB") {
      return;
    }
    // La Liga depende del país: sin país no se cargan ligas. Limpiamos la
    // lista para que el control quede deshabilitado con su placeholder.
    if (!draft.country || draft.country.trim().length === 0) {
      setLeagues([]);
      return;
    }
    if (!API_URL) return;
    const controller = new AbortController();
    const loadLeagues = async () => {
      setLeaguesLoading(true);
      try {
        // El filtro de división es opcional: si está vacío se omite el param
        // y se traen todas las ligas del país.
        const divisionParam = clubDivisionFilter
          ? `&division=${encodeURIComponent(clubDivisionFilter)}`
          : "";
        const res = await fetch(
          `${API_URL}/organization-pages?type=LEAGUE&limit=100&country=${encodeURIComponent(
            draft.country
          )}${divisionParam}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          const list: OrganizationPage[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
            ? data.items
            : [];
          // El endpoint puede devolver ligas en otros estados al admin
          // (OptionalAuthGuard). En el wizard solo se eligen ligas APPROVED.
          setLeagues(list.filter((l) => l.status === "APPROVED"));
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error loading leagues:", err);
        }
      } finally {
        setLeaguesLoading(false);
      }
    };
    loadLeagues();
    return () => controller.abort();
  }, [draft.type, draft.country, clubDivisionFilter]);

  useEffect(() => {
    if (draft.type !== "LEAGUE") {
      return;
    }
    // La Federación depende del país: sin país no se cargan federaciones.
    // Limpiamos la lista para que el control quede deshabilitado con su
    // placeholder.
    if (!draft.country || draft.country.trim().length === 0) {
      setFederations([]);
      return;
    }
    if (!API_URL) return;
    const controller = new AbortController();
    const loadFederations = async () => {
      setFederationsLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/organization-pages?type=FEDERATION&limit=100&country=${encodeURIComponent(
            draft.country
          )}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          const list: OrganizationPage[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
            ? data.items
            : [];
          // El endpoint puede devolver federaciones en otros estados al admin
          // (OptionalAuthGuard). En el wizard solo se eligen las APPROVED.
          setFederations(list.filter((f) => f.status === "APPROVED"));
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error loading federations:", err);
        }
      } finally {
        setFederationsLoading(false);
      }
    };
    loadFederations();
    return () => controller.abort();
  }, [draft.type, draft.country]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
      if (leagueRef.current && !leagueRef.current.contains(e.target as Node)) {
        setLeagueOpen(false);
      }
      if (
        federationRef.current &&
        !federationRef.current.contains(e.target as Node)
      ) {
        setFederationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = role === "ADMIN";

  const availableTypes = TYPE_OPTIONS.filter(
    (opt) => !opt.adminOnly || role === "ADMIN"
  );

  const selectType = (type: OrganizationPageType) => {
    setDraft((prev) => ({
      ...prev,
      type,
      step: 2,
      leagueId: type === "CLUB" ? prev.leagueId : null,
      federationId: type === "LEAGUE" ? prev.federationId : null,
    }));
  };

  const validateStep = (step: PageDraft["step"]): boolean => {
    const nameOk = draft.name.trim().length > 0;
    const countryOk = draft.country.trim().length > 0;
    // En create, si detectamos coincidencias, el usuario debe confirmar
    // explícitamente que ninguna es su organización antes de avanzar.
    const duplicateGate =
      mode === "edit" || duplicateMatches.length === 0 || confirmedNotMine;
    // Paso 3 requiere logo/banner tanto en create como en edit — el cliente
    // confirmó que se aplica en los dos modos para mantener la calidad de las
    // páginas. Email y teléfono son obligatorios para no-admin; para ADMIN son
    // opcionales (pero si el admin carga un email, debe ser válido).
    const detailsRequired =
      draft.logoUrl.trim().length > 0 &&
      draft.bannerUrl.trim().length > 0 &&
      (isAdmin
        ? draft.contactEmail.trim() === "" ||
          /^.+@.+\..+$/.test(draft.contactEmail.trim())
        : /^.+@.+\..+$/.test(draft.contactEmail.trim())) &&
      (isAdmin || draft.phone.trim().length > 0);
    switch (step) {
      case 1:
        return !!draft.type;
      case 2:
        return !!draft.type && nameOk && countryOk && duplicateGate;
      case 3:
        return !!draft.type && nameOk && countryOk && duplicateGate;
      case 4:
        return !!draft.type && nameOk && countryOk && duplicateGate && detailsRequired;
      default:
        return false;
    }
  };

  const canReachStep = (step: PageDraft["step"]): boolean => {
    const start: PageDraft["step"] = mode === "edit" ? 2 : 1;
    for (let s: PageDraft["step"] = start; s < step; s = (s + 1) as PageDraft["step"]) {
      if (!validateStep(s)) return false;
    }
    return true;
  };

  const goToStep = (step: PageDraft["step"]) => {
    const floor: PageDraft["step"] = mode === "edit" ? 2 : 1;
    const clamped = (step < floor ? floor : step) as PageDraft["step"];
    setDraft((prev) => {
      if (clamped <= prev.step) {
        return { ...prev, step: clamped };
      }
      let target: PageDraft["step"] = prev.step;
      for (let s: PageDraft["step"] = prev.step; s < clamped; s = (s + 1) as PageDraft["step"]) {
        if (!validateStep(s)) break;
        target = (s + 1) as PageDraft["step"];
      }
      return { ...prev, step: target };
    });
  };

  const handleNextFromInfo = () => {
    if (!draft.name.trim()) {
      setNameError(getText("El nombre es obligatorio", "nameRequired"));
      return;
    }
    if (!draft.country.trim()) {
      setNameError(getText("El país es obligatorio", "countryRequired"));
      return;
    }
    if (
      mode !== "edit" &&
      duplicateMatches.length > 0 &&
      !confirmedNotMine
    ) {
      setDuplicateGateError(
        getText(
          "Tildá \"Ninguna de estas es mi organización\" para continuar, o cambiá el nombre para evitar duplicados.",
          "confirmDuplicateGate",
        ),
      );
      return;
    }
    setNameError(null);
    setDuplicateGateError(null);
    goToStep(3);
  };

  // Validación de paso 3 (Detalles). Se aplica en create y edit.
  const handleNextFromDetails = () => {
    let hasError = false;
    if (!draft.logoUrl.trim()) {
      setLogoError(getText("El logo es obligatorio", "logoRequired"));
      hasError = true;
    } else {
      setLogoError(null);
    }
    if (!draft.bannerUrl.trim()) {
      setBannerError(getText("El banner es obligatorio", "bannerRequired"));
      hasError = true;
    } else {
      setBannerError(null);
    }
    const emailTrim = draft.contactEmail.trim();
    if (!emailTrim) {
      // Para ADMIN el email es opcional: no se exige cuando está vacío.
      if (!isAdmin) {
        setContactEmailError(
          getText("El email es obligatorio", "contactEmailRequired"),
        );
        hasError = true;
      } else {
        setContactEmailError(null);
      }
    } else if (!/^.+@.+\..+$/.test(emailTrim)) {
      setContactEmailError(
        getText("Email inválido", "contactEmailInvalid"),
      );
      hasError = true;
    } else {
      setContactEmailError(null);
    }
    if (!draft.phone.trim()) {
      // Para ADMIN el teléfono es opcional: no se exige cuando está vacío.
      if (!isAdmin) {
        setPhoneError(getText("El teléfono es obligatorio", "phoneRequired"));
        hasError = true;
      } else {
        setPhoneError(null);
      }
    } else {
      setPhoneError(null);
    }
    // Sitio web es opcional, pero si cargaste algo debe ser una URL válida.
    // Antes el backend rechazaba con @IsUrl() y el publish fallaba silencioso.
    const websiteTrim = draft.website.trim();
    if (websiteTrim) {
      const looksLikeUrl =
        /^https?:\/\/[^\s]+\.[^\s]+/.test(websiteTrim) ||
        /^[^\s]+\.[a-z]{2,}/i.test(websiteTrim);
      if (!looksLikeUrl) {
        setWebsiteError(
          getText("Sitio web inválido (ej: https://tusitio.com)", "websiteInvalid"),
        );
        hasError = true;
      } else {
        setWebsiteError(null);
      }
    } else {
      setWebsiteError(null);
    }
    if (!hasError) goToStep(4);
  };

  const updateField = <K extends keyof PageDraft>(key: K, value: PageDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  // Cambiar el filtro de división (solo CLUB) resetea la liga elegida: una
  // liga de otra división no debe quedar pegada al draft.
  const handleClubDivisionFilterChange = (value: string) => {
    setClubDivisionFilter(value);
    updateField("leagueId", null);
  };

  const updateSocial = (
    key: keyof PageDraft["socialMedia"],
    value: string
  ) => {
    setDraft((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [key]: value },
    }));
  };

  const submit = async () => {
    if (!draft.name.trim() || !draft.type) {
      setNameError(getText("El nombre es obligatorio", "nameRequired"));
      setDraft((prev) => ({ ...prev, step: 2 }));
      return;
    }

    const body: PageWizardSubmitBody = {
      name: draft.name.trim(),
    };
    if (mode !== "edit") {
      body.type = draft.type;
    }
    if (draft.country.trim()) body.country = draft.country.trim();
    if (draft.region.trim()) body.region = draft.region.trim();
    if (draft.foundationYear.trim())
      body.foundationYear = draft.foundationYear.trim();
    if (draft.description.trim()) body.description = draft.description.trim();
    if (draft.logoUrl.trim()) body.logoUrl = draft.logoUrl.trim();
    if (draft.bannerUrl.trim()) body.bannerUrl = draft.bannerUrl.trim();
    if (draft.website.trim()) body.website = draft.website.trim();
    if (draft.contactEmail.trim()) body.contactEmail = draft.contactEmail.trim();
    if (draft.phone.trim()) body.phone = draft.phone.trim();
    if (draft.type === "CLUB") body.leagueId = draft.leagueId ?? null;
    if (draft.type === "LEAGUE") body.federationId = draft.federationId ?? null;
    // La división solo se persiste en páginas LEAGUE. Para CLUB es solo un
    // filtro local; el club hereda la división de su liga.
    if (draft.type === "LEAGUE") body.division = draft.division ?? null;

    const socialEntries = Object.entries(draft.socialMedia).filter(
      ([, v]) => typeof v === "string" && v.trim() !== ""
    );
    if (socialEntries.length > 0) {
      body.socialMedia = Object.fromEntries(
        socialEntries.map(([k, v]) => [k, (v as string).trim()])
      );
    }

    const photoUrls = draft.photoUrls
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    body.photoUrls = photoUrls;

    setIsSubmitting(true);
    try {
      const result = await onSubmit(body);
      if (result) {
        try {
          window.localStorage.removeItem(storageKey);
        } catch {
          // ignore
        }
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Error submitting page:", err);
      toast.error(getText(errorLabelOriginal, errorLabelKey));
      setIsSubmitting(false);
    }
  };

  const filteredCountries = nationalities.filter((n) =>
    n.label.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedLeague = leagues.find((l) => l.id === draft.leagueId) ?? null;

  const selectedTypeOption = TYPE_OPTIONS.find((t) => t.type === draft.type);

  const stepLabels = [
    getText("Tipo", "stepLabel1"),
    getText("Información", "stepLabel2"),
    getText("Detalles", "stepLabel3"),
    getText("Revisión", "stepLabel4"),
  ];

  const stepTitles: Record<PageDraft["step"], string> = {
    1: getText("¿Qué tipo de página querés crear?", "step1Title"),
    2: getText("Información básica", "step2Title"),
    3: getText("Detalles y contacto", "step3Title"),
    4: getText("Revisión", "step4Title"),
  };

  return (
    <>
      <p className="text-sm text-gray-500 mt-1 text-center">
        {stepTitles[draft.step]}
      </p>

      <WizardStepIndicator
        currentStep={draft.step}
        labels={stepLabels}
        onStepClick={goToStep}
        canReachStep={canReachStep}
      />

      <AnimatePresence mode="wait">
        <motion.section
          key={draft.step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-8 mt-4"
        >
          {draft.step === 1 && mode !== "edit" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availableTypes.map((opt) => (
                <TypeCard
                  key={opt.type}
                  type={opt.type}
                  title={getText(opt.originalTitle, opt.titleKey)}
                  description={getText(opt.originalDesc, opt.descKey)}
                  Icon={opt.Icon}
                  accent={opt.accent}
                  selected={draft.type === opt.type}
                  onSelect={selectType}
                />
              ))}
            </div>
          )}

          {draft.step === 2 && (
            <div className="flex flex-col gap-5">
              {selectedTypeOption &&
                (() => {
                  const a = BADGE_ACCENT_MAP[selectedTypeOption.accent];
                  const Icon = selectedTypeOption.Icon;
                  return (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">
                        {getText("Estás creando:", "creatingTypeLabel")}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold ${a.bg} ${a.text} ${a.border}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {getText(
                          selectedTypeOption.originalTitle,
                          selectedTypeOption.titleKey
                        )}
                      </span>
                    </div>
                  );
                })()}

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                  {getText("Nombre", "name")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={draft.name}
                  placeholder={
                    draft.type
                      ? NAME_PLACEHOLDER_BY_TYPE[draft.type]
                      : NAME_PLACEHOLDER_FALLBACK
                  }
                  onChange={(e) => {
                    updateField("name", e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  className="border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {nameError && (
                  <span className="text-red-500 text-xs mt-1">{nameError}</span>
                )}
              </div>

              {mode !== "edit" && (duplicateLoading || duplicateMatches.length > 0) && (
                <div
                  className={`rounded-xl border p-4 flex flex-col gap-3 ${
                    willBePending
                      ? "border-amber-300 bg-amber-50"
                      : "border-emerald-200 bg-emerald-50/40"
                  }`}
                >
                  {duplicateLoading && duplicateMatches.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      {getText("Buscando coincidencias...", "duplicateSearching")}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wide shrink-0 mt-0.5 ${
                            willBePending ? "text-amber-700" : "text-emerald-700"
                          }`}
                        >
                          {willBePending
                            ? getText(
                                "Coincidencias detectadas",
                                "duplicateMatchTitleHigh",
                              )
                            : getText(
                                "Posibles coincidencias",
                                "duplicateMatchTitle",
                              )}
                        </span>
                        <span className="text-xs text-gray-600">
                          {willBePending
                            ? getText(
                                "Si publicás esta página, va a quedar esperando aprobación del admin.",
                                "duplicateWillBePending",
                              )
                            : getText(
                                "Verificá si tu organización ya está creada antes de publicar.",
                                "duplicateMatchHint",
                              )}
                        </span>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {duplicateMatches.map((m) => (
                          <li
                            key={m.id}
                            className="bg-white rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between gap-3"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-sm text-gray-800 truncate">
                                {m.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {m.country ?? "—"}
                                {" · "}
                                {Math.round(m.score * 100)}%{" "}
                                {getText("similitud", "similarity")}
                              </span>
                            </div>
                            <a
                              href={`/pages/${m.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-emerald-700 hover:underline shrink-0"
                            >
                              {getText("Ver", "viewPage")}
                            </a>
                          </li>
                        ))}
                      </ul>
                      <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={confirmedNotMine}
                          onChange={(e) => {
                            setConfirmedNotMine(e.target.checked);
                            if (e.target.checked) setDuplicateGateError(null);
                          }}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-verde-oscuro focus:ring-emerald-500"
                        />
                        <span>
                          {getText(
                            "Ninguna de estas es mi organización, quiero crear una nueva.",
                            "confirmNotMine",
                          )}
                        </span>
                      </label>
                      {duplicateGateError && (
                        <p className="text-red-600 text-xs mt-2 leading-snug">
                          {duplicateGateError}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col relative" ref={countryRef}>
                  <label className="text-sm font-semibold text-gray-700 mb-1">
                    {getText("País", "country")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {(() => {
                        const code = getCountryCode(draft.country);
                        return code ? (
                          <CountryFlag
                            countryCode={code}
                            svg
                            style={{ width: "20px", height: "14px" }}
                            title={draft.country}
                          />
                        ) : (
                          <FaGlobeAmericas className="h-4 w-4 text-gray-400" />
                        );
                      })()}
                    </div>
                    <input
                      type="text"
                      value={countrySearch || draft.country}
                      onClick={() => setCountryOpen(true)}
                      onChange={(e) => {
                        setCountrySearch(e.target.value);
                        setCountryOpen(true);
                        // Al limpiar/editar el país, la liga/federación deja
                        // de ser válida (cambia el set disponible por país).
                        if (draft.country) {
                          updateField("leagueId", null);
                          updateField("federationId", null);
                        }
                        updateField("country", "");
                      }}
                      placeholder={getText("Buscar país...", "searchCountry")}
                      className="w-full border border-gray-300 rounded-lg p-3 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <FaChevronDown
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 cursor-pointer"
                      onClick={() => setCountryOpen((v) => !v)}
                    />
                  </div>
                  {countryOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto z-20">
                      {nationalitiesLoading && (
                        <div className="p-3 text-gray-500 text-sm">
                          {getText("Cargando...", "loading")}
                        </div>
                      )}
                      {filteredCountries.length === 0 && !nationalitiesLoading && (
                        <div className="p-3 text-gray-400 text-sm">
                          {getText("Sin resultados", "noResults")}
                        </div>
                      )}
                      <ul>
                        {filteredCountries.slice(0, 80).map((n) => {
                          const code = getCountryCode(n.label);
                          return (
                            <li
                              key={n.value}
                              className="p-3 cursor-pointer text-gray-700 hover:bg-emerald-50 text-sm flex items-center gap-2"
                              onClick={() => {
                                // Cambiar de país invalida la liga/federación
                                // elegida: una de otro país no debe quedar
                                // pegada. Solo se resetea en cambios reales del
                                // usuario (este handler), no en el mount de
                                // edición.
                                if (draft.country !== n.label) {
                                  updateField("leagueId", null);
                                  updateField("federationId", null);
                                }
                                updateField("country", n.label);
                                setCountrySearch(n.label);
                                setCountryOpen(false);
                              }}
                            >
                              {code ? (
                                <CountryFlag
                                  countryCode={code}
                                  svg
                                  style={{ width: "20px", height: "14px" }}
                                  title={n.label}
                                />
                              ) : (
                                <span className="inline-block w-5 text-center">🏳️</span>
                              )}
                              <span>{n.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">
                    {getText("Región", "region")}
                  </label>
                  <input
                    type="text"
                    value={draft.region}
                    placeholder={getText("Ej: Buenos Aires", "regionPlaceholder")}
                    onChange={(e) => updateField("region", e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">
                    {getText("Año de fundación", "foundationYear")}
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={MIN_FOUNDATION_YEAR}
                    max={new Date().getFullYear()}
                    step={1}
                    value={draft.foundationYear}
                    placeholder={getText("Ej: 1901", "foundationYearPlaceholder")}
                    onChange={(e) => updateField("foundationYear", e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {draft.type === "CLUB" &&
                  (() => {
                    const hasCountry = draft.country.trim().length > 0;
                    return (
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1 inline-flex items-center gap-1.5">
                          <FaFutbol className="h-3.5 w-3.5 text-sky-500" />
                          {getText("División", "division")}{" "}
                          <span className="text-gray-400 font-normal">
                            {getText("(opcional)", "optional")}
                          </span>
                        </label>
                        <select
                          value={clubDivisionFilter}
                          disabled={!hasCountry}
                          onChange={(e) =>
                            handleClubDivisionFilterChange(e.target.value)
                          }
                          className={`w-full border border-gray-300 rounded-lg p-3 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            !hasCountry
                              ? "opacity-60 cursor-not-allowed text-gray-400"
                              : "text-gray-700"
                          }`}
                        >
                          <option value="">
                            {hasCountry
                              ? getText(
                                  "Todas las divisiones",
                                  "divisionFilterAll"
                                )
                              : getText(
                                  "Seleccioná un país primero",
                                  "leagueSelectNeedsCountry"
                                )}
                          </option>
                          {LEAGUE_DIVISIONS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}

                {draft.type === "CLUB" &&
                  (() => {
                    const hasCountry = draft.country.trim().length > 0;
                    const selectedLeague =
                      leagues.find((l) => l.id === draft.leagueId) ?? null;
                    const isDisabled = !hasCountry;
                    let placeholder: string;
                    if (!hasCountry) {
                      placeholder = getText(
                        "Seleccioná un país primero",
                        "leagueSelectNeedsCountry"
                      );
                    } else if (leaguesLoading) {
                      placeholder = getText("Cargando ligas...", "loadingLeagues");
                    } else {
                      placeholder = getText(
                        "Seleccionar liga (opcional)",
                        "leagueSelectPlaceholder"
                      );
                    }
                    return (
                      <div className="flex flex-col relative" ref={leagueRef}>
                        <label className="text-sm font-semibold text-gray-700 mb-1 inline-flex items-center gap-1.5">
                          <FaTrophy className="h-3.5 w-3.5 text-amber-500" />
                          {getText("Liga", "league")}{" "}
                          <span className="text-gray-400 font-normal">
                            {getText("(opcional)", "optional")}
                          </span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => setLeagueOpen((v) => !v)}
                            className={`w-full border border-gray-300 rounded-lg p-3 pl-3 pr-10 text-left flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                              isDisabled
                                ? "opacity-60 cursor-not-allowed text-gray-400"
                                : "text-gray-700"
                            }`}
                          >
                            {selectedLeague ? (
                              <>
                                {selectedLeague.logoUrl ? (
                                  <NextImage
                                    src={selectedLeague.logoUrl}
                                    alt={selectedLeague.name}
                                    width={20}
                                    height={20}
                                    className="h-5 w-5 rounded-full object-cover"
                                  />
                                ) : (
                                  <FaTrophy className="h-4 w-4 text-amber-500" />
                                )}
                                <span className="truncate">
                                  {selectedLeague.name}
                                </span>
                              </>
                            ) : (
                              <span className="truncate">{placeholder}</span>
                            )}
                          </button>
                          <FaChevronDown
                            className={`absolute top-1/2 right-3 -translate-y-1/2 ${
                              isDisabled
                                ? "text-gray-300"
                                : "text-gray-400 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!isDisabled) setLeagueOpen((v) => !v);
                            }}
                          />
                        </div>
                        {leagueOpen && !isDisabled && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto z-20">
                            {leaguesLoading && (
                              <div className="p-3 text-gray-500 text-sm">
                                {getText("Cargando ligas...", "loadingLeagues")}
                              </div>
                            )}
                            {!leaguesLoading && leagues.length === 0 && (
                              <div className="p-3 text-gray-400 text-sm">
                                {getText(
                                  "No hay ligas cargadas para este país",
                                  "leagueSelectEmptyForCountry"
                                )}
                              </div>
                            )}
                            {!leaguesLoading && leagues.length > 0 && (
                              <ul>
                                <li
                                  className="p-3 cursor-pointer text-gray-500 hover:bg-emerald-50 text-sm flex items-center gap-2"
                                  onClick={() => {
                                    updateField("leagueId", null);
                                    setLeagueOpen(false);
                                  }}
                                >
                                  <span className="inline-block w-5 text-center">
                                    —
                                  </span>
                                  <span>
                                    {getText(
                                      "Sin liga",
                                      "leagueSelectNone"
                                    )}
                                  </span>
                                </li>
                                {leagues.map((l) => (
                                  <li
                                    key={l.id}
                                    className="p-3 cursor-pointer text-gray-700 hover:bg-emerald-50 text-sm flex items-center gap-2"
                                    onClick={() => {
                                      updateField("leagueId", l.id);
                                      setLeagueOpen(false);
                                    }}
                                  >
                                    {l.logoUrl ? (
                                      <NextImage
                                        src={l.logoUrl}
                                        alt={l.name}
                                        width={20}
                                        height={20}
                                        className="h-5 w-5 rounded-full object-cover"
                                      />
                                    ) : (
                                      <FaTrophy className="h-4 w-4 text-amber-500" />
                                    )}
                                    <span>{l.name}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                {draft.type === "LEAGUE" &&
                  (() => {
                    const hasCountry = draft.country.trim().length > 0;
                    const selectedFederation =
                      federations.find((f) => f.id === draft.federationId) ??
                      null;
                    const isDisabled = !hasCountry;
                    let placeholder: string;
                    if (!hasCountry) {
                      placeholder = getText(
                        "Seleccioná un país primero",
                        "federationSelectNeedsCountry"
                      );
                    } else if (federationsLoading) {
                      placeholder = getText(
                        "Cargando federaciones...",
                        "loadingFederations"
                      );
                    } else {
                      placeholder = getText(
                        "Seleccionar federación (opcional)",
                        "federationSelectPlaceholder"
                      );
                    }
                    return (
                      <div className="flex flex-col relative" ref={federationRef}>
                        <label className="text-sm font-semibold text-gray-700 mb-1 inline-flex items-center gap-1.5">
                          <FaCrown className="h-3.5 w-3.5 text-violet-500" />
                          {getText("Federación", "federation")}{" "}
                          <span className="text-gray-400 font-normal">
                            {getText("(opcional)", "optional")}
                          </span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => setFederationOpen((v) => !v)}
                            className={`w-full border border-gray-300 rounded-lg p-3 pl-3 pr-10 text-left flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                              isDisabled
                                ? "opacity-60 cursor-not-allowed text-gray-400"
                                : "text-gray-700"
                            }`}
                          >
                            {selectedFederation ? (
                              <>
                                {selectedFederation.logoUrl ? (
                                  <NextImage
                                    src={selectedFederation.logoUrl}
                                    alt={selectedFederation.name}
                                    width={20}
                                    height={20}
                                    className="h-5 w-5 rounded-full object-cover"
                                  />
                                ) : (
                                  <FaCrown className="h-4 w-4 text-violet-500" />
                                )}
                                <span className="truncate">
                                  {selectedFederation.name}
                                </span>
                              </>
                            ) : (
                              <span className="truncate">{placeholder}</span>
                            )}
                          </button>
                          <FaChevronDown
                            className={`absolute top-1/2 right-3 -translate-y-1/2 ${
                              isDisabled
                                ? "text-gray-300"
                                : "text-gray-400 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!isDisabled) setFederationOpen((v) => !v);
                            }}
                          />
                        </div>
                        {federationOpen && !isDisabled && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto z-20">
                            {federationsLoading && (
                              <div className="p-3 text-gray-500 text-sm">
                                {getText(
                                  "Cargando federaciones...",
                                  "loadingFederations"
                                )}
                              </div>
                            )}
                            {!federationsLoading &&
                              federations.length === 0 && (
                                <div className="p-3 text-gray-400 text-sm">
                                  {getText(
                                    "No hay federaciones cargadas para este país",
                                    "federationSelectEmptyForCountry"
                                  )}
                                </div>
                              )}
                            {!federationsLoading && federations.length > 0 && (
                              <ul>
                                <li
                                  className="p-3 cursor-pointer text-gray-500 hover:bg-emerald-50 text-sm flex items-center gap-2"
                                  onClick={() => {
                                    updateField("federationId", null);
                                    setFederationOpen(false);
                                  }}
                                >
                                  <span className="inline-block w-5 text-center">
                                    —
                                  </span>
                                  <span>
                                    {getText(
                                      "Sin federación",
                                      "federationSelectNone"
                                    )}
                                  </span>
                                </li>
                                {federations.map((f) => (
                                  <li
                                    key={f.id}
                                    className="p-3 cursor-pointer text-gray-700 hover:bg-emerald-50 text-sm flex items-center gap-2"
                                    onClick={() => {
                                      updateField("federationId", f.id);
                                      setFederationOpen(false);
                                    }}
                                  >
                                    {f.logoUrl ? (
                                      <NextImage
                                        src={f.logoUrl}
                                        alt={f.name}
                                        width={20}
                                        height={20}
                                        className="h-5 w-5 rounded-full object-cover"
                                      />
                                    ) : (
                                      <FaCrown className="h-4 w-4 text-violet-500" />
                                    )}
                                    <span>{f.name}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                {draft.type === "LEAGUE" && (
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1 inline-flex items-center gap-1.5">
                      <FaFutbol className="h-3.5 w-3.5 text-sky-500" />
                      {getText("División", "division")}{" "}
                      <span className="text-gray-400 font-normal">
                        {getText("(opcional)", "optional")}
                      </span>
                    </label>
                    <select
                      value={draft.division ?? ""}
                      onChange={(e) =>
                        updateField("division", e.target.value || null)
                      }
                      className="w-full border border-gray-300 rounded-lg p-3 pr-10 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">
                        {getText(
                          "Seleccionar división (opcional)",
                          "divisionSelectPlaceholder"
                        )}
                      </option>
                      {LEAGUE_DIVISIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                  {getText("Descripción", "description")}
                </label>
                <textarea
                  value={draft.description}
                  placeholder={getText(
                    "Contá brevemente sobre tu organización...",
                    "descriptionPlaceholder"
                  )}
                  maxLength={500}
                  rows={4}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <span className="text-xs text-gray-400 mt-1 self-end">
                  {draft.description.length}/500
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                {mode === "edit" ? (
                  <span />
                ) : (
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-verde-oscuro transition-colors"
                  >
                    <FaArrowLeft className="h-3 w-3" />
                    {getText("Atrás", "back")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNextFromInfo}
                  className="flex items-center gap-2 bg-verde-oscuro hover:bg-verde-mas-claro text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  {getText("Siguiente", "next")}
                  <FaArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {draft.step === 3 && (
            <div className="flex flex-col gap-6">
              <div
                className={`bg-emerald-50/40 border rounded-xl p-4 ${
                  logoError ? "border-red-400" : "border-emerald-100"
                }`}
              >
                <ImageUploadwithCrop
                  fileInputId="page-logo-file"
                  label={getText("Logo", "logo")}
                  buttonLabel={getText("Subir logo", "uploadLogo")}
                  aspect={1}
                  // Logos de clubes/agencias suelen venir sin margen; un crop
                  // redondo cortaba esquinas. Mantenemos 1:1 pero con crop
                  // cuadrado para preservar el escudo completo.
                  cropShape="rect"
                  previewShape="rect"
                  initialImage={draft.logoUrl || undefined}
                  onUpload={(url) => {
                    updateField("logoUrl", url);
                    if (logoError) setLogoError(null);
                  }}
                  onRemove={() => updateField("logoUrl", "")}
                />
                {logoError && (
                  <span className="text-red-500 text-xs mt-2 block">
                    {logoError}
                  </span>
                )}
              </div>

              <div
                className={`bg-emerald-50/40 border rounded-xl p-4 ${
                  bannerError ? "border-red-400" : "border-emerald-100"
                }`}
              >
                <ImageUploadwithCrop
                  fileInputId="page-banner-file"
                  label={getText("Banner", "banner")}
                  buttonLabel={getText("Subir banner", "uploadBanner")}
                  aspect={3}
                  cropShape="rect"
                  previewShape="rect"
                  previewWidthClass="w-full max-w-md"
                  previewHeightClass="h-32"
                  cropAreaWidthClass="w-full max-w-lg"
                  cropAreaHeightClass="h-48"
                  initialImage={draft.bannerUrl || undefined}
                  onUpload={(url) => {
                    updateField("bannerUrl", url);
                    if (bannerError) setBannerError(null);
                  }}
                  onRemove={() => updateField("bannerUrl", "")}
                />
                {bannerError && (
                  <span className="text-red-500 text-xs mt-2 block">
                    {bannerError}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">
                    {getText("Sitio web", "website")}
                  </label>
                  <div className="relative">
                    <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={draft.website}
                      placeholder={getText("https://tusitio.com", "websitePlaceholder")}
                      onChange={(e) => {
                        updateField("website", e.target.value);
                        if (websiteError) setWebsiteError(null);
                      }}
                      className={`w-full border rounded-lg p-3 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        websiteError ? "border-red-400" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {websiteError && (
                    <span className="text-red-500 text-xs mt-1">
                      {websiteError}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">
                    {getText("Email de contacto", "contactEmail")}
                  </label>
                  <input
                    type="email"
                    value={draft.contactEmail}
                    placeholder={getText(
                      "contacto@tusitio.com",
                      "contactEmailPlaceholder"
                    )}
                    onChange={(e) => {
                      updateField("contactEmail", e.target.value);
                      if (contactEmailError) setContactEmailError(null);
                    }}
                    className={`border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      contactEmailError ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                  {contactEmailError && (
                    <span className="text-red-500 text-xs mt-1">
                      {contactEmailError}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                  {getText("Teléfono", "phone")}
                </label>
                <PhoneNumberInput
                  mode="edit"
                  name="phone"
                  label=""
                  value={draft.phone}
                  onChange={(e) => {
                    updateField("phone", e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  className={`w-full border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    phoneError ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {phoneError && (
                  <span className="text-red-500 text-xs mt-1">
                    {phoneError}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-gray-700">
                  {getText("Redes sociales", "socialMedia")}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SOCIAL_FIELDS.map(({ key, labelKey, originalLabel, Icon, placeholder }) => (
                    <div key={key} className="flex flex-col">
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="url"
                          value={draft.socialMedia[key] ?? ""}
                          placeholder={`${getText(originalLabel, labelKey)} — ${placeholder}`}
                          onChange={(e) => updateSocial(key, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-3 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multimedia (opcional): fotos extra. Espeja la UX del form de
                  perfil (PersonalInfo). Nunca bloquea por estar vacío. */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  {getText("Fotos extra (hasta 3)", "photosTitle")}
                </span>
                <p className="text-xs text-gray-500">
                  {getText(
                    "Sumá fotos para mejorar la página.",
                    "photosHint",
                  )}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[0, 1, 2].map((idx) => {
                    const url = draft.photoUrls[idx] ?? "";
                    return (
                      <div
                        key={`page-photo-${idx}`}
                        className="border border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center"
                      >
                        <ImageUploadwithCrop
                          initialImage={url || undefined}
                          onUpload={(uploaded) => {
                            setDraft((prev) => {
                              const arr = [...prev.photoUrls];
                              while (arr.length <= idx) arr.push("");
                              arr[idx] = uploaded;
                              return { ...prev, photoUrls: arr };
                            });
                          }}
                          onRemove={() => {
                            setDraft((prev) => {
                              const arr = [...prev.photoUrls];
                              while (arr.length <= idx) arr.push("");
                              arr[idx] = "";
                              return { ...prev, photoUrls: arr };
                            });
                          }}
                          fileInputId={`page-photo-${idx}`}
                          label={getText(`Foto ${idx + 1}`, "photoSlot")}
                          buttonLabel={getText("Subir", "uploadShort")}
                          cropShape="rect"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="flex items-center gap-2 text-gray-600 hover:text-verde-oscuro transition-colors"
                >
                  <FaArrowLeft className="h-3 w-3" />
                  {getText("Atrás", "back")}
                </button>
                <button
                  type="button"
                  onClick={handleNextFromDetails}
                  className="flex items-center gap-2 bg-verde-oscuro hover:bg-verde-mas-claro text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  {getText("Siguiente", "next")}
                  <FaArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {draft.step === 4 && (
            <div className="flex flex-col gap-6">
              <p className="text-sm text-gray-500">
                {getText(
                  "Revisá que todo esté correcto antes de publicar.",
                  "reviewHint"
                )}
              </p>

              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                {draft.bannerUrl && (
                  <div
                    className="h-32 sm:h-40 bg-gray-100"
                    style={{
                      backgroundImage: `url(${draft.bannerUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                )}
                <div className="px-5 sm:px-6 pb-6 pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0 ${
                        draft.bannerUrl ? "-mt-16 sm:-mt-20" : ""
                      }`}
                    >
                      {draft.logoUrl ? (
                        <NextImage
                          src={draft.logoUrl}
                          alt={draft.name}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <FaUsers className="h-8 w-8 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-verde-oscuro break-words">
                        {draft.name || "—"}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        {selectedTypeOption && (
                          <PageTypeTag
                            type={selectedTypeOption.type}
                            label={getText(
                              selectedTypeOption.originalTitle,
                              selectedTypeOption.titleKey
                            )}
                            size="sm"
                          />
                        )}
                        {draft.country && (
                          <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                            <FaGlobeAmericas className="h-3 w-3" />
                            {draft.country}
                            {draft.region ? `, ${draft.region}` : ""}
                          </span>
                        )}
                        {draft.foundationYear && (
                          <span className="text-xs text-gray-500">
                            {getText("Fundado en", "founded")} {draft.foundationYear}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {draft.description && (
                    <p className="mt-5 text-sm text-gray-700 whitespace-pre-line border-t border-gray-100 pt-4">
                      {draft.description}
                    </p>
                  )}

                  {(draft.website ||
                    draft.contactEmail ||
                    draft.phone ||
                    selectedLeague) && (
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 border-t border-gray-100 pt-4">
                      {draft.website && (
                        <div className="flex items-center gap-2 min-w-0">
                          <FaGlobe className="h-4 w-4 text-gray-400 shrink-0" />
                          <a
                            href={draft.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline truncate"
                          >
                            {draft.website}
                          </a>
                        </div>
                      )}
                      {draft.contactEmail && (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-gray-400 shrink-0">@</span>
                          <a
                            href={`mailto:${draft.contactEmail}`}
                            className="text-emerald-700 hover:underline truncate"
                          >
                            {draft.contactEmail}
                          </a>
                        </div>
                      )}
                      {draft.phone && (
                        <div className="flex items-center gap-2 min-w-0">
                          <FaPhone className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="truncate">{draft.phone}</span>
                        </div>
                      )}
                      {selectedLeague && (
                        <div className="flex items-center gap-2 min-w-0">
                          <FaTrophy className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {getText("Compite en", "competesIn")}:{" "}
                            <span className="font-semibold">{selectedLeague.name}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {Object.values(draft.socialMedia).some((v) => !!v) && (
                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {getText("Redes sociales", "socialMedia")}
                      </p>
                      <SocialMediaIcons socialMedia={draft.socialMedia} />
                    </div>
                  )}

                  {(() => {
                    const photoCount = draft.photoUrls.filter((p) =>
                      p.trim(),
                    ).length;
                    if (photoCount === 0) return null;
                    return (
                      <p className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500">
                        {getText("Multimedia", "multimedia")}:{" "}
                        {photoCount} {getText("fotos", "photosLabel")}
                      </p>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 text-gray-600 hover:text-verde-oscuro disabled:opacity-50 transition-colors"
                >
                  <FaArrowLeft className="h-3 w-3" />
                  {getText("Atrás", "back")}
                </button>
                <div className="flex items-center gap-2 flex-wrap">
                  {viewHref && (
                    <Link
                      href={viewHref}
                      className="inline-flex items-center bg-white border border-verde-oscuro text-verde-oscuro font-semibold px-5 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      {getText("Ver página", "viewPage")}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={submit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-verde-oscuro hover:bg-verde-mas-claro disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    {isSubmitting
                      ? getText(submittingLabelOriginal, submittingLabelKey)
                      : getText(submitLabelOriginal, submitLabelKey)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {onCancelHref && (
        <div className="text-center mt-6">
          <a
            href={onCancelHref}
            className="text-xs text-gray-500 hover:text-verde-oscuro"
          >
            ← {getText("Volver", "back")}
          </a>
        </div>
      )}
    </>
  );
};

export default PageWizardForm;
