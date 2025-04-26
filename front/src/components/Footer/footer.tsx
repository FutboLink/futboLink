import React from "react";
import {
  FaTiktok,
  FaYoutube,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
} from "react-icons/fa";
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
      <p className="mt-2 text-lg">Conectando Talentos</p>
    </div>
    <div className="flex justify-center md:justify-end space-x-4 mt-4 md:mt-0">
      <a href="https://www.facebook.com/profile.php?id=61574216832266" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-verde-mas-claro"><FaFacebook /></a>
      <a href="https://www.linkedin.com/company/futbolink/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-verde-mas-claro"><FaLinkedin /></a>
      <a href="https://www.youtube.com/@futbolink_oficial" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-verde-mas-claro"><FaYoutube /></a>
      <a href="https://www.instagram.com/futbolink_/" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-verde-mas-claro"><FaInstagram /></a>
      <a href="https://www.tiktok.com/@futbolink_" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-verde-mas-claro"><FaTiktok /></a>
      <a href="https://x.com/futbolink_" target="_blank" rel="noopener noreferrer" className="hover:text-verde-mas-claro">
  <Image 
    src="/logoX.png" 
    alt="Logo X Futbolink" 
    width={24} 
    height={24} 
    className="w-6 h-6" 
  />
</a>

    </div>
  </div>


      {/* Fila 2 - Enlaces en 2 columnas */}
<div className="mb-6">
  <h3 className="text-xl font-semibold mb-3 text-center md:text-left">Enlaces</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
    <div className="flex flex-col items-center md:items-start">
      <ul className="space-y-1">
        <li><Link href="/cursos" className="hover:text-verde-mas-claro">Entrenamiento</Link></li>
        <li><Link href="/Help" className="hover:text-verde-mas-claro">Ayuda (FAQs)</Link></li>
        <li><Link href="/videos" className="hover:text-verde-mas-claro">Guía de uso (videos tutoriales)</Link></li>
        <li><Link href="/Subs" className="hover:text-verde-mas-claro">Suscripciones</Link></li>
        <li><Link href="/News" className="hover:text-verde-mas-claro">Noticias</Link></li>
      </ul>
    </div>
    <div className="flex flex-col items-center md:items-start">
      <ul className="space-y-1">
        <li><Link href="https://t.me/futbolinkoficial" className="hover:text-verde-mas-claro">Canal de Telegram</Link></li>
        <li><Link href="/Login" className="hover:text-verde-mas-claro">Acceder a mi cuenta</Link></li>
        <li><Link href="/OptionUsers" className="hover:text-verde-mas-claro">Registrarme gratis</Link></li>
        <li><Link href="/#casos-de-exito" className="hover:text-verde-mas-claro">Casos de éxito</Link></li>
      </ul>
    </div>
  </div>
</div>

  
      {/* Fila 3 - Imágenes */}
<div className="mb-6 flex justify-center items-center">
  <Image 
    src="/pago-seguro.png" 
    alt="Pago Seguro"  
    width={0} 
    height={0} 
    sizes="100vw"
    className="w-full max-w-md h-auto p-2 rounded-md shadow"  
  />
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
