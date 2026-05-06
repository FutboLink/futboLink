import type { IProfileData } from "@/Interfaces/IUser";

/**
 * Devuelve los links de video válidos del perfil, combinando el campo legacy
 * `videoUrl` con el array nuevo `videoUrls`. Filtra strings vacíos y duplicados.
 */
export function getProfileVideos(
  profile: Pick<IProfileData, "videoUrl" | "videoUrls"> | null | undefined,
): string[] {
  if (!profile) return [];
  const out = new Set<string>();
  if (profile.videoUrl?.trim()) out.add(profile.videoUrl.trim());
  for (const v of profile.videoUrls ?? []) {
    if (v?.trim()) out.add(v.trim());
  }
  return Array.from(out);
}

/** Primer video del perfil (legacy o array). Útil para vistas que muestran 1 solo. */
export function getPrimaryProfileVideo(
  profile: Pick<IProfileData, "videoUrl" | "videoUrls"> | null | undefined,
): string {
  return getProfileVideos(profile)[0] ?? "";
}

/**
 * Devuelve las fotos extra del perfil (excluyendo la imagen de perfil principal).
 * Filtra strings vacíos.
 */
export function getProfilePhotos(
  profile: Pick<IProfileData, "photoUrls"> | null | undefined,
): string[] {
  if (!profile?.photoUrls) return [];
  return profile.photoUrls.filter((p): p is string => !!p?.trim());
}
