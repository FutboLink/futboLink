import type { IProfileData } from "@/Interfaces/IUser";

export type ProfileFieldKey =
  | "imgUrl"
  | "birthday"
  | "nationality"
  | "ubicacionActual"
  | "primaryPosition"
  | "trayectorias"
  | "videoUrl"
  | "phone"
  | "physicalData"
  | "socialMedia"
  | "cv";

export type ProfileTab = "Personal" | "Profesional";

export type ProfileFieldDef = {
  key: ProfileFieldKey;
  weight: number;
  tab: ProfileTab;
  /**
   * id del input/sección al que debe hacer scroll cuando el usuario clickea
   * el botón del tip. Lo usamos como `document.getElementById(anchor)`.
   */
  anchor: string;
  /** texto en español que después se mapea a una clave i18n. */
  label: string;
  /** clave i18n correspondiente. */
  labelKey: string;
};

export type ProfileFieldStatus = ProfileFieldDef & {
  filled: boolean;
};

const FOOTBALLER_SCHEMA: ProfileFieldDef[] = [
  {
    key: "imgUrl",
    weight: 14,
    tab: "Personal",
    anchor: "field-imgUrl",
    label: "Foto de perfil",
    labelKey: "profileFieldImage",
  },
  {
    key: "birthday",
    weight: 14,
    tab: "Personal",
    anchor: "field-birthday",
    label: "Fecha de nacimiento",
    labelKey: "profileFieldBirthday",
  },
  {
    key: "nationality",
    weight: 14,
    tab: "Personal",
    anchor: "field-nationality",
    label: "Nacionalidad",
    labelKey: "profileFieldNationality",
  },
  {
    key: "ubicacionActual",
    weight: 14,
    tab: "Personal",
    anchor: "field-ubicacionActual",
    label: "País de residencia",
    labelKey: "profileFieldResidence",
  },
  {
    key: "primaryPosition",
    weight: 14,
    tab: "Profesional",
    anchor: "field-primaryPosition",
    label: "Posición principal",
    labelKey: "profileFieldPrimaryPosition",
  },
  {
    key: "trayectorias",
    weight: 14,
    tab: "Profesional",
    anchor: "field-trayectorias",
    label: "Al menos un equipo en trayectoria",
    labelKey: "profileFieldTrayectorias",
  },
  {
    key: "videoUrl",
    weight: 8,
    tab: "Personal",
    anchor: "field-videoUrl",
    label: "Video de presentación",
    labelKey: "profileFieldVideo",
  },
  {
    key: "phone",
    weight: 4,
    tab: "Personal",
    anchor: "field-phone",
    label: "Teléfono",
    labelKey: "profileFieldPhone",
  },
  {
    key: "physicalData",
    weight: 2,
    tab: "Profesional",
    anchor: "field-physicalData",
    label: "Datos físicos (altura/peso)",
    labelKey: "profileFieldPhysical",
  },
  {
    key: "socialMedia",
    weight: 1,
    tab: "Personal",
    anchor: "field-socialMedia",
    label: "Redes sociales",
    labelKey: "profileFieldSocial",
  },
  {
    key: "cv",
    weight: 1,
    tab: "Profesional",
    anchor: "field-cv",
    label: "CV",
    labelKey: "profileFieldCv",
  },
];

const NON_FOOTBALLER_SCHEMA: ProfileFieldDef[] = [
  {
    key: "imgUrl",
    weight: 18,
    tab: "Personal",
    anchor: "field-imgUrl",
    label: "Foto de perfil",
    labelKey: "profileFieldImage",
  },
  {
    key: "birthday",
    weight: 18,
    tab: "Personal",
    anchor: "field-birthday",
    label: "Fecha de nacimiento",
    labelKey: "profileFieldBirthday",
  },
  {
    key: "nationality",
    weight: 18,
    tab: "Personal",
    anchor: "field-nationality",
    label: "Nacionalidad",
    labelKey: "profileFieldNationality",
  },
  {
    key: "ubicacionActual",
    weight: 18,
    tab: "Personal",
    anchor: "field-ubicacionActual",
    label: "País de residencia",
    labelKey: "profileFieldResidence",
  },
  {
    key: "videoUrl",
    weight: 14,
    tab: "Personal",
    anchor: "field-videoUrl",
    label: "Video de presentación",
    labelKey: "profileFieldVideo",
  },
  {
    key: "phone",
    weight: 8,
    tab: "Personal",
    anchor: "field-phone",
    label: "Teléfono",
    labelKey: "profileFieldPhone",
  },
  {
    key: "socialMedia",
    weight: 3,
    tab: "Personal",
    anchor: "field-socialMedia",
    label: "Redes sociales",
    labelKey: "profileFieldSocial",
  },
  {
    key: "cv",
    weight: 3,
    tab: "Profesional",
    anchor: "field-cv",
    label: "CV",
    labelKey: "profileFieldCv",
  },
];

const isNonEmpty = (v: unknown): boolean => {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return v > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v as object).length > 0;
  return Boolean(v);
};

// Cliente confirmó: TODOS los PLAYER (cualquier puesto) usan el schema
// de Futbolista. Solo AGENCY / RECRUITER / CLUB usan el schema no-Futbolista.
export const isFootballer = (profile: Pick<IProfileData, "role" | "puesto">) =>
  profile.role === ("PLAYER" as IProfileData["role"]);

const evalField = (profile: IProfileData, key: ProfileFieldKey): boolean => {
  switch (key) {
    case "imgUrl":
      return isNonEmpty(profile.imgUrl);
    case "birthday":
      return isNonEmpty(profile.birthday);
    case "nationality":
      return isNonEmpty(profile.nationality);
    case "ubicacionActual":
      return isNonEmpty(profile.ubicacionActual);
    case "primaryPosition":
      return isNonEmpty(profile.primaryPosition);
    case "trayectorias":
      return Array.isArray(profile.trayectorias) && profile.trayectorias.some(
        (t) => isNonEmpty(t.club),
      );
    case "videoUrl":
      return (
        isNonEmpty(profile.videoUrl) ||
        (Array.isArray(profile.videoUrls) &&
          profile.videoUrls.some((url) => isNonEmpty(url)))
      );
    case "phone":
      return isNonEmpty(profile.phone);
    case "physicalData":
      return isNonEmpty(profile.height) || isNonEmpty(profile.weight);
    case "socialMedia":
      return (
        isNonEmpty(profile.socialMedia) &&
        Object.values(profile.socialMedia ?? {}).some((v) => isNonEmpty(v))
      );
    case "cv":
      return isNonEmpty(profile.cv);
    default:
      return false;
  }
};

export type ProfileCompleteness = {
  percentage: number;
  fields: ProfileFieldStatus[];
  missing: ProfileFieldStatus[];
};

export const calculateProfileCompleteness = (
  profile: IProfileData,
): ProfileCompleteness => {
  const schema = isFootballer(profile) ? FOOTBALLER_SCHEMA : NON_FOOTBALLER_SCHEMA;
  const fields: ProfileFieldStatus[] = schema.map((f) => ({
    ...f,
    filled: evalField(profile, f.key),
  }));
  const total = fields.reduce((acc, f) => acc + (f.filled ? f.weight : 0), 0);
  return {
    percentage: Math.min(100, Math.round(total)),
    fields,
    missing: fields.filter((f) => !f.filled),
  };
};
