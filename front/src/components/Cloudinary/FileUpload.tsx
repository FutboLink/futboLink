import { useState, useContext, useEffect } from "react";
import { UserContext } from "../Context/UserContext";
import { updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";

interface FileUploadProps {
  onUpload: (fileInfo: { url: string, filename: string }) => void;
  fileType?: "cv" | "document";
}

// Get Cloudinary configuration from environment with fallbacks
const getCloudinaryConfig = () => {
  // Get values from environment variables
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;
  
  // Log available values for debugging
  console.log("Environment variables:", {
    cloudName,
    uploadPreset
  });
  
  return { cloudName, uploadPreset };
};

// Simplified function to just check if a config exists
const hasCloudinaryConfig = () => {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  return Boolean(cloudName && uploadPreset);
};

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, fileType = "cv" }) => {
  const { token } = useContext(UserContext);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [urlLoading, setUrlLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [directUrl, setDirectUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);
  const [cloudinaryConfigValid, setCloudinaryConfigValid] = useState<boolean>(true);
  
  // No need for the test anymore, just check if config exists
  useEffect(() => {
    const hasConfig = hasCloudinaryConfig();
    setCloudinaryConfigValid(hasConfig);
    
    if (!hasConfig) {
      setError("La configuración de Cloudinary no está disponible. Usa la opción de URL directa.");
      console.error("Cloudinary configuration missing. Check your .env.local file for NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_UPLOAD_PRESET");
    } else {
      // Display configuration in console for debugging
      const { cloudName, uploadPreset } = getCloudinaryConfig();
      console.log(`Cloudinary config loaded: cloudName=${cloudName}, preset=${uploadPreset}`);
    }
  }, []);

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

  const validateUrl = (url: string): boolean => {
    // Basic URL validation
    if (!url || !url.trim()) {
      setUrlError("Por favor, ingresa una URL válida");
      return false;
    }
    
    if (!url.trim().startsWith('http')) {
      setUrlError("La URL debe comenzar con http:// o https://");
      return false;
    }
    
    // Check if URL ends with valid file extensions for CVs
    if (fileType === "cv") {
      const lowerUrl = url.toLowerCase();
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const hasValidExtension = validExtensions.some(ext => lowerUrl.endsWith(ext));
      
      if (!hasValidExtension) {
        setUrlError("La URL debe ser un archivo PDF, DOC o DOCX");
        return false;
      }
    }
    
    return true;
  };

  const handleDirectUrlSubmit = async () => {
    setUrlError(null);
    
    if (!validateUrl(directUrl)) {
      return;
    }
    
    if (!token) {
      setUrlError("Debes iniciar sesión para usar esta función");
      return;
    }
    
    setUrlLoading(true);
    
    try {
      // Extract user ID from the token
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token format invalid');
      }
      
      const decodedPayload = atob(parts[1]);
      const payload = JSON.parse(decodedPayload);
      
      if (!payload.id) {
        throw new Error('User ID not found in token');
      }
      
      const userId = payload.id;
      
      // Update user data with the direct URL
      await updateUserData(userId, {
        cv: directUrl.trim()
      } as any);
      
      // Call the onUpload callback
      onUpload({
        url: directUrl.trim(),
        filename: directUrl.split('/').pop() || 'CV en línea'
      });
      
      // Reset form
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
    
    if (!cloudinaryConfigValid) {
      setError("La configuración de Cloudinary no es válida. Por favor, usa la opción de URL directa.");
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
      setDebug(`Preparando subida de archivo ${file.name} (${file.type}, ${Math.round(file.size/1024)}KB) a Cloudinary`);
      
      // Get Cloudinary configuration with fallbacks
      const { cloudName, uploadPreset } = getCloudinaryConfig();
      
      setDebug(`Usando Cloudinary: ${cloudName} / ${uploadPreset}`);
      
      // Try with 'image' endpoint first, which sometimes works better for file uploads
      let cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      if (file.type.includes('pdf') || file.type.includes('word')) {
        // Use 'auto' or 'raw' for non-image files
        cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      }
      
      // Create form data for the file upload
      const formData = new FormData();
      formData.append("file", file);
      
      // Ensure uploadPreset is a string
      if (uploadPreset) {
        formData.append("upload_preset", uploadPreset);
      } else {
        throw new Error("Upload preset no configurado. Por favor, verifica la configuración de Cloudinary.");
      }
      
      formData.append("folder", "cvs"); // Store in 'cvs' folder
      
      // Try without resource_type which sometimes can cause issues
      // formData.append("resource_type", "auto"); 

      // Upload to Cloudinary
      setDebug(`Enviando archivo a ${cloudinaryUrl}...`);
      
      try {
        const response = await fetch(cloudinaryUrl, {
          method: "POST",
          body: formData
        });

        // Log the status for debugging
        setDebug(`Respuesta recibida: status ${response.status}`);
        
        // Get response JSON
        const data = await response.json();
        
        // Log the data for debugging
        console.log("Cloudinary response:", data);
        console.log("Cloudinary error details:", JSON.stringify(data));
        
        if (!response.ok) {
          console.error("Cloudinary error - status not OK:", data);
          
          // Special handling for common errors
          if (data.error && data.error.message) {
            const errorMessage = data.error.message;
            
            if (errorMessage.includes("cloud_name is disabled") || errorMessage.includes("disabled")) {
              console.error(`Cloudinary error: Cloud name "${cloudName}" is disabled. Please check your Cloudinary account status.`);
              throw new Error(
                "La cuenta de Cloudinary está deshabilitada. Por favor, verifica tu cuenta en el dashboard de Cloudinary o contacta al administrador."
              );
            }
            
            if (errorMessage.includes("Upload preset not found") || errorMessage.includes("preset")) {
              console.error(`Cloudinary error: Upload preset "${uploadPreset}" not found. Please create this preset in your Cloudinary dashboard.`);
              throw new Error("El preset de subida de Cloudinary no existe. Necesitas crear un 'Upload Preset' sin firma en tu dashboard de Cloudinary.");
            }
            
            if (response.status === 401) {
              throw new Error(
                "No autorizado. Verifica que el cloud_name y el upload_preset sean correctos y que la cuenta de Cloudinary esté activa."
              );
            }
            
            throw new Error(`Error de Cloudinary: ${errorMessage}`);
          }
          
          throw new Error(`Error ${response.status}: ${JSON.stringify(data)}`);
        }
        
        if (!data.secure_url) {
          console.error("Cloudinary error - no secure_url:", data);
          throw new Error("La respuesta de Cloudinary no contiene una URL. Verifica la configuración.");
        }

        setDebug(`Archivo subido correctamente. URL: ${data.secure_url}`);
        
        // Now, update the user's CV URL in the database
        try {
          setDebug(`Actualizando perfil de usuario ${userId} con la URL del CV...`);
          
          // Update user data in the database
          await updateUserData(userId, {
            cv: data.secure_url
          } as any);
          
          setDebug("Perfil de usuario actualizado correctamente");
        } catch (err) {
          console.error("Error updating user data:", err);
          setDebug("Error al actualizar el perfil, pero el archivo se subió correctamente");
          // Continue anyway - the file is uploaded even if we can't update the profile
        }
        
        // Call the onUpload callback with the file information
        onUpload({ 
          url: data.secure_url, 
          filename: fileName 
        });
      } catch (uploadError: any) {
        console.error("Error durante la subida a Cloudinary:", uploadError);
        throw new Error(`Error al comunicarse con Cloudinary: ${uploadError.message}`);
      }
      
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
        disabled={!cloudinaryConfigValid}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {debug && <p className="text-blue-500 text-xs mt-1">{debug}</p>}
      {fileName && <p className="text-xs text-gray-600 mt-1">Archivo seleccionado: {fileName}</p>}
      
      <button
        onClick={uploadFile}
        disabled={uploading || !file || !cloudinaryConfigValid}
        className={`mt-2 w-2/5 rounded-lg p-2 text-white ${
          uploading || !file || !cloudinaryConfigValid ? "bg-gray-400" : "bg-verde-oscuro hover:bg-verde-claro"
        }`}
      >
        {uploading ? "Subiendo..." : "Subir Archivo"}
      </button>
      
      {!cloudinaryConfigValid && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-xs font-medium">
            No se puede subir archivos porque la configuración de Cloudinary no está disponible. 
            Por favor usa la opción de URL directa a continuación.
          </p>
        </div>
      )}
      
      {error && error.includes("Cloudinary") && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-xs font-medium">
            Hay problemas con la subida directa de archivos. Te recomendamos estas alternativas:
          </p>
          <ul className="list-disc pl-5 text-xs text-yellow-600 mt-2">
            <li className="mb-1">
              <a 
                href="https://drive.google.com/drive/my-drive" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Sube tu CV a Google Drive
              </a> y luego comparte un enlace público
            </li>
            <li className="mb-1">
              <a 
                href="https://www.dropbox.com/home" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Sube tu CV a Dropbox
              </a> y obtén un enlace compartido
            </li>
            <li>Usa cualquier otro servicio de alojamiento de archivos y copia la URL directa abajo</li>
          </ul>
        </div>
      )}
      
      {error && error.includes("preset") && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-xs font-medium">
            Para que funcione la subida de archivos, debes configurar Cloudinary correctamente:
          </p>
          <ol className="list-decimal pl-5 text-xs text-yellow-600 mt-2">
            <li className="mb-1">
              Ingresa a tu <a 
                href="https://console.cloudinary.com/settings/upload" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Cloudinary Dashboard → Settings → Upload
              </a>
            </li>
            <li className="mb-1">
              Busca la sección "Upload presets" y haz clic en "Add upload preset"
            </li>
            <li className="mb-1">
              En "Preset name", escribe <strong>futbolink_preset</strong> (el mismo que está en tu .env.local)
            </li>
            <li className="mb-1">
              En "Signing Mode", selecciona <strong>Unsigned</strong>
            </li>
            <li className="mb-1">
              Guarda el preset y vuelve a intentar subir tu archivo
            </li>
          </ol>
          <p className="text-xs text-yellow-700 mt-2 font-medium">
            Mientras tanto, puedes usar las alternativas sugeridas abajo ↓
          </p>
        </div>
      )}
      
      {/* Alternate Direct URL Input */}
      <div className="mt-3 border-t pt-3">
        <p className="text-xs text-gray-600 mb-1">¿Ya tienes tu CV en línea? Ingresa la URL directamente:</p>
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
              if (e.key === 'Enter') {
                handleDirectUrlSubmit();
              }
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