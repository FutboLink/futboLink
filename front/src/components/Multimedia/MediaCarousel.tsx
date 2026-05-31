"use client";

import Image from "next/image";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "@/Styles/help-swiper.css";

// Convierte un link de YouTube (watch / youtu.be / embed) a su forma embebible.
// Portado de user-viewer/[id].tsx para no acoplar este componente a esa página.
const formatYoutubeUrl = (url: string): string => {
  if (!url) return "";

  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  return url;
};

export interface MediaCarouselProps {
  videos: string[];
  photos: string[];
  title?: string;
}

/**
 * Carrusel multimedia reutilizable: combina videos de YouTube (iframes) y fotos
 * en un solo Swiper. Navegación/paginación sólo con más de 1 slide. Autoplay
 * únicamente cuando son todas fotos (no cortamos una reproducción en curso).
 * Las fotos abren un lightbox. Devuelve null cuando no hay ningún slide.
 */
export default function MediaCarousel({
  videos,
  photos,
  title,
}: MediaCarouselProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const cleanVideos = videos.filter((v) => !!v?.trim());
  const cleanPhotos = photos.filter((p) => !!p?.trim());
  const totalSlides = cleanVideos.length + cleanPhotos.length;

  if (totalSlides === 0) return null;

  const shouldAutoplay = cleanVideos.length === 0 && cleanPhotos.length > 1;

  const goPrev = () =>
    setLightboxIndex((idx) =>
      idx === null ? null : (idx - 1 + cleanPhotos.length) % cleanPhotos.length,
    );
  const goNext = () =>
    setLightboxIndex((idx) =>
      idx === null ? null : (idx + 1) % cleanPhotos.length,
    );

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      <h3 className="text-lg font-medium mb-3 text-gray-800">
        {title ?? "Multimedia"}
        {totalSlides > 1 && (
          <span className="text-sm font-normal text-gray-500"> ({totalSlides})</span>
        )}
      </h3>
      <Swiper
        className="profile-media-swiper"
        modules={[Navigation, Pagination, Autoplay]}
        navigation={totalSlides > 1}
        pagination={totalSlides > 1 ? { clickable: true } : false}
        autoplay={
          shouldAutoplay
            ? {
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        loop={totalSlides > 1}
        spaceBetween={16}
        slidesPerView={1}
        onSlideChange={(swiper) => {
          swiper.el.querySelectorAll("iframe").forEach((iframe) => {
            iframe.contentWindow?.postMessage(
              '{"event":"command","func":"pauseVideo","args":""}',
              "*",
            );
          });
        }}
      >
        {cleanVideos.map((url, i) => (
          <SwiperSlide key={`v-${i}`}>
            <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`${formatYoutubeUrl(url)}?enablejsapi=1`}
                title={`Video ${i + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </SwiperSlide>
        ))}
        {cleanPhotos.map((src, i) => (
          <SwiperSlide key={`p-${i}`}>
            <button
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="block w-full relative pt-[56.25%] rounded-lg overflow-hidden bg-gray-900 cursor-zoom-in group"
              aria-label={`Abrir foto ${i + 1} en pantalla completa`}
            >
              <Image
                src={src}
                alt={`Foto ${i + 1}`}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Lightbox: se abre al clickear una foto. Cierra con click afuera o ×;
          navega con flechas cuando hay más de una foto. */}
      {lightboxIndex !== null && cleanPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada de la foto"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>

          {cleanPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
                aria-label="Foto anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
                aria-label="Foto siguiente"
              >
                ›
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-5xl h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={cleanPhotos[lightboxIndex]}
              alt={`Foto ${lightboxIndex + 1}`}
              width={1600}
              height={1200}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              priority
            />
          </div>

          {cleanPhotos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {cleanPhotos.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
