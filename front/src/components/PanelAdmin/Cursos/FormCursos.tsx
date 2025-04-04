import Link from 'next/link'
import React from 'react'

export default function FormCursos() {
  return (
        <div className="flex flex-col items-center justify-center gap-8 p-8 bg-gray-100 min-h-screen">
         
          
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6">
     
            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <h2 className="text-xl text-gray-700 font-semibold mb-4">Formulario de Cursos</h2>
              <p className="text-gray-600">Crea nuevos cursos para tu plataforma.</p>
              <Link href="/PanelAdmin/Cursos/crear-curso" className="mt-4 inline-block bg-green-700  text-white px-4 py-2 rounded-lg">
                Ir al formulario
              </Link>
            </div>
    
            
            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              <h2 className=" text-gray-700 text-xl font-semibold mb-4">Editar y Eliminar Cursos</h2>
              <p className="text-gray-600">Modifica o elimina cursos existentes.</p>
              <Link href="/PanelAdmin/Cursos/editar-curso" className="mt-4 inline-block bg-green-700 text-white px-4 py-2 rounded-lg">
                Gestionar cursos
              </Link>
            </div>
          </div>
        </div>
      
  )
}
