"use client";

import NextImage from "next/image";
import { useCallback, useId, useRef, useState } from "react";
import { FaCamera, FaTimesCircle } from "react-icons/fa";
import Cropper from "react-easy-crop";

interface ImageUploadwithCropProps {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  initialImage?: string;
  aspect?: number;
  cropShape?: "round" | "rect";
  label?: string;
  previewShape?: "circle" | "rect";
  previewWidthClass?: string;
  previewHeightClass?: string;
  cropAreaWidthClass?: string;
  cropAreaHeightClass?: string;
  fileInputId?: string;
  buttonLabel?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

const ImageUploadwithCrop: React.FC<ImageUploadwithCropProps> = ({
  onUpload,
  onRemove,
  initialImage,
  aspect = 1,
  cropShape = "round",
  label = "Foto de Perfil",
  previewShape = "circle",
  previewWidthClass = "w-32",
  previewHeightClass = "h-32",
  cropAreaWidthClass = "w-64",
  cropAreaHeightClass = "h-64",
  fileInputId,
  buttonLabel = "Cambiar imagen",
}) => {
  const autoId = useId();
  const inputId = fileInputId ?? `image-upload-${autoId}`;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [imageSrc, setImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(initialImage || "");
  const [showCropper, setShowCropper] = useState(false);

  const previewRounding = previewShape === "circle" ? "rounded-full" : "rounded-lg";

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

        // Fondo blanco — sin esto, cuando el user hace zoom out y la
        // imagen no cubre todo el canvas, los pixeles sin pintar quedan
        // transparentes y al exportar como JPEG aparecen NEGROS. También
        // ayuda a logos con transparencia (PNG) que vienen sin margen.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, crop.width, crop.height);

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

        // Exportamos como PNG para preservar la calidad de logos
        // (los JPEG comprimen y arruinan bordes nítidos de los escudos).
        canvas.toBlob((blob) => resolve(blob), "image/png");
      };
    });
  };

  const uploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setError("No hay imagen o área seleccionada para subir");
      return;
    }
    if (!BACKEND_URL) {
      setError("API no configurada (NEXT_PUBLIC_API_URL).");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(20);

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Error al procesar la imagen");

      setUploadProgress(50);

      const formData = new FormData();
      formData.append("file", croppedBlob, "profile.png");

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
      <label className="text-gray-700 font-semibold">{label}</label>

      {!showCropper && imageUrl && (
        <div
          className={`relative ${previewWidthClass} ${previewHeightClass} ${previewRounding} overflow-hidden border border-gray-300 shadow bg-gray-100`}
        >
          <NextImage
            src={imageUrl}
            alt="Imagen actual"
            fill
            sizes="(max-width: 768px) 100vw, 512px"
            className="object-cover"
          />
        </div>
      )}

      {!showCropper && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 text-sm bg-verde-oscuro text-white py-2 px-4 rounded-md hover:bg-verde-mas-claro transition-colors"
        >
          <FaCamera />
          {buttonLabel}
        </button>
      )}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      {showCropper && (
        <div
          className={`relative ${cropAreaWidthClass} ${cropAreaHeightClass} bg-gray-100`}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={false}
            // Permitir zoom OUT por debajo de 1 para que entren logos sin
            // margen (escudos típicos de clubes). Y dejar posicionar
            // libremente sin restringir al área de crop, así si la imagen
            // queda más chica que el crop el user la puede centrar.
            minZoom={0.5}
            restrictPosition={false}
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

      {showCropper && (
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className={cropAreaWidthClass}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {showCropper && (
        <button
          onClick={uploadCroppedImage}
          disabled={uploading}
          className={`${cropAreaWidthClass} py-2 rounded text-white ${
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
