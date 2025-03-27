import Link from 'next/link';
import React from 'react'

export default function FormNoticias() {
    return (
        <div className="flex flex-col items-center justify-center gap-8 p-8 bg-gray-100 min-h-screen">
         
          
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card para Formulario de Noticias */}
            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <h2 className="text-xl text-gray-700 font-semibold mb-4">Formulario de Noticias</h2>
              <p className="text-gray-600">Crea nuevas noticias para tu plataforma.</p>
              <Link href="/PanelAdmin/News/crear-noticia" className="mt-4 inline-block bg-green-700  text-white px-4 py-2 rounded-lg">
                Ir al formulario
              </Link>
            </div>
    
            {/* Card para Editar y Eliminar Noticias */}
            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <h2 className=" text-gray-700 text-xl font-semibold mb-4">Editar y Eliminar Noticias</h2>
              <p className="text-gray-600">Modifica o elimina noticias existentes.</p>
              <Link href="/PanelAdmin/News/editar-noticia" className="mt-4 inline-block bg-green-700 text-white px-4 py-2 rounded-lg">
                Gestionar noticias
              </Link>
            </div>
          </div>
        </div>
      );
    };

