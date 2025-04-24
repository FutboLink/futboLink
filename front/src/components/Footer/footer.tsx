import React from "react";
import {
  FaTiktok,
  FaYoutube,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
} from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";

function Footer() {
  return (
    <footer className="bg-black text-white mt-10 py-8">
  <div className="container mx-auto px-6">
  {/* Fila 1 - Título + Redes Sociales */}
  <div className="flex flex-col md:flex-row items-center justify-between mb-6 text-center md:text-left">
    <div>
      <h2 className="text-3xl font-bold">FutboLink</h2>
      <p className="mt-2 text-lg">Conectando Talento</p>
    </div>
    <div className="flex justify-center md:justify-end space-x-4 mt-4 md:mt-0">
      <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-verde-mas-claro"><FaFacebook /></a>
      <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-verde-mas-claro"><FaLinkedin /></a>
      <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-verde-mas-claro"><FaYoutube /></a>
      <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-verde-mas-claro"><FaInstagram /></a>
      <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-verde-mas-claro"><FaTiktok /></a>
      <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-verde-mas-claro"><FaX /></a>
    </div>
  </div>


      {/* Fila 2 - Enlaces en 2 columnas */}
<div className="mb-6">
  <h3 className="text-xl font-semibold mb-3 text-center md:text-left">Enlaces</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
    <div className="flex flex-col items-center md:items-start">
      <ul className="space-y-1">
        <li><Link href="/training" className="hover:text-verde-mas-claro">Entrenamiento</Link></li>
        <li><Link href="/faqs" className="hover:text-verde-mas-claro">Ayuda (FAQs)</Link></li>
        <li><Link href="/videos" className="hover:text-verde-mas-claro">Guía de uso (videos tutoriales)</Link></li>
        <li><Link href="/subscriptions" className="hover:text-verde-mas-claro">Suscripciones</Link></li>
        <li><Link href="/news" className="hover:text-verde-mas-claro">Noticias</Link></li>
      </ul>
    </div>
    <div className="flex flex-col items-center md:items-start">
      <ul className="space-y-1">
        <li><Link href="/telegram" className="hover:text-verde-mas-claro">Canal de Telegram</Link></li>
        <li><Link href="/account" className="hover:text-verde-mas-claro">Acceder a mi cuenta</Link></li>
        <li><Link href="/register" className="hover:text-verde-mas-claro">Registrarme gratis</Link></li>
        <li><Link href="/success-stories" className="hover:text-verde-mas-claro">Casos de éxito</Link></li>
      </ul>
    </div>
  </div>
</div>

  
        {/* Fila 3 - Imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center justify-items-center mb-6">
          <Image src="/pago-seguro.png" alt="Pago Seguro" width={180} height={60} className="bg-white p-2 rounded-md shadow" />
          <Image src="/pagoSeguro.png" alt="Pago Alternativo" width={180} height={60} className="bg-white p-2 rounded-md shadow" />
          <Image src="/StripeLogo.png" alt="Stripe" width={180} height={60} className="bg-white p-2 rounded-md shadow" />
        </div>
  
        {/* Fila 4 - Pie final */}
        <div className="border-t border-gray-700 pt-6 mt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
  
}

export default Footer;
