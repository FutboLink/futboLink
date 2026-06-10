"use client";

import NextImage from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaCrown,
  FaEdit,
  FaEnvelope,
  FaFutbol,
  FaGlobe,
  FaPhone,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";
import ConfirmActionModal from "@/components/OrganizationPages/ConfirmActionModal";
import MediaCarousel from "@/components/Multimedia/MediaCarousel";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import PageTypeTag from "@/components/OrganizationPages/PageTypeTag";
import SocialMediaIcons from "@/components/OrganizationPages/SocialMediaIcons";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";
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
  const { user, token, role } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tOrg = useNextIntlTranslations("organizationPages");

  const getText = (original: string, key: string) =>
    isNextIntlEnabled ? tOrg.t(key) : original;

  const [page, setPage] = useState<OrganizationPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmingRepublish, setConfirmingRepublish] = useState(false);
  const [republishing, setRepublishing] = useState(false);

  useEffect(() => {
    if (!slug || !API_URL) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    const controller = new AbortController();
    const fetchPage = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/organization-pages/slug/${slug}`, {
          signal: controller.signal,
          headers,
        });
        if (!res.ok) {
          setNotFound(true);
          setPage(null);
          return;
        }
        const data = (await res.json()) as OrganizationPage;
        setPage(data);
        setNotFound(false);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error fetching page:", err);
          setNotFound(true);
          setPage(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
    return () => controller.abort();
  }, [slug, token]);

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
  const isAdmin = role === "ADMIN";
  const typeMeta = TYPE_LABELS[page.type] ?? {
    original: page.type,
    key: `type${page.type}`,
  };

  const ownerBanner = isOwner && page.status !== "APPROVED" ? (
    <div
      className={`mb-4 rounded-xl border px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center gap-3 ${
        page.status === "PENDING_REVIEW"
          ? "bg-amber-50 border-amber-200 text-amber-800"
          : page.status === "REJECTED"
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-gray-50 border-gray-200 text-gray-700"
      }`}
    >
      <div className="flex-1 flex items-start gap-3">
        <span className="font-semibold uppercase tracking-wide text-xs shrink-0 mt-0.5">
          {page.status === "PENDING_REVIEW"
            ? getText("En revisión", "statusInReview")
            : page.status === "REJECTED"
            ? getText("Rechazada", "statusRejected")
            : getText("Desactivada", "statusDeactivated")}
        </span>
        <div className="flex flex-col gap-1.5 min-w-0">
          <span>
            {page.status === "PENDING_REVIEW"
              ? getText(
                  "Detectamos coincidencias con otra página, así que esta queda esperando aprobación del admin. Solo vos podés verla por ahora.",
                  "ownerBannerPending",
                )
              : page.status === "REJECTED"
              ? getText(
                  "Esta página fue rechazada por el admin. Editala con datos correctos y volvé a publicarla.",
                  "ownerBannerRejected",
                )
              : getText(
                  "Esta página fue desactivada por el admin.",
                  "ownerBannerDeactivated",
                )}
          </span>
          {page.status === "REJECTED" && page.rejectionReason && (
            <span className="bg-white/70 rounded-md px-2 py-1.5 text-xs">
              <strong className="font-semibold">
                {getText("Motivo:", "rejectionReasonLabelInline")}
              </strong>{" "}
              {page.rejectionReason}
            </span>
          )}
        </div>
      </div>
      {page.status === "REJECTED" && (
        <button
          type="button"
          onClick={() => setConfirmingRepublish(true)}
          className="shrink-0 self-stretch sm:self-center inline-flex items-center justify-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap"
        >
          {getText("Volver a publicar", "republishAction")}
        </button>
      )}
    </div>
  ) : null;

  const confirmRepublish = async () => {
    if (!page || !token || !API_URL) return;
    setRepublishing(true);
    try {
      const res = await fetch(
        `${API_URL}/organization-pages/${page.id}/republish`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) return;
      const updated = (await res.json()) as OrganizationPage;
      setPage(updated);
      setConfirmingRepublish(false);
    } catch {
      // ignore
    } finally {
      setRepublishing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-12">
      <article className="max-w-5xl mx-auto px-4">
        {ownerBanner}
        <div className="relative rounded-2xl shadow-sm bg-white">
          <div className="relative">
            <div
              className="h-40 sm:h-60 lg:h-72 rounded-t-2xl overflow-hidden bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300 relative"
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
              {(isOwner || isAdmin) && (
                <Link
                  href={`/pages/${page.slug}/edit`}
                  className="absolute top-4 right-4 inline-flex items-center gap-2 bg-white/90 hover:bg-white text-verde-oscuro font-semibold px-3 py-1.5 rounded-lg shadow-sm text-sm transition-colors"
                >
                  <FaEdit className="h-3 w-3" />
                  {getText("Editar página", "editPage")}
                </Link>
              )}
            </div>
            <div className="absolute left-5 sm:left-8 bottom-0 translate-y-1/2 h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white shadow-md overflow-hidden flex items-center justify-center">
              {page.logoUrl ? (
                <NextImage
                  src={page.logoUrl}
                  alt={page.name}
                  width={128}
                  height={128}
                  className="object-contain w-full h-full"
                />
              ) : (
                <FaUsers className="h-12 w-12 text-gray-300" />
              )}
            </div>
          </div>

          <div className="px-5 sm:px-8 pb-8 pt-20">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-verde-oscuro inline-flex items-center gap-2">
                {page.name}
                {page.status === "APPROVED" && (
                  <FaCheckCircle
                    className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500"
                    aria-label={getText("Verificado", "verified")}
                  />
                )}
              </h1>
              {/* Badge de administración del perfil:
                  - Dueño que NO es admin -> "Perfil Administrado" (verde).
                  - Dueño admin -> "No administrado" (gris neutro).
                  - Sin dueño -> no se muestra nada. */}
              {page.ownerId && page.owner?.role && (
                <div className="mt-1">
                  {page.owner.role !== "ADMIN" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium">
                      {getText("Perfil Administrado", "managedProfile")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium">
                      {getText("No administrado", "notManagedProfile")}
                    </span>
                  )}
                </div>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <PageTypeTag
                  type={page.type}
                  label={getText(typeMeta.original, typeMeta.key)}
                  size="sm"
                />
                {page.country && (
                  <span className="text-sm text-gray-600 inline-flex items-center gap-1">
                    <span className="inline-flex items-center">
                      {renderCountryFlag(page.country)}
                    </span>
                    {page.country}
                    {page.region ? `, ${page.region}` : ""}
                  </span>
                )}
                {page.foundationYear && (
                  <span className="text-sm text-gray-500">
                    {getText("Fundado en", "founded")} {page.foundationYear}
                  </span>
                )}
                {page.type === "LEAGUE" && page.division && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                    <FaFutbol className="h-3 w-3 text-sky-500" />
                    {page.division}
                  </span>
                )}
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

            {page.type === "CLUB" && page.leagueId && page.league && (
              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
                {page.league.logoUrl ? (
                  <NextImage
                    src={page.league.logoUrl}
                    alt={page.league.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-contain bg-gray-50 p-1"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center">
                    <FaTrophy className="h-5 w-5 text-emerald-600" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {getText("Compite en", "competesIn")}
                  </span>
                  <Link
                    href={`/pages/${page.league.slug}`}
                    className="font-semibold text-verde-oscuro hover:underline"
                  >
                    {page.league.name}
                  </Link>
                  {page.league.division && (
                    <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                      <FaFutbol className="h-2.5 w-2.5 text-sky-500" />
                      {page.league.division}
                    </span>
                  )}
                </div>
              </div>
            )}

            {page.type === "LEAGUE" && page.federationId && page.federation && (
              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
                {page.federation.logoUrl ? (
                  <NextImage
                    src={page.federation.logoUrl}
                    alt={page.federation.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-contain bg-gray-50 p-1"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center">
                    <FaCrown className="h-5 w-5 text-violet-600" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {getText("Federación", "federation")}
                  </span>
                  <Link
                    href={`/pages/${page.federation.slug}`}
                    className="font-semibold text-verde-oscuro hover:underline"
                  >
                    {page.federation.name}
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {getText("Redes sociales", "socialMedia")}
              </h2>
              {page.socialMedia &&
              Object.values(page.socialMedia).some((v) => v?.trim()) ? (
                <SocialMediaIcons socialMedia={page.socialMedia} />
              ) : (
                <p className="text-sm text-gray-400">
                  {getText("Aún no hay nada cargado", "noContentLoaded")}
                </p>
              )}
            </div>

            {page.type === "AGENCY" && (
              <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-purple-500 text-white px-4 py-2 rounded-t-xl font-semibold">
                  {getText("Portafolio", "portfolioTitle")}
                </div>
                {(page.owner?.portfolioPlayers?.length ?? 0) > 0 ? (
                  <div className="bg-white p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {page.owner!.portfolioPlayers!.map((player) => (
                        <Link
                          key={player.id}
                          href={`/user-viewer/${player.id}`}
                          className="bg-gray-50 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 shrink-0">
                              <NextImage
                                src={player.imgUrl || "/default-player.png"}
                                alt={`${player.name ?? ""} ${player.lastname ?? ""}`.trim()}
                                width={56}
                                height={56}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base text-gray-800 truncate">
                                {`${player.name ?? ""} ${player.lastname ?? ""}`.trim() ||
                                  getText("Jugador", "player")}
                              </h3>
                              <p className="text-sm text-gray-600 truncate">
                                {player.primaryPosition ||
                                  getText("Sin posición", "noPosition")}
                                {player.age ? ` • ${player.age} ${getText("años", "years")}` : ""}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white flex flex-col items-center justify-center gap-2 py-8 px-4 text-gray-400">
                    <FaUsers className="h-10 w-10" />
                    <p className="text-sm">
                      {getText(
                        "Sin jugadores representados",
                        "noPlayersRepresented",
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {(page.photoUrls ?? []).some((p) => p?.trim()) && (
              <div className="mt-6">
                <MediaCarousel
                  videos={[]}
                  photos={page.photoUrls ?? []}
                  title={getText("Multimedia", "multimedia")}
                />
              </div>
            )}
          </div>
        </div>
      </article>

      <ConfirmActionModal
        open={confirmingRepublish}
        title={getText("Volver a publicar", "republishConfirmTitle")}
        description={getText(
          "Asegurate de haber modificado los datos para que no sea un duplicado de otra página existente. Si el sistema vuelve a detectar coincidencias, va a quedar esperando aprobación del admin.",
          "republishConfirmDescription",
        )}
        confirmLabel={getText("Volver a publicar", "republishAction")}
        cancelLabel={getText("Cancelar", "cancel")}
        tone="primary"
        busy={republishing}
        onConfirm={() => confirmRepublish()}
        onCancel={() => setConfirmingRepublish(false)}
      />
    </main>
  );
}

export default OrganizationPagePublic;
