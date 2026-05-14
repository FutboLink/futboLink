import { useRouter } from "next/router";

export type SubscriptionPlanName =
  | "Amateur"
  | "Semiprofesional"
  | "Profesional"
  | string;

export interface SubscriptionCardProps {
  planName: SubscriptionPlanName;
  isActive: boolean;
  renewalDate: string | null;
  userRole: string;
  isLoading?: boolean;
  hasError?: boolean;
  onUpgrade?: () => void;
}

function formatRenewal(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default function SubscriptionCard({
  planName,
  isActive,
  renewalDate,
  userRole,
  isLoading = false,
  hasError = false,
  onUpgrade,
}: SubscriptionCardProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    const route = ["AGENCY", "RECRUITER", "CLUB"].includes(userRole)
      ? "/manager-subscription"
      : "/Subs";
    router.push(route);
  };

  if (isLoading) {
    return (
      <aside
        aria-busy="true"
        aria-labelledby="sub-card-title"
        className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 xl:sticky xl:top-24"
      >
        <span className="sr-only">Cargando informacion de suscripcion</span>
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-14 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="h-8 w-36 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-9 w-full bg-gray-200 rounded-lg animate-pulse" />
      </aside>
    );
  }

  if (hasError) {
    return (
      <aside
        aria-labelledby="sub-card-title"
        className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 xl:sticky xl:top-24"
      >
        <header className="flex items-center justify-between mb-3">
          <h2
            id="sub-card-title"
            className="text-sm font-semibold text-gray-500 uppercase tracking-wide"
          >
            Tu plan
          </h2>
        </header>
        <p className="text-base font-medium text-gray-600 mb-4">
          No pudimos cargar tu plan
        </p>
        <button
          type="button"
          onClick={handleUpgrade}
          className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg
            bg-gray-100 text-gray-600 text-sm font-medium
            hover:bg-gray-200 focus:outline-none focus-visible:ring-2
            focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-colors"
        >
          Reintentar
        </button>
      </aside>
    );
  }

  const isFreeOrAmateur = planName === "Amateur" || !planName;
  const isActivePaid = isActive && !isFreeOrAmateur;
  const isExpired = !isActive && !isFreeOrAmateur;

  let badgeLabel: string;
  let badgeClasses: string;
  let displayPlanName: string;
  let renewalLine: string | null = null;
  let ctaLabel: string;

  if (isActivePaid) {
    badgeLabel = "Activo";
    badgeClasses = "bg-green-100 text-green-700";
    displayPlanName = planName;
    renewalLine = renewalDate
      ? `Renueva el ${formatRenewal(renewalDate)}`
      : null;
    ctaLabel = "Mejorar plan";
  } else if (isExpired) {
    badgeLabel = "Vencida";
    badgeClasses = "bg-amber-100 text-amber-700";
    displayPlanName = planName;
    renewalLine = renewalDate
      ? `Vencio el ${formatRenewal(renewalDate)}`
      : null;
    ctaLabel = "Renovar plan";
  } else {
    badgeLabel = "Gratis";
    badgeClasses = "bg-gray-100 text-gray-700";
    displayPlanName = "Plan gratuito";
    renewalLine = null;
    ctaLabel = "Suscribirme";
  }

  return (
    <aside
      aria-labelledby="sub-card-title"
      className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 xl:sticky xl:top-24"
    >
      <header className="flex items-center justify-between mb-3">
        <h2
          id="sub-card-title"
          className="text-sm font-semibold text-gray-500 uppercase tracking-wide"
        >
          Tu plan
        </h2>
        <span
          role="img"
          aria-label={`Estado: ${badgeLabel.toLowerCase()}`}
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClasses}`}
        >
          {badgeLabel}
        </span>
      </header>
      <p className="text-2xl font-bold text-gray-800 mb-1">{displayPlanName}</p>
      {renewalLine && (
        <p className="text-sm text-gray-600 mb-4">{renewalLine}</p>
      )}
      {!renewalLine && <div className="mb-4" />}
      <button
        type="button"
        onClick={handleUpgrade}
        className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg
          bg-green-800 text-white text-sm font-medium
          hover:bg-green-700 focus:outline-none focus-visible:ring-2
          focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors"
      >
        {ctaLabel}
      </button>
    </aside>
  );
}
