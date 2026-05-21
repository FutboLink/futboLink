"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import PageWizardForm, {
  type PageWizardSubmitBody,
} from "@/components/OrganizationPages/PageWizardForm";
import { useUserContext } from "@/hook/useUserContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import {
  PAGE_DRAFT_STORAGE_KEY,
  type OrganizationPage,
} from "@/types/organizationPage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function CreatePage() {
  const router = useRouter();
  const { isLogged, role, token } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tOrg = useNextIntlTranslations("organizationPages");

  const getText = (original: string, key: string) =>
    isNextIntlEnabled ? tOrg.t(key) : original;

  const [puesto, setPuesto] = useState<string | null>(null);
  const [guardChecked, setGuardChecked] = useState(false);

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
      if (
        typeof window !== "undefined" &&
        window.localStorage.getItem("user")
      ) {
        return; // UserContext aún no hidrató, esperar.
      }
      toast.error(
        getText("Tenés que iniciar sesión para crear una página.", "mustLogin"),
      );
      router.push("/Login");
      return;
    }
    // Solo el Futbolista puro (PLAYER + puesto "Jugador" o vacío) está
    // bloqueado. Cuerpo Técnico, Agente, Dirección y demás puestos pueden
    // crear páginas. Espejo de `isFootballer` en lib/profileCompleteness.
    const puestoLower = (puesto || "").toLowerCase();
    const isPureFootballer =
      role === "PLAYER" && (puestoLower === "" || puestoLower === "jugador");
    if (isPureFootballer) {
      toast.error(
        getText(
          "Los futbolistas no pueden crear páginas. Iniciá sesión con otro rol.",
          "futbolistaNoAllowed"
        )
      );
      router.push("/profile");
    }
  }, [guardChecked, isLogged, role, puesto, router]);

  const handleSubmit = async (
    body: PageWizardSubmitBody
  ): Promise<OrganizationPage | null> => {
    if (!token || !API_URL) {
      toast.error(getText("No se pudo crear la página", "createError"));
      return null;
    }
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
      return null;
    }
    const created = (await res.json()) as OrganizationPage;
    if (created.status === "PENDING_REVIEW") {
      toast.success(
        getText(
          "Tu página fue creada y está en revisión por el admin. Solo vos podés verla por ahora.",
          "pendingApprovalToast",
        ),
      );
      router.push("/pages/mine");
    } else {
      toast.success(getText("Página creada con éxito", "createSuccess"));
      router.push(`/pages/${created.slug}`);
    }
    return created;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-verde-oscuro">
            {getText("Crear Página", "createTitle")}
          </h1>
        </header>

        <PageWizardForm
          mode="create"
          storageKey={PAGE_DRAFT_STORAGE_KEY}
          role={role ?? null}
          submitLabelKey="publish"
          submitLabelOriginal="Publicar"
          submittingLabelKey="publishing"
          submittingLabelOriginal="Publicando..."
          errorLabelKey="createError"
          errorLabelOriginal="No se pudo crear la página"
          onSubmit={handleSubmit}
        />

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
