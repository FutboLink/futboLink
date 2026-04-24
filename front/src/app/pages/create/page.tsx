"use client";

import { AnimatePresence, motion } from "framer-motion";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBriefcase,
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
  FaSchool,
  FaShieldAlt,
  FaTiktok,
  FaTrophy,
  FaTwitter,
  FaUsers,
  FaYoutube,
} from "react-icons/fa";
import { toast } from "react-toastify";
import ImageUploadwithCrop from "@/components/Cloudinary/ImageUploadWithCrop";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import useNationalities from "@/components/Forms/FormUser/useNationalitys";
import PageTypeTag from "@/components/OrganizationPages/PageTypeTag";
import TypeCard from "@/components/OrganizationPages/TypeCard";
import WizardStepIndicator from "@/components/OrganizationPages/WizardStepIndicator";
import PhoneNumberInput from "@/components/utils/PhoneNumberInput";
import { useUserContext } from "@/hook/useUserContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import {
  EMPTY_PAGE_DRAFT,
  ORGANIZATION_PAGE_TYPE,
  PAGE_DRAFT_STORAGE_KEY,
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
  },
  {
    type: ORGANIZATION_PAGE_TYPE.ACADEMY,
    titleKey: "typeACADEMY",
    descKey: "typeACADEMYDesc",
    originalTitle: "Academia",
    originalDesc: "Academia de formación.",
    Icon: FaGraduationCap,
  },
  {
    type: ORGANIZATION_PAGE_TYPE.TOURNAMENT_ORGANIZER,
    titleKey: "typeTOURNAMENT_ORGANIZER",
    descKey: "typeTOURNAMENT_ORGANIZERDesc",
    originalTitle: "Organizador de Torneos",
    originalDesc: "Organizador de torneos.",
    Icon: FaTrophy,
  },
  {
    type: ORGANIZATION_PAGE_TYPE.FORMATION_SCHOOL,
    titleKey: "typeFORMATION_SCHOOL",
    descKey: "typeFORMATION_SCHOOLDesc",
    originalTitle: "Escuela de Formación",
    originalDesc: "Escuela de formación.",
    Icon: FaSchool,
  },
  {
    type: ORGANIZATION_PAGE_TYPE.AGENCY,
    titleKey: "typeAGENCY",
    descKey: "typeAGENCYDesc",
    originalTitle: "Agencia",
    originalDesc: "Agencia de representación.",
    Icon: FaBriefcase,
  },
  {
    type: ORGANIZATION_PAGE_TYPE.LEAGUE,
    titleKey: "typeLEAGUE",
    descKey: "typeLEAGUEDesc",
    originalTitle: "Liga",
    originalDesc: "Liga deportiva.",
    Icon: FaFutbol,
    adminOnly: true,
  },
  {
    type: ORGANIZATION_PAGE_TYPE.FEDERATION,
    titleKey: "typeFEDERATION",
    descKey: "typeFEDERATIONDesc",
    originalTitle: "Federación",
    originalDesc: "Federación deportiva.",
    Icon: FaCrown,
    adminOnly: true,
  },
  {
    type: ORGANIZATION_PAGE_TYPE.NATIONAL_TEAM,
    titleKey: "typeNATIONAL_TEAM",
    descKey: "typeNATIONAL_TEAMDesc",
    originalTitle: "Selección Nacional",
    originalDesc: "Selección nacional.",
    Icon: FaFlag,
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
  { key: "twitter", labelKey: "twitter", originalLabel: "Twitter", Icon: FaTwitter, placeholder: "https://x.com/..." },
  { key: "youtube", labelKey: "youtube", originalLabel: "YouTube", Icon: FaYoutube, placeholder: "https://youtube.com/@..." },
  { key: "facebook", labelKey: "facebook", originalLabel: "Facebook", Icon: FaFacebookF, placeholder: "https://facebook.com/..." },
  { key: "tiktok", labelKey: "tiktok", originalLabel: "TikTok", Icon: FaTiktok, placeholder: "https://tiktok.com/@..." },
];

