import Image from "next/image";
import { useState } from "react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
}

// En producción, usar ruta relativa para que pase por el rewrite de Vercel (evita CORS)
// En desarrollo, usar la URL del backend directamente
const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? '' // Ruta relativa en producción (Vercel rewrite)
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];

      if (!selectedFile.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen válido");
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB");
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
      setUploadProgress(0);
    }
  };

  const uploadImage = async () => {
    if (!file) {
      setError("Por favor selecciona una imagen primero");
      return;
    }

    setUploading(true);
    setUploadProgress(20);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(50);

      const response = await fetch(`${BACKEND_URL}/upload/image`, {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error al subir la imagen (${response.status})`);
      }

      const data = await response.json();
      setUploadProgress(100);
      setImageUrl(data.url);
      onUpload(data.url);

      setTimeout(() => {
        setFile(null);
        setFileName("");
        setUploadProgress(0);
      }, 2000);
    } catch (err: any) {
      console.error("Error subiendo la imagen:", err);
      setError(err.message || "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col space-y-3">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 border border-gray-200 rounded-lg p-2"
          disabled={uploading}
        />

        {fileName && (
          <p className="text-xs text-gray-600">Archivo seleccionado: {fileName}</p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <button
          onClick={uploadImage}
          disabled={uploading || !file}
          className={`mt-1 w-full sm:w-2/5 rounded-lg p-2 text-white ${
            uploading || !file ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? `Subiendo... ${uploadProgress}%` : "Subir Imagen"}
        </button>
      </div>

      {imageUrl && (
        <div className="mt-4">
          <p className="text-xs text-green-600 mb-2">¡Imagen subida correctamente!</p>
          <div className="relative w-32 h-32 overflow-hidden rounded border border-gray-200">
            <Image
              width={128}
              height={128}
              src={imageUrl}
              alt="Imagen subida"
              className="object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
