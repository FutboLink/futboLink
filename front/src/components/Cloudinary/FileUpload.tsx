import { useState, useContext } from "react";
import { UserContext } from "../Context/UserContext";
import { updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";

interface FileUploadProps {
  onUpload: (fileInfo: { url: string; filename: string }) => void;
  fileType?: "cv" | "document";
}

// En producción, usar ruta relativa para que pase por el rewrite de Vercel (evita CORS)
const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? ''
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, fileType = "cv" }) => {
  const { token } = useContext(UserContext);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [urlLoading, setUrlLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [directUrl, setDirectUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      setError(null);

      if (fileType === "cv") {
        const validTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!validTypes.includes(selectedFile.type)) {
          setError(
            `Tipo de archivo no soportado: ${selectedFile.type}. Por favor, sube un archivo PDF, DOC o DOCX.`
          );
          return;
        }
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("El archivo es demasiado grande. El tamaño máximo permitido es 10MB.");
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url || !url.trim()) {
      setUrlError("Por favor, ingresa una URL válida");
      return false;
    }

    if (!url.trim().startsWith("http")) {
      setUrlError("La URL debe comenzar con http:// o https://");
      return false;
    }

    if (fileType === "cv") {
      const lowerUrl = url.toLowerCase();
      const validExtensions = [".pdf", ".doc", ".docx"];
      const hasValidExtension = validExtensions.some((ext) => lowerUrl.endsWith(ext));

      if (!hasValidExtension) {
        setUrlError("La URL debe ser un archivo PDF, DOC o DOCX");
        return false;
      }
    }

    return true;
  };

  const handleDirectUrlSubmit = async () => {
    setUrlError(null);

    if (!validateUrl(directUrl)) return;

    if (!token) {
      setUrlError("Debes iniciar sesión para usar esta función");
      return;
    }

    setUrlLoading(true);

    try {
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("Token format invalid");
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.id) throw new Error("User ID not found in token");

      await updateUserData(payload.id, { cv: directUrl.trim() } as any);

      onUpload({
        url: directUrl.trim(),
        filename: directUrl.split("/").pop() || "CV en línea",
      });

      setDirectUrl("");
    } catch (error: any) {
      console.error("Error al actualizar con URL directa:", error);
      setUrlError(error.message || "Error al actualizar con la URL proporcionada");
    } finally {
      setUrlLoading(false);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError("Por favor, selecciona un archivo primero");
      return;
    }

    if (!token) {
      setError("Debes iniciar sesión para subir archivos");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Extraer userId del token
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("Token format invalid");
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.id) throw new Error("User ID not found in token");
      const userId = payload.id;

      const formData = new FormData();
      formData.append("file", file);

      const endpoint =
        fileType === "cv"
          ? `${BACKEND_URL}/upload/file?folder=cvs`
          : `${BACKEND_URL}/upload/file?folder=documents`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error al subir el archivo (${response.status})`);
      }

      const data = await response.json();

      // Actualizar perfil del usuario si es un CV
      if (fileType === "cv") {
        try {
          await updateUserData(userId, { cv: data.url } as any);
        } catch (err) {
          console.error("Error actualizando perfil:", err);
        }
      }

      onUpload({ url: data.url, filename: fileName });

      setFile(null);
      setFileName("");
    } catch (error: any) {
      console.error("Error subiendo el archivo:", error);
      setError(error.message || "Error al subir el archivo. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        accept={fileType === "cv" ? ".pdf,.doc,.docx" : "*/*"}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 border border-gray-200 rounded-lg p-2"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {fileName && (
        <p className="text-xs text-gray-600 mt-1">Archivo seleccionado: {fileName}</p>
      )}

      <button
        onClick={uploadFile}
        disabled={uploading || !file}
        className={`mt-2 w-2/5 rounded-lg p-2 text-white ${
          uploading || !file ? "bg-gray-400" : "bg-verde-oscuro hover:bg-verde-claro"
        }`}
      >
        {uploading ? "Subiendo..." : "Subir Archivo"}
      </button>

      {/* Alternate Direct URL Input */}
      <div className="mt-3 border-t pt-3">
        <p className="text-xs text-gray-600 mb-1">
          ¿Ya tienes tu CV en línea? Ingresa la URL directamente:
        </p>
        <div className="flex">
          <input
            type="text"
            placeholder="https://ejemplo.com/mi-cv.pdf"
            value={directUrl}
            onChange={(e) => {
              setDirectUrl(e.target.value);
              setUrlError(null);
            }}
            className="flex-1 p-2 text-sm border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-verde-oscuro"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleDirectUrlSubmit();
            }}
          />
          <button
            disabled={urlLoading}
            className={`px-3 py-2 text-sm rounded-r-lg text-white ${
              urlLoading ? "bg-gray-400" : "bg-verde-oscuro hover:bg-verde-claro"
            }`}
            onClick={handleDirectUrlSubmit}
          >
            {urlLoading ? "Procesando..." : "Usar URL"}
          </button>
        </div>
        {urlError && <p className="text-red-500 text-xs mt-1">{urlError}</p>}
      </div>
    </div>
  );
};

export default FileUpload;
