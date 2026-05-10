"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Subs from "@/components/Subs/subs";
import { UserContext } from "@/components/Context/UserContext";

// Guard de role: esta página muestra los planes de Jugador (PLAYER).
// Si un AGENCY / RECRUITER / CLUB llega acá, lo mandamos a /manager-subscription
// que es donde están los planes de Reclutador.
function Page() {
  const { role, isLogged } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (!isLogged) return;
    if (
      role === "AGENCY" ||
      role === "RECRUITER" ||
      role === "CLUB"
    ) {
      router.replace("/manager-subscription");
    }
  }, [role, isLogged, router]);

  if (role === "AGENCY" || role === "RECRUITER" || role === "CLUB") {
    return null;
  }

  return (
    <div className="">
      <Subs />
    </div>
  );
}

export default Page;
