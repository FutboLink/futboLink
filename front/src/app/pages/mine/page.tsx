"use client";

import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CountryFlag from "react-country-flag";
import {
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaGlobeAmericas,
  FaPlusCircle,
  FaUsers,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import { CountryToCode } from "@/components/countryFlag/countryFlag";
import PageTypeTag from "@/components/OrganizationPages/PageTypeTag";
import { useUserContext } from "@/hook/useUserContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import type {
  OrganizationPage,
  OrganizationPageStatus,
  OrganizationPageType,
} from "@/types/organizationPage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TYPE_META: Record<OrganizationPageType, { original: string; key: string }> = {
  CLUB: { original: "Club", key: "typeCLUB" },
  ACADEMY: { original: "Academia", key: "typeACADEMY" },
  TOURNAMENT_ORGANIZER: {
    original: "Organizador de Torneos",
    key: "typeTOURNAMENT_ORGANIZER",
  },
  FORMATION_SCHOOL: {
    original: "Escuela de Formación",
    key: "typeFORMATION_SCHOOL",
  },
  AGENCY: { original: "Agencia", key: "typeAGENCY" },
  LEAGUE: { original: "Liga", key: "typeLEAGUE" },
  FEDERATION: { original: "Federación", key: "typeFEDERATION" },
  NATIONAL_TEAM: { original: "Selección Nacional", key: "typeNATIONAL_TEAM" },
};

const normalizeCountryKey = (raw: string): string =>
  raw.replace(/\s+y\s+/gi, "Y").replace(/[\s-]+/g, "");

const getCountryCode = (name?: string | null): string | null => {
  if (!name) return null;
  const direct = CountryToCode[name];
  if (direct) return direct;
  const normalized = CountryToCode[normalizeCountryKey(name)];
  return normalized ?? null;
};

const statusStyle = (status: OrganizationPageStatus): string => {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "DRAFT":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "DEACTIVATED":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

function MyPagesPage() {
  const router = useRouter();
  const { isLogged, token } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tOrg = useNextIntlTranslations("organizationPages");

  const getText = (original: string, key: string) =>
    isNextIntlEnabled ? tOrg.t(key) : original;

  const [pages, setPages] = useState<OrganizationPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLogged) {
      toast.error(
        getText("Tenés que iniciar sesión para ver tus páginas.", "mustLogin")
      );
      router.push("/Login");
    }
  }, [isLogged, router]);

  useEffect(() => {
    if (!isLogged || !token || !API_URL) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/organization-pages/mine`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          const list: OrganizationPage[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
            ? data.items
            : [];
          setPages(list);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error loading my pages:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [isLogged, token]);

  const statusLabel = (status: OrganizationPageStatus): string => {
    if (status === "APPROVED")
      return getText("Publicada", "statusPublished");
    if (status === "DRAFT") return getText("Borrador", "statusDraft");
    return getText("Desactivada", "statusDeactivated");
  };

  if (!isLogged) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-verde-oscuro">
              {getText("Mis páginas", "myPagesTitle")}
            </h1>
          </div>
          <Link
            href="/pages/create"
            className="inline-flex items-center gap-2 bg-verde-oscuro hover:bg-verde-mas-claro text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            <FaPlusCircle className="h-4 w-4" />
            {getText("Crear Página", "createTitle")}
          </Link>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-verde-oscuro" />
          </div>
        ) : pages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center gap-4">
            <FaUsers className="h-12 w-12 text-gray-300" />
            <p className="text-gray-600">
              {getText(
                "Todavía no creaste ninguna página",
                "myPagesEmpty"
              )}
            </p>
            <Link
              href="/pages/create"
              className="inline-flex items-center gap-2 bg-verde-oscuro hover:bg-verde-mas-claro text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <FaPlusCircle className="h-4 w-4" />
              {getText("Crear tu primera página", "createFirstPage")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pages.map((page) => {
              const typeMeta = TYPE_META[page.type] ?? {
                original: page.type,
                key: `type${page.type}`,
              };
              const countryCode = getCountryCode(page.country);
              return (
                <article
                  key={page.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                >
                  <div className="relative">
                    <div
                      className="h-28 bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300"
                      style={
                        page.bannerUrl
                          ? {
                              backgroundImage: `url(${page.bannerUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    />
                    <div className="absolute left-4 -bottom-6 h-14 w-14 rounded-xl bg-white border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
                      {page.logoUrl ? (
                        <NextImage
                          src={page.logoUrl}
                          alt={page.name}
                          width={56}
                          height={56}
                          className="object-contain w-full h-full p-1"
                        />
                      ) : (
                        <FaUsers className="h-6 w-6 text-gray-300" />
                      )}
                    </div>
                    <span
                      className={`absolute top-3 right-3 inline-flex items-center rounded-full border text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 ${statusStyle(
                        page.status
                      )}`}
                    >
                      {statusLabel(page.status)}
                    </span>
                  </div>

                  <div className="px-4 pt-8 pb-4 flex-1 flex flex-col">
                    <h2 className="text-base font-bold text-verde-oscuro inline-flex items-center gap-1.5 break-words">
                      {page.name}
                      {page.status === "APPROVED" && (
                        <FaCheckCircle
                          className="h-4 w-4 text-emerald-500 shrink-0"
                          aria-label={getText("Verificado", "verified")}
                        />
                      )}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <PageTypeTag
                        type={page.type}
                        label={getText(typeMeta.original, typeMeta.key)}
                        size="sm"
                      />
                      {page.country && (
                        <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                          {countryCode ? (
                            <CountryFlag
                              countryCode={countryCode}
                              svg
                              style={{ width: "14px", height: "10px" }}
                              title={page.country}
                            />
                          ) : (
                            <FaGlobeAmericas className="h-3 w-3 text-gray-400" />
                          )}
                          {page.country}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-4 flex items-center gap-2">
                      <Link
                        href={`/pages/${page.slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 border border-gray-300 hover:border-verde-oscuro hover:text-verde-oscuro text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                      >
                        <FaEye className="h-3.5 w-3.5" />
                        {getText("Ver", "viewPage")}
                      </Link>
                      <Link
                        href={`/pages/${page.slug}/edit`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-verde-oscuro hover:bg-verde-mas-claro text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                      >
                        <FaEdit className="h-3.5 w-3.5" />
                        {getText("Editar página", "editPage")}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyPagesPage;
