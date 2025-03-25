import React from "react";
import { FaTwitter, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa"; // Iconos de redes sociales
import Link from "next/link"; // Importar Link de Next.js

function Footer() {
  return (
    <footer className="bg-black text-white mt-10 py-8">
      <div className="container mx-auto px-6">
        {/* Footer Links */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6">
          {/* Logo */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-3xl font-bold">Futbolink</h2>
            <p className="mt-2 text-lg">Conectando Talento</p>
          </div>

          {/* Links Section */}
          <div className="flex flex-col items-center md:items-start mt-6 md:mt-0">
            <h3 className="text-lg font-semibold">Enlaces</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  href="#about"
                  className="hover:text-verde-mas-claro hover:bg-slate-50 hover:rounded-xl p-1"
                >
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/Offer"
                  className="hover:text-verde-mas-claro hover:bg-slate-50 hover:rounded-xl p-1"
                >
                  Ofertas
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="hover:text-verde-mas-claro hover:bg-slate-50 hover:rounded-xl p-1"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="flex space-x-6 mt-6 md:mt-0">
            <a href="#" className="text-2xl hover:text-verde-mas-claro">
              <FaTiktok />
            </a>
            <a href="#" className="text-2xl hover:text-verde-mas-claro">
              <FaTwitter />
            </a>
            <a href="#" className="text-2xl hover:text-verde-mas-claro">
              <FaYoutube />
            </a>
            <a href="#" className="text-2xl hover:text-verde-mas-claro">
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 pt-6 mt-6 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Futbolink. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
