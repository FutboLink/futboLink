"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import ManagerSubscription from "@/components/Subs/ManagerSubscription";
import { UserContext } from "@/components/Context/UserContext";

// Guard de role: esta página muestra los planes de Reclutador (€12.95 / €25.95
// para AGENCY / RECRUITER / CLUB). Si un PLAYER llega acá por una URL vieja,
// link mal seteado o paste manual, lo mandamos a /Subs (planes de Jugador).
function Page() {
  const { role, isLogged } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (!isLogged) return;
    if (role === "PLAYER") {
      router.replace("/Subs");
    }
  }, [role, isLogged, router]);

  // Mientras decidimos si redirigir, no mostramos los planes equivocados.
  if (role === "PLAYER") return null;

  return (
    <div className="mb-32">
      <ManagerSubscription />
    </div>
  );
}

export default Page;
