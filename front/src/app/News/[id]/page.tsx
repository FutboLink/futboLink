"use client"; // Asegúrate de que este es un componente cliente

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { INotice } from "@/Interfaces/INews";
import CardNoticias from "@/components/PanelAdmin/Noticias/CardNoticias";

// Debug helper for logging
const DEBUG = true;
const log = (...args: any[]) => {
  if (DEBUG) {
    console.log("[NewsPage Debug]", ...args);
  }
};

const NewsDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [notice, setNotice] = useState<INotice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestInfo, setRequestInfo] = useState<{
    url: string;
    method: string;
    status?: number;
    statusText?: string;
    error?: string;
    data?: any;
  } | null>(null);

  // Test direct API fetch with no redirects
  const fetchDirectlyFromAPI = async () => {
    log("Starting direct API fetch test");
    
    try {
      // Try the direct API call to test if the backend is working
      const apiUrl = "https://futbolink.onrender.com";
      const url = `${apiUrl}/News/${id}`;
      
      log(`Making direct API call to: ${url}`);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });
      
      log(`Direct API call result: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        log("API call succeeded with data:", data);
        setNotice(data);
        setLoading(false);
        setRequestInfo({
          url,
          method: "GET",
          status: response.status,
          statusText: response.statusText,
          data
        });
        return true;
      } else {
        const errorText = await response.text();
        log("API call failed with response:", errorText);
        setRequestInfo({
          url,
          method: "GET",
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return false;
      }
    } catch (err) {
      log("Direct API call threw exception:", err);
      setRequestInfo({
        url: `https://futbolink.onrender.com/News/${id}`,
        method: "GET",
        error: err instanceof Error ? err.message : String(err)
      });
      return false;
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID de noticia no proporcionado");
      return;
    }

    const loadData = async () => {
      try {
        log("Starting to load news data for ID:", id);
        log("Current origin:", window.location.origin);
        
        // Try the rewrite path first (what's failing with 500)
        const localUrl = `/News/${id}`;
        log(`Attempting fetch via local URL: ${localUrl}`);
        
        try {
          const response = await fetch(localUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
            },
          });
          
          log(`Local fetch response: ${response.status} ${response.statusText}`);
          
          if (response.ok) {
            const data = await response.json();
            log("Local fetch succeeded with data:", data);
            setNotice(data);
            setRequestInfo({
              url: localUrl,
              method: "GET",
              status: response.status,
              statusText: response.statusText,
              data
            });
          } else {
            log("Local fetch failed, falling back to direct API call");
            
            // If 500 error, try direct API call as fallback
            if (response.status === 500) {
              log("Got 500 error, trying direct API call as fallback");
              const directSuccess = await fetchDirectlyFromAPI();
              
              if (!directSuccess) {
                throw new Error(`Error al obtener la noticia: ${response.status} ${response.statusText}`);
              }
            } else {
              const errorText = await response.text();
              throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
            }
          }
        } catch (error) {
          log("Error with local fetch:", error);
          
          // If there was any error with the local fetch, try direct API call
          log("Trying direct API call after local fetch error");
          const directSuccess = await fetchDirectlyFromAPI();
          
          if (!directSuccess) {
            throw error;
          }
        }
      } catch (error) {
        log("Final error:", error);
        setError(error instanceof Error ? error.message : "Error desconocido al cargar la noticia");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  if (loading) return <p className="text-center text-gray-600">Cargando noticia...</p>;
  
  if (error) return (
    <div className="text-center">
      <p className="text-red-500 mb-4">Error: {error}</p>
      {requestInfo && (
        <div className="mb-4 text-left max-w-lg mx-auto p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Detalles de la solicitud (debug):</h3>
          <pre className="text-xs overflow-auto mt-2">
            {JSON.stringify(requestInfo, null, 2)}
          </pre>
        </div>
      )}
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
    <div>
      <div className="max-w-4xl mx-auto mt-6 mb-6">
        <button 
          onClick={handleGoBack}
          className="px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-green-700"
        >
          ← Volver a Noticias
        </button>
        {requestInfo && DEBUG && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <p><strong>Debug:</strong> Loaded from {requestInfo.url} (Status: {requestInfo.status})</p>
          </div>
        )}
      </div>
      <CardNoticias notice={notice} />
    </div>
  );
};

export default NewsDetailPage;
