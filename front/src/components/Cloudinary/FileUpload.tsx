import { useState, useContext, useEffect } from "react";
import { UserContext } from "../Context/UserContext";
import { updateUserData } from "../Fetchs/UsersFetchs/UserFetchs";

interface FileUploadProps {
  onUpload: (fileInfo: { url: string, filename: string }) => void;
  fileType?: "cv" | "document";
}

// Get Cloudinary configuration from environment with fallbacks
const getCloudinaryConfig = () => {
  // First check client-side env
  let cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  let uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;
  
  // Log available values for debugging
  console.log("Environment variables:", {
    cloudName,
    uploadPreset
  });
  
  // Default fallbacks - these values need to be verified in Cloudinary dashboard
  if (!cloudName) cloudName = "futbolink"; // Updated with correct cloud name
  if (!uploadPreset) uploadPreset = "futbolink_upload"; // Updated with correct upload preset
  
  return { cloudName, uploadPreset };
};

// Test Cloudinary configuration by making a small request
const testCloudinaryConfig = async () => {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  
  // Try to fetch the Cloudinary API to check configuration
  try {
    const infoUrl = `https://api.cloudinary.com/v1_1/${cloudName}/usage`;
    const response = await fetch(infoUrl);
    
    // This will likely fail without API key/secret, but it allows us to check if the cloud_name exists
    // If we get a 404, the cloud_name is invalid
    // If we get a 401, the cloud_name exists but we need auth (expected)
    
    if (response.status === 404) {
      console.error("Cloudinary configuration error: Invalid cloud name");
      return { valid: false, message: "El nombre de nube de Cloudinary no es válido" };
    }
    
    // For the upload preset, we need to make a different check
    // Create a tiny test file (1x1 transparent pixel as base64)
    const tinyPixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const blob = await (await fetch(tinyPixel)).blob();
    const testFile = new File([blob], "test-pixel.gif", { type: "image/gif" });
    
    // Create form data for a test upload
    const formData = new FormData();
    formData.append("file", testFile);
    formData.append("upload_preset", uploadPreset);
    
    // Attempt to upload the test pixel
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData
    });
    
    const uploadData = await uploadResponse.json();
    
    if (!uploadResponse.ok) {
      if (uploadData.error && uploadData.error.message.includes("Upload preset not found")) {
        console.error("Cloudinary configuration error: Invalid upload preset", uploadData);
        return { valid: false, message: "El preset de subida de Cloudinary no es válido" };
      }
      
      console.error("Cloudinary configuration error during test upload:", uploadData);
      return { valid: false, message: `Error en la configuración de Cloudinary: ${uploadData.error?.message || "Error desconocido"}` };
    }
    
    console.log("Cloudinary configuration test successful");
    return { valid: true };
    
  } catch (error) {
    console.error("Error testing Cloudinary configuration:", error);
    return { valid: false, message: "No se pudo verificar la configuración de Cloudinary" };
  }
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
  const [cloudinaryConfigValid, setCloudinaryConfigValid] = useState<boolean | null>(null);
  
  // Test Cloudinary configuration on component mount
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const configTest = await testCloudinaryConfig();
        setCloudinaryConfigValid(configTest.valid);
        
        if (!configTest.valid) {
          setError(`Error de configuración de Cloudinary: ${configTest.message}`);
          console.error("Cloudinary configuration is invalid:", configTest.message);
        }
      } catch (err) {
        console.error("Error checking Cloudinary config:", err);
        setCloudinaryConfigValid(false);
        setError("No se pudo verificar la configuración de Cloudinary");
      }
    };
    
    checkConfig();
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
    
    if (cloudinaryConfigValid === false) {
      setError("La configuración de Cloudinary no es válida. Por favor, contacta al administrador.");
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
      
      // Validate configuration
      if (!cloudName || !uploadPreset) {
        throw new Error('La configuración de Cloudinary es incorrecta. Por favor, contacta al administrador.');
      }
      
      setDebug(`Usando Cloudinary: ${cloudName} / ${uploadPreset}`);
      
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
      
      // Create form data for the file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "cvs"); // Store in 'cvs' folder
      formData.append("resource_type", "auto"); // Auto-detect resource type

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
        
        if (!response.ok) {
          console.error("Cloudinary error - status not OK:", data);
          
          // Special handling for common errors
          if (data.error && data.error.message) {
            if (data.error.message.includes("Upload preset not found")) {
              throw new Error("El preset de subida de Cloudinary no es válido. Por favor, contacta al administrador.");
            }
            
            throw new Error(`Error de Cloudinary: ${data.error.message}`);
          }
          
          throw new Error(`Error ${response.status}: ${data.error?.message || "Error desconocido"}`);
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
      {cloudinaryConfigValid === null && (
        <p className="text-blue-500 text-xs mb-2">Verificando configuración de Cloudinary...</p>
      )}
      
      <input
        type="file"
        accept={fileType === "cv" ? ".pdf,.doc,.docx" : "*/*"}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 border border-gray-200 rounded-lg p-2"
        disabled={cloudinaryConfigValid === false}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {debug && <p className="text-blue-500 text-xs mt-1">{debug}</p>}
      {fileName && <p className="text-xs text-gray-600 mt-1">Archivo seleccionado: {fileName}</p>}
      
      <button
        onClick={uploadFile}
        disabled={uploading || !file || cloudinaryConfigValid === false}
        className={`mt-2 w-2/5 rounded-lg p-2 text-white ${
          uploading || !file || cloudinaryConfigValid === false ? "bg-gray-400" : "bg-verde-oscuro hover:bg-verde-claro"
        }`}
      >
        {uploading ? "Subiendo..." : "Subir Archivo"}
      </button>
      
      {cloudinaryConfigValid === false && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-xs font-medium">
            No se puede subir archivos porque la configuración de Cloudinary no es válida. 
            Como alternativa, puedes usar la opción de URL directa a continuación.
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