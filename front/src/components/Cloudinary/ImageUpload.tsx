import Image from "next/image";
import { useState } from "react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
}

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
      
      // Validar que sea una imagen
      if (!selectedFile.type.startsWith('image/')) {
        setError("Por favor selecciona un archivo de imagen válido");
        return;
      }
      
      // Validar el tamaño (máximo 5MB)
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
    setUploadProgress(10);
    setError(null);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;
    
    console.log("Subiendo imagen a Cloudinary:", {
      cloudName,
      uploadPreset,
      fileName: file.name,
      fileSize: `${Math.round(file.size/1024)} KB`,
      fileType: file.type
    });

    if (!cloudName || !uploadPreset) {
      setError("Configuración de Cloudinary incompleta");
      setUploading(false);
      return;
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "success_cases");

    try {
      setUploadProgress(30);
      
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      
      setUploadProgress(80);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Error de Cloudinary:", errorData);
        
        // Manejo específico de errores comunes
        if (errorData?.error?.message) {
          const errorMessage = errorData.error.message;
          
          if (errorMessage.includes("cloud_name is disabled") || errorMessage.includes("disabled")) {
            throw new Error(
              "La cuenta de Cloudinary está deshabilitada. Por favor, verifica tu cuenta en el dashboard de Cloudinary o contacta al administrador."
            );
          }
          
          if (errorMessage.includes("Upload preset not found") || errorMessage.includes("preset")) {
            throw new Error(
              `El preset de subida "${uploadPreset}" no existe. Verifica que el preset esté creado en tu dashboard de Cloudinary.`
            );
          }
          
          if (response.status === 401) {
            throw new Error(
              "No autorizado. Verifica que el cloud_name y el upload_preset sean correctos y que la cuenta de Cloudinary esté activa."
            );
          }
          
          throw new Error(`Error de Cloudinary: ${errorMessage}`);
        }
        
        throw new Error(errorData?.error?.message || `Error al subir la imagen (${response.status})`);
      }
      
      const data = await response.json();
      console.log("Imagen subida exitosamente:", data.secure_url);
      
      setUploadProgress(100);
      setImageUrl(data.secure_url);
      onUpload(data.secure_url); // Llama a la función onUpload con la URL
      
      // Limpiar después de una carga exitosa
      setTimeout(() => {
        setFile(null);
        setFileName("");
        setUploadProgress(0);
      }, 2000);
      
    } catch (error: any) {
      console.error("Error subiendo la imagen:", error);
      setError(error.message || "Error al subir la imagen a Cloudinary");
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
          <p className="text-xs text-gray-600">
            Archivo seleccionado: {fileName}
          </p>
        )}
        
        {error && (
          <p className="text-xs text-red-500">
            {error}
          </p>
        )}
        
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
