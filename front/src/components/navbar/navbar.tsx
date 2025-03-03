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

  return role === "ADMIN" ? <NavbarAdmin /> : <NavbarRoles />;
}

export default Navbar;
