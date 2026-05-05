/** Plan: 28 dil. Ayarlar ve `mapToSupported` bu liste ile sınırlı. */
export const SUPPORTED_LOCALES = [
  'ar',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'fi',
  'fr',
  'he',
  'hi',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'nl',
  'no',
  'pl',
  'pt',
  'ro',
  'ru',
  'sv',
  'th',
  'tr',
  'uk',
  'vi',
  'zh',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES as unknown as string[]);

export function isSupportedLocale(code: string | undefined | null): code is SupportedLocale {
  return !!code && SUPPORTED_LOCALE_SET.has(code);
}
