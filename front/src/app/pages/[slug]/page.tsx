"use client";

import NextImage from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaEdit,
  FaEnvelope,
  FaGlobe,
  FaGlobeAmericas,
  FaPhone,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import PageTypeTag from "@/components/OrganizationPages/PageTypeTag";
import SocialMediaIcons from "@/components/OrganizationPages/SocialMediaIcons";
import { useUserContext } from "@/hook/useUserContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import type { OrganizationPage } from "@/types/organizationPage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TYPE_LABELS: Record<string, { original: string; key: string }> = {
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

function OrganizationPagePublic() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug as string);
  const { user } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tOrg = useNextIntlTranslations("organizationPages");

  const getText = (original: string, key: string) =>
    isNextIntlEnabled ? tOrg.t(key) : original;

  const [page, setPage] = useState<OrganizationPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug || !API_URL) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    const controller = new AbortController();
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/organization-pages/slug/${slug}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = (await res.json()) as OrganizationPage;
        setPage(data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error fetching page:", err);
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-verde-oscuro" />
      </main>
    );
  }

  if (notFound || !page) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {getText("Página no encontrada", "notFound")}
        </h1>
        <Link
          href="/"
          className="mt-6 inline-block bg-verde-oscuro hover:bg-verde-mas-claro text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {getText("Volver al inicio", "backToHome")}
        </Link>
      </main>
    );
  }

  const isOwner = user?.id && page.ownerId && user.id === page.ownerId;
  const typeMeta = TYPE_LABELS[page.type] ?? {
    original: page.type,
    key: `type${page.type}`,
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-12">
      <article className="max-w-5xl mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden shadow-sm bg-white">
          <div
            className="h-40 sm:h-60 lg:h-72 bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300 relative"
            style={
              page.bannerUrl
                ? {
                    backgroundImage: `url(${page.bannerUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {isOwner && (
              <Link
                href={`/pages/${page.slug}/edit`}
                className="absolute top-4 right-4 inline-flex items-center gap-2 bg-white/90 hover:bg-white text-verde-oscuro font-semibold px-3 py-1.5 rounded-lg shadow-sm text-sm transition-colors"
              >
                <FaEdit className="h-3 w-3" />
                {getText("Editar página", "editPage")}
              </Link>
            )}
          </div>

          <div className="px-5 sm:px-8 pb-8 -mt-12 sm:-mt-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
                {page.logoUrl ? (
                  <NextImage
                    src={page.logoUrl}
                    alt={page.name}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <FaUsers className="h-12 w-12 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-verde-oscuro">
                  {page.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <PageTypeTag
                    type={page.type}
                    label={getText(typeMeta.original, typeMeta.key)}
                    size="sm"
                  />
                  {page.country && (
                    <span className="text-sm text-gray-600 inline-flex items-center gap-1">
                      <FaGlobeAmericas className="h-3.5 w-3.5 text-gray-400" />
                      {page.country}
                      {page.region ? `, ${page.region}` : ""}
                    </span>
                  )}
                  {page.foundationYear && (
                    <span className="text-sm text-gray-500">
                      {getText("Fundado en", "founded")} {page.foundationYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {page.description && (
              <p className="mt-6 text-gray-700 whitespace-pre-line leading-relaxed">
                {page.description}
              </p>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {page.website && (
                <div className="flex items-center gap-2 text-gray-700">
                  <FaGlobe className="h-4 w-4 text-gray-400" />
                  <a
                    href={page.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:underline truncate"
                  >
                    {page.website}
                  </a>
                </div>
              )}
              {page.contactEmail && (
                <div className="flex items-center gap-2 text-gray-700">
                  <FaEnvelope className="h-4 w-4 text-gray-400" />
                  <a
                    href={`mailto:${page.contactEmail}`}
                    className="text-emerald-700 hover:underline truncate"
                  >
                    {page.contactEmail}
                  </a>
                </div>
              )}
              {page.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <FaPhone className="h-4 w-4 text-gray-400" />
                  <span>{page.phone}</span>
                </div>
              )}
            </div>

            {page.socialMedia && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  {getText("Redes sociales", "socialMedia")}
                </h2>
                <SocialMediaIcons socialMedia={page.socialMedia} />
              </div>
            )}

            {page.type === "CLUB" && page.league && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-3">
                <FaTrophy className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-gray-700">
                  {getText("Compite en", "competesIn")}:{" "}
                </span>
                <Link
                  href={`/pages/${page.league.slug}`}
                  className="inline-flex items-center gap-2 font-semibold text-verde-oscuro hover:underline"
                >
                  {page.league.logoUrl && (
                    <NextImage
                      src={page.league.logoUrl}
                      alt={page.league.name}
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                    />
                  )}
                  {page.league.name}
                </Link>
              </div>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}

export default OrganizationPagePublic;
