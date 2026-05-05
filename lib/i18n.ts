import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../constants/supportedLocales';
import en from '../locales/en.json';
import tr from '../locales/tr.json';

type TranslationTree = typeof en;

const resources: Record<string, { translation: TranslationTree }> = {
  en: { translation: en },
  tr: { translation: tr },
};

for (const code of SUPPORTED_LOCALES) {
  if (code !== 'en' && code !== 'tr') {
    resources[code] = { translation: {} as TranslationTree };
  }
}

void i18n.use(initReactI18next).init({
  resources,
  fallbackLng: ['en', 'tr'],
  supportedLngs: [...SUPPORTED_LOCALES],
  lng: 'en',
  defaultNS: 'translation',
  ns: ['translation'],
  compatibilityJSON: 'v4',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export { i18n as default, i18n as i18nInstance };
