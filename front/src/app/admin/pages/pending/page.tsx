"use client";

import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaShieldAlt,
  FaTimesCircle,
  FaUsers,
} from "react-icons/fa";
import { toast } from "react-toastify";
import ConfirmActionModal from "@/components/OrganizationPages/ConfirmActionModal";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import PageTypeTag from "@/components/OrganizationPages/PageTypeTag";
import { useUserContext } from "@/hook/useUserContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import type { OrganizationPage } from "@/types/organizationPage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TYPE_META: Record<string, { original: string; key: string }> = {
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

function AdminPendingPages() {
  const router = useRouter();
  const { isLogged, role, token } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tOrg = useNextIntlTranslations("organizationPages");

  const getText = (original: string, key: string) =>
    isNextIntlEnabled ? tOrg.t(key) : original;

  const [pages, setPages] = useState<OrganizationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingPage, setRejectingPage] = useState<OrganizationPage | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLogged) {
      if (window.localStorage.getItem("user")) return; // hidratando, esperar
      router.push("/Login");
      return;
    }
    if (role && role !== "ADMIN") {
      toast.error(
        getText("Solo un admin puede ver esta página.", "adminOnly"),
      );
      router.push("/");
    }
  }, [isLogged, role, router]);

  const load = useCallback(async () => {
    if (!token || !API_URL) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/organization-pages/admin/pending?page=${currentPage}&limit=${pageSize}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) {
        toast.error(
          getText("No se pudo cargar la lista", "loadDataError"),
        );
        setPages([]);
        setTotal(0);
        return;
      }
      const data = await res.json();
      setPages(data?.data ?? []);
      setTotal(data?.total ?? 0);
    } catch (err) {
      console.error("Error loading pending pages:", err);
      setPages([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (role === "ADMIN" && token) load();
  }, [role, token, load]);

  const approve = async (id: string) => {
    if (!token || !API_URL) return;
    setBusyId(id);
    try {
      const res = await fetch(
        `${API_URL}/organization-pages/${id}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        toast.error(getText("No se pudo aprobar", "approveError"));
        return;
      }
      toast.success(getText("Página aprobada", "approveSuccess"));
      setPages((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      console.error("approve error", err);
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = async (reason?: string) => {
    if (!rejectingPage || !token || !API_URL) return;
    const id = rejectingPage.id;
    setBusyId(id);
    try {
      const res = await fetch(
        `${API_URL}/organization-pages/${id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reason ? { reason } : {}),
        },
      );
      if (!res.ok) {
        toast.error(getText("No se pudo rechazar", "rejectError"));
        return;
      }
      toast.success(getText("Página rechazada", "rejectSuccess"));
      setPages((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      setRejectingPage(null);
    } catch (err) {
      console.error("reject error", err);
    } finally {
      setBusyId(null);
    }
  };

  if (!isLogged || role !== "ADMIN") return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-verde-oscuro inline-flex items-center gap-2">
            <FaShieldAlt className="h-5 w-5 text-amber-500" />
            {getText("Páginas pendientes", "adminPendingTitle")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {getText(
              "Aprobá o rechazá las páginas marcadas como posibles duplicados.",
              "adminPendingSubtitle",
            )}
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500" />
          </div>
        ) : pages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center gap-3">
            <FaCheckCircle className="h-10 w-10 text-emerald-500" />
            <p className="text-gray-700 font-semibold">
              {getText(
                "No hay páginas pendientes de revisión",
                "adminPendingEmpty",
              )}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {pages.map((page) => {
              const typeMeta = TYPE_META[page.type] ?? {
                original: page.type,
                key: `type${page.type}`,
              };
              return (
                <li
                  key={page.id}
                  className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden flex flex-col md:flex-row"
                >
                  <div
                    className="md:w-48 h-32 md:h-auto bg-gradient-to-br from-amber-100 to-amber-200 relative shrink-0"
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
                    <div className="absolute left-4 bottom-4 h-12 w-12 rounded-lg bg-white shadow-md overflow-hidden flex items-center justify-center">
                      {page.logoUrl ? (
                        <NextImage
                          src={page.logoUrl}
                          alt={page.name}
                          width={48}
                          height={48}
                          className="object-contain w-full h-full p-0.5"
                        />
                      ) : (
                        <FaUsers className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 p-5 flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-verde-oscuro text-lg">
                          {page.name}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <PageTypeTag
                            type={page.type}
                            label={getText(typeMeta.original, typeMeta.key)}
                            size="sm"
                          />
                          {page.country && (
                            <span className="text-xs text-gray-500">
                              {page.country}
                              {page.region ? ` · ${page.region}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/pages/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-verde-oscuro hover:underline inline-flex items-center gap-1"
                      >
                        <FaExternalLinkAlt className="h-3 w-3" />
                        {getText("Ver página", "viewPage")}
                      </Link>
                    </div>
                    {page.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {page.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-2 mt-auto">
                      <button
                        type="button"
                        disabled={busyId === page.id}
                        onClick={() => approve(page.id)}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <FaCheckCircle className="h-4 w-4" />
                        {getText("Aprobar", "approveAction")}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === page.id}
                        onClick={() => setRejectingPage(page)}
                        className="inline-flex items-center gap-2 bg-white border border-red-300 hover:bg-red-50 text-red-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <FaTimesCircle className="h-4 w-4" />
                        {getText("Rechazar", "rejectAction")}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && total > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1.5 border border-gray-200 hover:border-verde-oscuro hover:text-verde-oscuro text-gray-600 text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaChevronLeft className="h-3 w-3" />
                {getText("Anterior", "previousPage")}
              </button>
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-1.5 border border-gray-200 hover:border-verde-oscuro hover:text-verde-oscuro text-gray-600 text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {getText("Siguiente", "nextPage")}
                <FaChevronRight className="h-3 w-3" />
              </button>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
              {getText("Mostrar", "showPerPage")}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white text-gray-700"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      <ConfirmActionModal
        open={!!rejectingPage}
        title={getText("Rechazar página", "rejectModalTitle")}
        description={
          rejectingPage
            ? getText(
                `Vas a rechazar "${rejectingPage.name}". El dueño verá la página marcada como rechazada.`,
                "rejectModalDescription",
              )
            : ""
        }
        confirmLabel={getText("Rechazar", "rejectAction")}
        cancelLabel={getText("Cancelar", "cancel")}
        tone="danger"
        withReason
        reasonLabel={getText("Motivo (opcional)", "rejectReasonLabel")}
        reasonPlaceholder={getText(
          "Ej: ya existe una página oficial...",
          "rejectReasonPlaceholder",
        )}
        busy={!!busyId}
        onConfirm={(reason) => confirmReject(reason)}
        onCancel={() => setRejectingPage(null)}
      />
    </main>
  );
}

export default AdminPendingPages;