function CreatePage() {
  const router = useRouter();
  const { isLogged, role, token } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tOrg = useNextIntlTranslations("organizationPages");
  const { nationalities, loading: nationalitiesLoading } = useNationalities();

  const getText = (original: string, key: string) =>
    isNextIntlEnabled ? tOrg.t(key) : original;

  const [draft, setDraft] = useState<PageDraft>(EMPTY_PAGE_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<OrganizationPage[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(false);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryRef = useRef<HTMLDivElement | null>(null);

  const [puesto, setPuesto] = useState<string | null>(null);
  const [guardChecked, setGuardChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PAGE_DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PageDraft;
        setDraft({ ...EMPTY_PAGE_DRAFT, ...parsed });
      }
    } catch (err) {
      console.error("Error hydrating draft:", err);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const handler = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          PAGE_DRAFT_STORAGE_KEY,
          JSON.stringify(draft)
        );
      } catch (err) {
        console.error("Error saving draft:", err);
      }
    }, 500);
    return () => window.clearTimeout(handler);
  }, [draft, hydrated]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPuesto = async () => {
      if (!isLogged) {
        setGuardChecked(true);
        return;
      }
      if (role !== "PLAYER") {
        setGuardChecked(true);
        return;
      }
      if (!API_URL) {
        setGuardChecked(true);
        return;
      }
      try {
        const stored = window.localStorage.getItem("user");
        if (!stored) {
          setGuardChecked(true);
          return;
        }
        const parsed = JSON.parse(stored);
        if (!parsed?.id) {
          setGuardChecked(true);
          return;
        }
        const res = await fetch(`${API_URL}/user/${parsed.id}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setPuesto(typeof data?.puesto === "string" ? data.puesto : null);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error fetching puesto:", err);
        }
      } finally {
        setGuardChecked(true);
      }
    };
    fetchPuesto();
    return () => controller.abort();
  }, [isLogged, role]);

  useEffect(() => {
    if (!guardChecked) return;
    if (!isLogged) {
      toast.error(getText("Tenés que iniciar sesión para crear una página.", "mustLogin"));
      router.push("/Login");
      return;
    }
    if (role === "PLAYER" && puesto === "Jugador") {
      toast.error(getText("Los futbolistas no pueden crear páginas. Iniciá sesión con otro rol.", "futbolistaNoAllowed"));
      router.push("/profile");
    }
  }, [guardChecked, isLogged, role, puesto, router]);

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

  const goToStep = (step: PageDraft["step"]) => {
    setDraft((prev) => ({ ...prev, step }));
  };

  const handleNextFromInfo = () => {
    if (!draft.name.trim()) {
      setNameError(getText("El nombre es obligatorio", "nameRequired"));
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

  const publish = async () => {
    if (!token || !API_URL) {
      toast.error(getText("No se pudo crear la página", "createError"));
      return;
    }
    if (!draft.name.trim() || !draft.type) {
      setNameError(getText("El nombre es obligatorio", "nameRequired"));
      setDraft((prev) => ({ ...prev, step: 2 }));
      return;
    }

    const body: Record<string, unknown> = {
      type: draft.type,
      name: draft.name.trim(),
    };
    if (draft.country.trim()) body.country = draft.country.trim();
    if (draft.region.trim()) body.region = draft.region.trim();
    if (draft.foundationYear.trim()) body.foundationYear = draft.foundationYear.trim();
    if (draft.description.trim()) body.description = draft.description.trim();
    if (draft.logoUrl.trim()) body.logoUrl = draft.logoUrl.trim();
    if (draft.bannerUrl.trim()) body.bannerUrl = draft.bannerUrl.trim();
    if (draft.website.trim()) body.website = draft.website.trim();
    if (draft.contactEmail.trim()) body.contactEmail = draft.contactEmail.trim();
    if (draft.phone.trim()) body.phone = draft.phone.trim();
    if (draft.type === "CLUB" && draft.leagueId) body.leagueId = draft.leagueId;

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
      const res = await fetch(`${API_URL}/organization-pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const msg =
          (Array.isArray(err?.message) ? err.message.join(", ") : err?.message) ||
          getText("No se pudo crear la página", "createError");
        toast.error(msg);
        setIsSubmitting(false);
        return;
      }
      const created = (await res.json()) as OrganizationPage;
      window.localStorage.removeItem(PAGE_DRAFT_STORAGE_KEY);
      toast.success(getText("Página creada con éxito", "createSuccess"));
      router.push(`/pages/${created.slug}`);
    } catch (err) {
      console.error("Error publishing page:", err);
      toast.error(getText("No se pudo crear la página", "createError"));
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
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-verde-oscuro">
            {getText("Crear Página", "createTitle")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{stepTitles[draft.step]}</p>
        </header>

        <WizardStepIndicator currentStep={draft.step} labels={stepLabels} />

        <AnimatePresence mode="wait">
          <motion.section
            key={draft.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-8 mt-4"
          >
            {draft.step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTypes.map((opt) => (
                  <TypeCard
                    key={opt.type}
                    type={opt.type}
                    title={getText(opt.originalTitle, opt.titleKey)}
                    description={getText(opt.originalDesc, opt.descKey)}
                    Icon={opt.Icon}
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
                      {getText("País", "country")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaGlobeAmericas className="h-4 w-4 text-gray-400" />
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
                          {filteredCountries.slice(0, 80).map((n) => (
                            <li
                              key={n.value}
                              className="p-3 cursor-pointer text-gray-700 hover:bg-emerald-50 text-sm"
                              onClick={() => {
                                updateField("country", n.label);
                                setCountrySearch(n.label);
                                setCountryOpen(false);
                              }}
                            >
                              {n.label}
                            </li>
                          ))}
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
                      type="text"
                      value={draft.foundationYear}
                      placeholder={getText("Ej: 1901", "foundationYearPlaceholder")}
                      onChange={(e) => updateField("foundationYear", e.target.value)}
                      className="border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {draft.type === "CLUB" && (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-1">
                        {getText("Liga", "league")}
                      </label>
                      <select
                        value={draft.leagueId ?? ""}
                        onChange={(e) =>
                          updateField("leagueId", e.target.value || null)
                        }
                        className="border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-verde-oscuro transition-colors"
                  >
                    <FaArrowLeft className="h-3 w-3" />
                    {getText("Atrás", "back")}
                  </button>
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
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    {getText("Logo", "logo")}
                  </label>
                  <ImageUploadwithCrop
                    initialImage={draft.logoUrl}
                    onUpload={(url) => updateField("logoUrl", url)}
                    onRemove={() => updateField("logoUrl", "")}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">
                    {getText("Banner", "banner")}{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      ({getText("Opcional", "optional")})
                    </span>
                  </label>
                  <input
                    type="url"
                    value={draft.bannerUrl}
                    placeholder={getText(
                      "URL del banner (opcional)",
                      "bannerUrlPlaceholder"
                    )}
                    onChange={(e) => updateField("bannerUrl", e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  <div className="relative">
                    <PhoneNumberInput
                      mode="edit"
                      name="phone"
                      label=""
                      value={draft.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FaPhone className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
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

                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <div
                    className="h-40 sm:h-56 bg-gradient-to-br from-emerald-100 to-emerald-200 relative"
                    style={
                      draft.bannerUrl
                        ? {
                            backgroundImage: `url(${draft.bannerUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />
                  <div className="px-5 sm:px-8 pb-6 -mt-10 sm:-mt-12">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                        {draft.logoUrl ? (
                          <NextImage
                            src={draft.logoUrl}
                            alt={draft.name}
                            width={112}
                            height={112}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <FaUsers className="h-10 w-10 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-verde-oscuro truncate">
                          {draft.name || "—"}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
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
                      <p className="mt-5 text-sm text-gray-700 whitespace-pre-line">
                        {draft.description}
                      </p>
                    )}

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                      {draft.website && (
                        <div className="flex items-center gap-2">
                          <FaGlobe className="h-4 w-4 text-gray-400" />
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
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">@</span>
                          <a
                            href={`mailto:${draft.contactEmail}`}
                            className="text-emerald-700 hover:underline truncate"
                          >
                            {draft.contactEmail}
                          </a>
                        </div>
                      )}
                      {draft.phone && (
                        <div className="flex items-center gap-2">
                          <FaPhone className="h-4 w-4 text-gray-400" />
                          <span>{draft.phone}</span>
                        </div>
                      )}
                      {selectedLeague && (
                        <div className="flex items-center gap-2">
                          <FaTrophy className="h-4 w-4 text-gray-400" />
                          <span>
                            {getText("Compite en", "competesIn")}:{" "}
                            <span className="font-semibold">{selectedLeague.name}</span>
                          </span>
                        </div>
                      )}
                    </div>
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
                    onClick={publish}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-verde-oscuro hover:bg-verde-mas-claro disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    {isSubmitting
                      ? getText("Publicando...", "publishing")
                      : getText("Publicar", "publish")}
                  </button>
                </div>
              </div>
            )}
          </motion.section>
        </AnimatePresence>

        <div className="text-center mt-6">
          <Link
            href="/profile"
            className="text-xs text-gray-500 hover:text-verde-oscuro"
          >
            ← {getText("Volver al inicio", "backToHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}

export default CreatePage;
