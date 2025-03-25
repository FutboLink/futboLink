"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const hideNavbar = pathname === "/login"; 

  if (hideNavbar) return null;

  return <Navbar />;
}
