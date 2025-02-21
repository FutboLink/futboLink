"use client";

import { useContext } from "react";
import { UserContext } from "../Context/UserContext";
import NavbarAdmin from "./navbarAdmin";
import NavbarRoles from "./navbarRoles";

function Navbar() {
  const { role } = useContext(UserContext);
  if (role === null) {
    return <div>Loading...</div>; // O un loader, spinner, etc.
  }
  console.log("Navbar - Role:", role); 

  if (!role) {
    return <NavbarRoles />; 
  }

  return role === "ADMIN" ? <NavbarAdmin /> : <NavbarRoles />;
}

export default Navbar;
