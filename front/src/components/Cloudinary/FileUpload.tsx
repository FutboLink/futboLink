import { useState, useContext } from "react";
import { UserContext } from "../Context/UserContext";
import { updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";

interface FileUploadProps {
  onUpload: (fileInfo: { url: string, filename: string }) => void;
  fileType?: "cv" | "document";
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, fileType = "cv" }) => {
  const { token } = useContext(UserContext);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      
      setError(null);
      setDebug(null);
      
      // Validate file type for CVs
      if (fileType === "cv") {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(selectedFile.type)) {
          setError(`Tipo de archivo no soportado: ${selectedFile.type}. Por favor, sube un archivo PDF, DOC o DOCX.`);
          return;
        }
      }
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("El archivo es demasiado grande. El tamaño máximo permitido es 5MB.");
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
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
    setDebug(null);

    try {
      // Extract user ID from the token safely
      let userId;
      try {
        // Split the JWT token and decode the payload
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Token format invalid');
        }
        
        // Base64 decode the payload
        const decodedPayload = atob(parts[1]);
        const payload = JSON.parse(decodedPayload);
        
        if (!payload.id) {
          throw new Error('User ID not found in token');
        }
        
        userId = payload.id;
      } catch (err) {
        console.error('Error parsing token:', err);
        throw new Error('No se pudo identificar el usuario. Por favor, vuelve a iniciar sesión.');
      }
      
      // Add useful debug info
      setDebug(`Subiendo archivo ${file.name} (${file.type}, ${Math.round(file.size/1024)}KB) a Cloudinary`);
      
      // Since the /upload-cv endpoint doesn't exist, use Cloudinary directly
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;
      
      if (!cloudName || !uploadPreset) {
        throw new Error("Configuración de Cloudinary no encontrada");
      }
      
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
      
      // Create form data for the file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "cvs"); // Store in 'cvs' folder
      formData.append("resource_type", "auto"); // Auto-detect resource type

      // Upload to Cloudinary
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData
      });

      // Get response JSON
      const data = await response.json();
      
      if (!response.ok || !data.secure_url) {
        console.error("Cloudinary error:", data);
        throw new Error("Error al subir el archivo a Cloudinary");
      }

      setDebug(`Archivo subido correctamente. Actualizando perfil de usuario...`);
      
      // Now, update the user's CV URL in the database
      try {
        // Update user data in the database
        await updateUserData(userId, {
          cv: data.secure_url
        } as any);
      } catch (err) {
        console.error("Error updating user data:", err);
        // Continue anyway - the file is uploaded even if we can't update the profile
      }
      
      // Call the onUpload callback with the file information
      onUpload({ 
        url: data.secure_url, 
        filename: fileName 
      });
      
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
      {debug && <p className="text-blue-500 text-xs mt-1">{debug}</p>}
      {fileName && <p className="text-xs text-gray-600 mt-1">Archivo seleccionado: {fileName}</p>}
      
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
        <p className="text-xs text-gray-600 mb-1">¿Ya tienes tu CV en línea? Ingresa la URL directamente:</p>
        <div className="flex">
          <input 
            type="text" 
            placeholder="https://ejemplo.com/mi-cv.pdf"
            className="flex-1 p-2 text-sm border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-verde-oscuro" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const url = (e.target as HTMLInputElement).value;
                if (url && url.trim().startsWith('http')) {
                  onUpload({
                    url: url.trim(),
                    filename: url.split('/').pop() || 'CV en línea'
                  });
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          <button 
            className="bg-verde-oscuro text-white px-3 py-2 text-sm rounded-r-lg hover:bg-verde-claro"
            onClick={(e) => {
              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
              const url = input.value;
              if (url && url.trim().startsWith('http')) {
                onUpload({
                  url: url.trim(),
                  filename: url.split('/').pop() || 'CV en línea'
                });
                input.value = '';
              }
            }}
          >
            Usar URL
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload; 