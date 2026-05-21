"use client";

import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaExternalLinkAlt,
  FaSearch,
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
import {
  ORGANIZATION_PAGE_TYPE,
  type OrganizationPage,
  type OrganizationPageStatus,
  type OrganizationPageType,
} from "@/types/organizationPage";

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

const ALL_TYPES = Object.values(ORGANIZATION_PAGE_TYPE);
const ALL_STATUSES: OrganizationPageStatus[] = [
  "APPROVED",
  "PENDING_REVIEW",
  "REJECTED",
  "DEACTIVATED",
  "DRAFT",
];

const statusStyle = (status: OrganizationPageStatus): string => {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PENDING_REVIEW":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";
    case "DEACTIVATED":
      return "bg-gray-100 text-gray-600 border-gray-200";
    case "DRAFT":
      return "bg-sky-50 text-sky-700 border-sky-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

function AdminAllPages() {
  const router = useRouter();
  const { isLogged, role, token } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tOrg = useNextIntlTranslations("organizationPages");

  const getText = (original: string, key: string) =>
    isNextIntlEnabled ? tOrg.t(key) : original;

  const statusLabel = (status: OrganizationPageStatus): string => {
    if (status === "APPROVED")
      return getText("Publicada", "statusPublished");
    if (status === "PENDING_REVIEW")
      return getText("En revisión", "statusInReview");
    if (status === "REJECTED")
      return getText("Rechazada", "statusRejected");
    if (status === "DEACTIVATED")
      return getText("Desactivada", "statusDeactivated");
    if (status === "DRAFT") return getText("Borrador", "statusDraft");
    return status;
  };

  const [pages, setPages] = useState<OrganizationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deactivatingPage, setDeactivatingPage] =
    useState<OrganizationPage | null>(null);
  const [rejectingPage, setRejectingPage] = useState<OrganizationPage | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<OrganizationPageType | "ALL">(
    "ALL",
  );
  const [filterStatus, setFilterStatus] = useState<
    OrganizationPageStatus | "ALL"
  >("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLogged) {
      if (window.localStorage.getItem("user")) return; // hidratando, esperar
      router.push("/Login");
      return;
    }
    if (role && role !== "ADMIN") {
      toast.error(getText("Solo un admin puede ver esta página.", "adminOnly"));
      router.push("/");
    }
  }, [isLogged, role, router]);

  const load = useCallback(async () => {
    if (!token || !API_URL) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/organization-pages?limit=200`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) {
        toast.error(getText("No se pudo cargar la lista", "loadDataError"));
        setPages([]);
        return;
      }
      const data = await res.json();
      setPages(data?.data ?? []);
    } catch (err) {
      console.error("Error loading all pages:", err);
      setPages([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (role === "ADMIN" && token) load();
  }, [role, token, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pages.filter((p) => {
      if (filterType !== "ALL" && p.type !== filterType) return false;
      if (filterStatus !== "ALL" && p.status !== filterStatus) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [pages, search, filterType, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, filterStatus, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

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
      setPages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "APPROVED" } : p)),
      );
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
      setPages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "REJECTED" } : p)),
      );
      setRejectingPage(null);
    } catch (err) {
      console.error("reject error", err);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivatingPage || !token || !API_URL) return;
    const id = deactivatingPage.id;
    setBusyId(id);
    try {
      const res = await fetch(
        `${API_URL}/organization-pages/${id}/deactivate`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        toast.error(getText("No se pudo desactivar", "deactivateError"));
        return;
      }
      toast.success(getText("Página desactivada", "deactivateSuccess"));
      setPages((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "DEACTIVATED" } : p,
        ),
      );
      setDeactivatingPage(null);
    } catch (err) {
      console.error("deactivate error", err);
    } finally {
      setBusyId(null);
    }
  };

  const reactivate = async (id: string) => {
    // Reactivar = aprobar de nuevo (el endpoint approve acepta también REJECTED).
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
        toast.error(getText("No se pudo reactivar", "reactivateError"));
        return;
      }
      toast.success(getText("Página reactivada", "reactivateSuccess"));
      setPages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "APPROVED" } : p)),
      );
    } catch (err) {
      console.error("reactivate error", err);
    } finally {
      setBusyId(null);
    }
  };

  if (!isLogged || role !== "ADMIN") return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-verde-oscuro inline-flex items-center gap-2">
            <FaShieldAlt className="h-5 w-5 text-emerald-600" />
            {getText("Todas las páginas", "adminAllTitle")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {getText(
              "Gestioná y moderá todas las páginas de la plataforma.",
              "adminAllSubtitle",
            )}
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={getText("Buscar por nombre...", "searchByName")}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as OrganizationPageType | "ALL")
            }
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700"
          >
            <option value="ALL">
              {getText("Todos los tipos", "filterAllTypes")}
            </option>
            {ALL_TYPES.map((t) => {
              const meta = TYPE_META[t] ?? { original: t, key: `type${t}` };
              return (
                <option key={t} value={t}>
                  {getText(meta.original, meta.key)}
                </option>
              );
            })}
          </select>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value as OrganizationPageStatus | "ALL",
              )
            }
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700"
          >
            <option value="ALL">
              {getText("Todos los estados", "filterAllStatuses")}
            </option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-verde-oscuro" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
            {pages.length === 0
              ? getText("No hay páginas creadas", "adminAllEmpty")
              : getText(
                  "No hay resultados para los filtros aplicados",
                  "adminAllNoMatch",
                )}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((page) => {
              const typeMeta = TYPE_META[page.type] ?? {
                original: page.type,
                key: `type${page.type}`,
              };
              return (
                <li
                  key={page.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="h-14 w-14 rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                    {page.logoUrl ? (
                      <NextImage
                        src={page.logoUrl}
                        alt={page.name}
                        width={56}
                        height={56}
                        className="object-contain w-full h-full p-0.5"
                      />
                    ) : (
                      <FaUsers className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-gray-800 truncate">
                        {page.name}
                      </h2>
                      <span
                        className={`inline-flex items-center rounded-full border text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 ${statusStyle(
                          page.status,
                        )}`}
                      >
                        {statusLabel(page.status)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <PageTypeTag
                        type={page.type}
                        label={getText(typeMeta.original, typeMeta.key)}
                        size="sm"
                      />
                      {page.country && <span>{page.country}</span>}
                      {page.region && <span>· {page.region}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/pages/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-verde-oscuro border border-gray-200 hover:border-verde-oscuro rounded-lg px-3 py-1.5 font-medium"
                    >
                      <FaExternalLinkAlt className="h-3 w-3" />
                      {getText("Ver", "viewPage")}
                    </Link>
                    <Link
                      href={`/pages/${page.slug}/edit`}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-verde-oscuro border border-gray-200 hover:border-verde-oscuro rounded-lg px-3 py-1.5 font-medium"
                    >
                      <FaEdit className="h-3 w-3" />
                      {getText("Editar", "edit")}
                    </Link>
                    {page.status === "PENDING_REVIEW" && (
                      <>
                        <button
                          type="button"
                          disabled={busyId === page.id}
                          onClick={() => approve(page.id)}
                          className="text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5 font-medium disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          <FaCheckCircle className="h-3 w-3" />
                          {getText("Aprobar", "approveAction")}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === page.id}
                          onClick={() => setRejectingPage(page)}
                          className="text-xs text-red-700 border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 font-medium disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          <FaTimesCircle className="h-3 w-3" />
                          {getText("Rechazar", "rejectAction")}
                        </button>
                      </>
                    )}
                    {page.status === "APPROVED" && (
                      <button
                        type="button"
                        disabled={busyId === page.id}
                        onClick={() => setDeactivatingPage(page)}
                        className="text-xs text-red-700 border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 font-medium disabled:opacity-50"
                      >
                        {getText("Desactivar", "deactivateAction")}
                      </button>
                    )}
                    {(page.status === "DEACTIVATED" ||
                      page.status === "REJECTED") && (
                      <button
                        type="button"
                        disabled={busyId === page.id}
                        onClick={() => reactivate(page.id)}
                        className="text-xs text-emerald-700 border border-emerald-200 hover:bg-emerald-50 rounded-lg px-3 py-1.5 font-medium disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        <FaCheckCircle className="h-3 w-3" />
                        {getText("Reactivar", "reactivateAction")}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && pages.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="inline-flex items-center gap-1.5 border border-gray-200 hover:border-verde-oscuro hover:text-verde-oscuro text-gray-600 text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaChevronLeft className="h-3 w-3" />
                {getText("Anterior", "previousPage")}
              </button>
              <span className="text-sm text-gray-600">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage >= totalPages}
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
        open={!!deactivatingPage}
        title={getText("Desactivar página", "deactivateModalTitle")}
        description={
          deactivatingPage
            ? getText(
                `Vas a desactivar "${deactivatingPage.name}". Dejará de ser visible al público.`,
                "deactivateModalDescription",
              )
            : ""
        }
        confirmLabel={getText("Desactivar", "deactivateAction")}
        cancelLabel={getText("Cancelar", "cancel")}
        tone="danger"
        busy={!!busyId}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivatingPage(null)}
      />

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

export default AdminAllPages;
