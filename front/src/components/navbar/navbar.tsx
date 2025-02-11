"use client";

import { useContext } from "react";
import { UserContext } from "../Context/UserContext";
import NavbarAdmin from "./navbarAdmin";
import NavbarRoles from "./navbarRoles";

function Navbar() {
  const { role } = useContext(UserContext);

  if (role === "ADMIN") {
    return <NavbarAdmin />;
  }

  return <NavbarRoles />;
}

export default Navbar;
