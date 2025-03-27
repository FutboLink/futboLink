"use client"
import { UserContext } from "@/components/Context/UserContext";
import ProfileAdmin from "@/components/ProfileAdmin/ProfileAdmin";
import ProfileOfertante from "@/components/ProfileOfertante/ProfileOfertante";
import Profile from "@/components/ProfileUser/ProfileUser";
import { useContext } from "react";

function Page() {
  const { isLogged, role } = useContext(UserContext);

  if (!isLogged) {
    return <p>No tienes acceso a esta página. Por favor, inicia sesión.</p>;
  }

  return (
    <div>
      {role === "PLAYER" && <Profile/>}
      {role === "RECRUITER" && <ProfileOfertante/>}
      {role === "ADMIN" && <ProfileAdmin/>}
    </div>
  );
}

export default Page;
