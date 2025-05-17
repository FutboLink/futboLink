import { useState } from "react";

interface FileUploadProps {
  onUpload: (fileInfo: { url: string, filename: string }) => void;
  fileType?: "cv" | "document";
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, fileType = "cv" }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      
      // Validate file type for CVs
      if (fileType === "cv") {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(selectedFile.type)) {
          setError("Por favor, sube un archivo PDF, DOC o DOCX");
          return;
        }
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError("Por favor, selecciona un archivo primero");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // For CV files, use a different approach than Cloudinary (direct API upload to backend)
      const userId = JSON.parse(atob(localStorage.getItem('token')?.split(".")[1] || "{}")).id;
      
      // Create form data for the file upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload to your backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}/upload-cv`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Error al subir el archivo");
      }

      const data = await response.json();
      
      // Call the onUpload callback with the file information
      onUpload({ 
        url: data.cvUrl || data.url, 
        filename: fileName 
      });
      
    } catch (error) {
      console.error("Error subiendo el archivo:", error);
      setError("Error al subir el archivo. Inténtalo de nuevo.");
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
    </div>
  );
};

export default FileUpload; 