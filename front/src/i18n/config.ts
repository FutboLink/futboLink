// Can be imported from a shared config
export const locales = ['es', 'en', 'it'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';
