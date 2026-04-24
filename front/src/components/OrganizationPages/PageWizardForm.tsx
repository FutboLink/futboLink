"use client";

import { AnimatePresence, motion } from "framer-motion";
import NextImage from "next/image";
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
import { toast } from "react-toastify";
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
  type: OrganizationPageType;
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
  socialMedia?: Record<string, string>;
};

export interface PageWizardFormProps {
  mode: "create" | "edit";
  initialDraft?: PageDraft;
  storageKey: string;
  role: string | null;
  submitLabelKey: string;
  submitLabelOriginal: string;
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
  const [leagues, setLeagues] = useState<OrganizationPage[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(false);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (draft.type !== "CLUB") {
      return;
    }
    if (!API_URL) return;
    const controller = new AbortController();
    const loadLeagues = async () => {
      setLeaguesLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/organization-pages?type=LEAGUE&limit=100`,
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
          setLeagues(list);
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
  }, [draft.type]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableTypes = TYPE_OPTIONS.filter(
    (opt) => !opt.adminOnly || role === "ADMIN"
  );

  const selectType = (type: OrganizationPageType) => {
    setDraft((prev) => ({
      ...prev,
      type,
      step: 2,
      leagueId: type === "CLUB" ? prev.leagueId : null,
    }));
  };

  const validateStep = (step: PageDraft["step"]): boolean => {
    const nameOk = draft.name.trim().length > 0;
    const countryOk = draft.country.trim().length > 0;
    switch (step) {
      case 1:
        return !!draft.type;
      case 2:
        return !!draft.type && nameOk && countryOk;
      case 3:
        return !!draft.type && nameOk && countryOk;
      case 4:
        return !!draft.type && nameOk && countryOk;
      default:
        return false;
    }
  };

  const canReachStep = (step: PageDraft["step"]): boolean => {
    const start: PageDraft["step"] = mode === "edit" ? 2 : 1;
    for (let s = start; s < step; s = (s + 1) as PageDraft["step"]) {
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
      for (let s = prev.step; s < clamped; s = (s + 1) as PageDraft["step"]) {
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
    setNameError(null);
    goToStep(3);
  };

  const updateField = <K extends keyof PageDraft>(key: K, value: PageDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
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
      type: draft.type,
      name: draft.name.trim(),
    };
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

    const socialEntries = Object.entries(draft.socialMedia).filter(
      ([, v]) => typeof v === "string" && v.trim() !== ""
    );
    if (socialEntries.length > 0) {
      body.socialMedia = Object.fromEntries(
        socialEntries.map(([k, v]) => [k, (v as string).trim()])
      );
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(body);
      if (result) {
        try {
          window.localStorage.removeItem(storageKey);
        } catch {
          // ignore
        }
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
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                  {getText("Nombre", "name")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={draft.name}
                  placeholder={getText(
                    "Ej: Club Atlético River Plate",
                    "namePlaceholder"
                  )}
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

                {draft.type === "CLUB" && (
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1 inline-flex items-center gap-1.5">
                      <FaTrophy className="h-3.5 w-3.5 text-amber-500" />
                      {getText("Liga", "league")}
                    </label>
                    <select
                      value={draft.leagueId ?? ""}
                      onChange={(e) =>
                        updateField("leagueId", e.target.value || null)
                      }
                      className="border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      disabled={leaguesLoading}
                    >
                      <option value="">
                        {leaguesLoading
                          ? getText("Cargando ligas...", "loadingLeagues")
                          : getText(
                              "Seleccionar liga (opcional)",
                              "leagueSelectPlaceholder"
                            )}
                      </option>
                      {leagues.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
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
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4">
                <ImageUploadwithCrop
                  fileInputId="page-logo-file"
                  label={getText("Logo", "logo")}
                  buttonLabel={getText("Subir logo", "uploadLogo")}
                  aspect={1}
                  cropShape="round"
                  previewShape="circle"
                  initialImage={draft.logoUrl || undefined}
                  onUpload={(url) => updateField("logoUrl", url)}
                  onRemove={() => updateField("logoUrl", "")}
                />
              </div>

              <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4">
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
                  onUpload={(url) => updateField("bannerUrl", url)}
                  onRemove={() => updateField("bannerUrl", "")}
                />
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
                      onChange={(e) => updateField("website", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
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
                    onChange={(e) => updateField("contactEmail", e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
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
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
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
                  onClick={() => goToStep(4)}
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
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 text-gray-600 hover:text-verde-oscuro disabled:opacity-50 transition-colors"
                >
                  <FaArrowLeft className="h-3 w-3" />
                  {getText("Atrás", "back")}
                </button>
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
