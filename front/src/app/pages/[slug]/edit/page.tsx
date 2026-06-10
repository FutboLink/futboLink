"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import PageWizardForm, {
  type PageWizardSubmitBody,
} from "@/components/OrganizationPages/PageWizardForm";
import { useUserContext } from "@/hook/useUserContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import {
  EMPTY_PAGE_DRAFT,
  type OrganizationPage,
  type PageDraft,
} from "@/types/organizationPage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const toPageDraft = (page: OrganizationPage): PageDraft => ({
  step: 2,
  type: page.type,
  name: page.name ?? "",
  country: page.country ?? "",
  region: page.region ?? "",
  foundationYear: page.foundationYear ?? "",
  description: page.description ?? "",
  leagueId: page.leagueId ?? null,
  federationId: page.federationId ?? null,
  division: page.division ?? null,
  logoUrl: page.logoUrl ?? "",
  bannerUrl: page.bannerUrl ?? "",
  website: page.website ?? "",
  contactEmail: page.contactEmail ?? "",
  phone: page.phone ?? "",
  socialMedia: { ...EMPTY_PAGE_DRAFT.socialMedia, ...(page.socialMedia ?? {}) },
  photoUrls: page.photoUrls ?? [],
});

function EditPage() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : (params?.slug as string | undefined);

  const { isLogged, role, token, user } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tOrg = useNextIntlTranslations("organizationPages");

  const getText = (original: string, key: string) =>
    isNextIntlEnabled ? tOrg.t(key) : original;

  const [page, setPage] = useState<OrganizationPage | null>(null);
  const [initialDraft, setInitialDraft] = useState<PageDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLogged) return;
    if (window.localStorage.getItem("user")) return;
    toast.error(
      getText("Tenés que iniciar sesión para editar una página.", "mustLogin"),
    );
    router.push("/Login");
  }, [isLogged, router]);

  useEffect(() => {
    if (!slug || !API_URL || !isLogged || !token) {
      return;
    }
    const controller = new AbortController();
    const fetchPage = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`${API_URL}/organization-pages/slug/${slug}`, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setNotFound(true);
          setPage(null);
          return;
        }
        const data = (await res.json()) as OrganizationPage;
        const isOwner = !!user?.id && !!data.ownerId && user.id === data.ownerId;
        const isAdmin = role === "ADMIN";
        if (!isOwner && !isAdmin) {
          setDenied(true);
          setPage(data);
          return;
        }
        setPage(data);
        setInitialDraft(toPageDraft(data));
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
  }, [slug, isLogged, user?.id, role, token]);

  const storageKey = slug ? `futbolink:page-edit-draft:${slug}` : "";

  const handleSubmit = async (
    body: PageWizardSubmitBody
  ): Promise<OrganizationPage | null> => {
    if (!token || !API_URL || !page) {
      toast.error(getText("No se pudo guardar la página", "createError"));
      return null;
    }
    const res = await fetch(`${API_URL}/organization-pages/${page.id}`, {
      method: "PATCH",
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
        getText("No se pudo guardar la página", "createError");
      toast.error(msg);
      return null;
    }
    const updated = (await res.json()) as OrganizationPage;
    toast.success(getText("Cambios guardados", "saveChangesSuccess"));
    setPage(updated);
    setInitialDraft(toPageDraft(updated));
    return updated;
  };

  if (!isLogged) {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-verde-oscuro" />
      </main>
    );
  }

  if (notFound) {
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

  if (denied && page) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {getText(
            "No tenés permiso para editar esta página",
            "noPermissionEdit"
          )}
        </h1>
        <Link
          href={`/pages/${page.slug}`}
          className="mt-6 inline-block bg-verde-oscuro hover:bg-verde-mas-claro text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {getText("Volver a la vista pública", "backToPublicView")}
        </Link>
      </main>
    );
  }

  if (!page || !initialDraft) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-verde-oscuro">
            {getText("Editar página", "editPageTitle")}
          </h1>
        </header>

        <PageWizardForm
          mode="edit"
          initialDraft={initialDraft}
          storageKey={storageKey}
          role={role ?? null}
          submitLabelKey="saveChanges"
          submitLabelOriginal="Guardar cambios"
          submittingLabelKey="saving"
          submittingLabelOriginal="Guardando..."
          errorLabelKey="createError"
          errorLabelOriginal="No se pudo guardar la página"
          onSubmit={handleSubmit}
          viewHref={`/pages/${page.slug}`}
        />

        <div className="text-center mt-6">
          <Link
            href={`/pages/${page.slug}`}
            className="text-xs text-gray-500 hover:text-verde-oscuro"
          >
            ← {getText("Volver a la vista pública", "backToPublicView")}
          </Link>
        </div>
      </div>
    </main>
  );
}

export default EditPage;
