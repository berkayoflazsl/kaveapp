import { useMemo } from 'react';

const LOCALE_MAP = {
  tr: 'tr-TR',
  en: 'en-GB',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-PT',
  pl: 'pl-PL',
  ru: 'ru-RU',
  ar: 'ar-SA',
  he: 'he-IL',
  el: 'el-GR',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  hi: 'hi-IN',
  id: 'id-ID',
  th: 'th-TH',
  vi: 'vi-VN',
  cs: 'cs-CZ',
  ro: 'ro-RO',
  hu: 'hu-HU',
  sv: 'sv-SE',
  no: 'nb-NO',
  da: 'da-DK',
  fi: 'fi-FI',
  uk: 'uk-UA',
  nl: 'nl-NL',
};

/**
 * @param {{ resolvedLanguage: string, language: string }} i18n
 * @returns {string} BCP-47 for DateTimePicker
 */
export function useDatePickerLocale(i18n) {
  return useMemo(() => {
    const code = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase().split('-')[0];
    return LOCALE_MAP[code] || 'en-GB';
  }, [i18n.resolvedLanguage, i18n.language]);
}
