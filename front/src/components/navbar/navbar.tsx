"use client";

import { useContext } from "react";
import { UserContext } from "../Context/UserContext";
import NavbarAdmin from "./navbarAdmin";
import NavbarRoles from "./navbarRoles";

function Navbar() {
  const { role } = useContext(UserContext);
  if (role === "") {
    return <NavbarRoles />;
  }
  console.log("Navbar - Role:", role);

  if (!role) {
    return <NavbarRoles />;
  }

  // Añadir "Sobre Futbolink" a los enlaces de navegación
  const links = [
    { name: "Inicio", href: "/" },
    { name: "Sobre Futbolink", href: "/about" },
    { name: "Ofertas", href: "/jobs" },
    { name: "Cursos", href: "/cursos" },
    { name: "Casos de Éxito", href: "/success-cases" },
    { name: "Contacto", href: "/contact" },
  ];

  return role === "ADMIN" ? <NavbarAdmin /> : <NavbarRoles />;
}

export default Navbar;
