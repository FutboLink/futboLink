"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserContext } from "@/hook/useUserContext";
import DashboardFutbolista from "@/components/Dashboard/DashboardFutbolista";
import DashboardOfertante from "@/components/Dashboard/DashboardOfertante";
import DashboardAgente from "@/components/Dashboard/DashboardAgente";
import { isFootballer } from "@/helpers/userRole";

type Decoded = { id?: string; role?: string; puesto?: string };

function decodeToken(token?: string | null): Decoded {
  if (!token) return {};
  try {
    return JSON.parse(atob(token.split(".")[1])) as Decoded;
  } catch {
    return {};
  }
}

export default function DashboardPage() {
  const { user, token } = useUserContext();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Esperamos a que el contexto hidrate; si no hay sesión, vamos al login.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const authToken = token || user?.token || null;
  const earlyRole = (user?.role as string) || decodeToken(authToken).role;

  useEffect(() => {
    if (!ready) return;
    if (!authToken) {
      router.replace("/Login");
    } else if (earlyRole === "ADMIN") {
      // El admin tiene sus propias herramientas; no usa el panel de usuario.
      router.replace("/");
    }
  }, [ready, authToken, earlyRole, router]);

  if (!authToken || earlyRole === "ADMIN") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Cargando tu panel...
      </div>
    );
  }

  const decoded = decodeToken(authToken);
  const role = (user?.role as string) || decoded.role;
  const puesto = decoded.puesto;
  const userId = (user?.id as string) || decoded.id || "";
  const name = (user?.name as string) || "";

  const isAgente =
    role === "AGENCY" || role === "RECRUITER" || role === "CLUB";

  let panel: React.ReactNode;
  if (isAgente) {
    panel = <DashboardAgente userId={userId} name={name} token={authToken} />;
  } else if (isFootballer(role, puesto)) {
    panel = <DashboardFutbolista userId={userId} name={name} token={authToken} />;
  } else {
    // PLAYER con puesto de Cuerpo Técnico / Dirección / Comunicación: también
    // se postula y publica ofertas.
    panel = (
      <DashboardOfertante userId={userId} name={name} token={authToken} />
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{panel}</main>
  );
}
