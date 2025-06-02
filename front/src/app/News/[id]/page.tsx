"use client"; // Asegúrate de que este es un componente cliente

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { INotice } from "@/Interfaces/INews";
import Image from "next/image";

// Debug helper for logging
const DEBUG = true;
const log = (...args: any[]) => {
  if (DEBUG) {
    console.log("[NewsPage Debug]", ...args);
  }
};

// Direct API URL - no rewrites, no Next.js handling
const API_URL = "https://futbolink.onrender.com";

const NewsDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [notice, setNotice] = useState<INotice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID de noticia no proporcionado");
      return;
    }

    log("Fetching news with ID:", id);
    
    // DIRECT REQUEST TO BACKEND - bypassing Next.js completely
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${API_URL}/News/${id}`, true);
    xhr.setRequestHeader("Accept", "application/json");
    
    xhr.onload = () => {
      log(`XHR response: ${xhr.status} ${xhr.statusText}`);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          log("Successfully parsed data:", data);
          
          // Save the data
          setNotice(data);
          
          // Also create HTML content to display directly
          const html = `
            <div class="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
              <img src="${data.imageUrl}" alt="${data.title}" class="w-full h-auto rounded-lg mb-6" />
              <h1 class="text-3xl font-bold text-gray-800 mb-4">${data.title}</h1>
              <p class="text-gray-700 text-base mb-6">${data.description}</p>
            </div>
          `;
          setHtmlContent(html);
        } catch (e) {
          const parseError = e as Error;
          log("Error parsing response:", parseError);
          setError(`Error parsing response: ${parseError.message}`);
        }
      } else {
        log("Error response:", xhr.responseText);
        setError(`Error: ${xhr.status} ${xhr.statusText}`);
      }
      
      setLoading(false);
    };
    
    xhr.onerror = () => {
      log("Network error occurred");
      setError("Error de red al conectar con el servidor");
      setLoading(false);
    };
    
    xhr.send();
    
    return () => {
      xhr.abort();
    };
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  if (loading) return <p className="text-center text-gray-600">Cargando noticia...</p>;
  
  if (error) return (
    <div className="text-center">
      <p className="text-red-500 mb-4">Error: {error}</p>
      <button 
        onClick={handleGoBack}
        className="px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-green-700"
      >
        Volver a Noticias
      </button>
    </div>
  );
  
  if (!notice) return (
    <div className="text-center">
      <p className="text-red-500 mb-4">No se encontró la noticia</p>
      <button 
        onClick={handleGoBack}
        className="px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-green-700"
      >
        Volver a Noticias
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto mb-6">
        <button 
          onClick={handleGoBack}
          className="px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-green-700"
        >
          ← Volver a Noticias
        </button>
        
        {DEBUG && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
            <p><strong>Debug:</strong> Noticia cargada con ID: {notice.id}</p>
            <pre className="mt-2 text-xs">{JSON.stringify(notice, null, 2)}</pre>
          </div>
        )}
      </div>
      
      {/* Renderizado directo de la noticia */}
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="relative h-96 w-full">
          <Image
            src={notice.imageUrl}
            alt={notice.title}
            fill
            className="object-contain"
            priority
          />
        </div>
        
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{notice.title}</h1>
          <p className="text-gray-700 text-lg">{notice.description}</p>
        </div>
      </div>
      
      {/* Si todo lo demás falla, mostrar el HTML crudo (pero no debería ser necesario) */}
      {htmlContent && DEBUG && (
        <div className="mt-8">
          <h3 className="text-lg font-bold">HTML Directo (Debug):</h3>
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      )}
    </div>
  );
};

export default NewsDetailPage;
