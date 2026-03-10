"use client";

import NextImage from "next/image";
import { useState, useCallback } from "react";
import { FaCamera, FaTimesCircle } from "react-icons/fa";
import Cropper from "react-easy-crop";

interface ImageUploadwithCropProps {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  initialImage?: string;
}

// En producción, usar ruta relativa para que pase por el rewrite de Vercel (evita CORS)
const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? ''
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

const ImageUploadwithCrop: React.FC<ImageUploadwithCropProps> = ({
  onUpload,
  onRemove,
  initialImage,
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(initialImage || "");
  const [showCropper, setShowCropper] = useState(false);

  const resetAll = () => {
    setImageSrc("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setUploadProgress(0);
    setError(null);
    setShowCropper(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen válido");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCropper(true);
        setError(null);
      };
    }
  };

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const getCroppedImg = (imageSrc: string, crop: any): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);

        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height
        );

        canvas.toBlob((blob) => resolve(blob), "image/jpeg");
      };
    });
  };

  const uploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setError("No hay imagen o área seleccionada para subir");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(20);

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Error al procesar la imagen");

      setUploadProgress(50);

      const formData = new FormData();
      formData.append("file", croppedBlob, "profile.jpg");

      const res = await fetch(`${BACKEND_URL}/upload/image`, {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || `Error al subir imagen (${res.status})`);
      }

      const data = await res.json();
      setUploadProgress(100);
      setImageUrl(data.url);
      onUpload(data.url);
      resetAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <label className="text-gray-700 font-semibold">Foto de Perfil</label>

      {/* Imagen actual */}
      {!showCropper && imageUrl && (
        <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-300 shadow">
          <NextImage
            src={imageUrl}
            alt="Imagen actual"
            width={128}
            height={128}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Selector de archivo */}
      {!showCropper && (
        <button
          type="button"
          onClick={() => document.getElementById("file-input")?.click()}
          className="flex items-center gap-2 text-sm bg-verde-oscuro text-white py-2 px-4 rounded-md hover:bg-verde-mas-claro transition-colors"
        >
          <FaCamera />
          Cambiar imagen
        </button>
      )}

      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      {/* Cropper */}
      {showCropper && (
        <div className="relative w-64 h-64 bg-gray-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={false}
          />
          <button
            onClick={resetAll}
            className="absolute top-2 right-2 z-20 bg-white rounded-full p-1 text-red-600 hover:text-red-800"
            aria-label="Cancelar selección"
          >
            <FaTimesCircle size={20} />
          </button>
        </div>
      )}

      {/* Zoom */}
      {showCropper && (
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-64"
        />
      )}

      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Subir botón */}
      {showCropper && (
        <button
          onClick={uploadCroppedImage}
          disabled={uploading}
          className={`w-64 py-2 rounded text-white ${
            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {uploading ? `Subiendo... ${uploadProgress}%` : "Confirmar Imagen"}
        </button>
      )}
    </div>
  );
};

export default ImageUploadwithCrop;
