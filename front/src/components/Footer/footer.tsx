import React from "react";
import { FaTwitter, FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa"; // Iconos de redes sociales
import Link from "next/link"; // Importar Link de Next.js

function Footer() {
  return (
    <footer className="bg-black text-white mt-10 py-8">
      <div className="container mx-auto px-6">
        {/* Footer Links */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6">
          {/* Logo */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-3xl font-bold">Futbol Career</h2>
            <p className="mt-2 text-lg">Conecta talento con oportunidades</p>
          </div>

          {/* Links Section */}
          <div className="flex flex-col items-center md:items-start mt-6 md:mt-0">
            <h3 className="text-lg font-semibold">Enlaces</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="#about" className="hover:text-green-600">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/Offer" className="hover:text-green-600">
                  Ofertas
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-green-600">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="flex space-x-6 mt-6 md:mt-0">
            <a href="#" className="text-2xl hover:text-green-600">
              <FaFacebook />
            </a>
            <a href="#" className="text-2xl hover:text-green-600">
              <FaTwitter />
            </a>
            <a href="#" className="text-2xl hover:text-green-600">
              <FaLinkedin />
            </a>
            <a href="#" className="text-2xl hover:text-green-600">
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 pt-6 mt-6 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Futbol Career. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
