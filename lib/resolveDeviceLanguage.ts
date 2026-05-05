import * as Localization from 'expo-localization';
import { SUPPORTED_LOCALE_SET, type SupportedLocale } from '../constants/supportedLocales';

/**
 * Cihaz dil etiketlerini `supportedLocales` içine eşler; eşleşmezse `en`.
 */
export function resolveDeviceLanguage(): SupportedLocale {
  for (const loc of Localization.getLocales()) {
    const c = (loc.languageCode || '').toLowerCase();
    if (c && SUPPORTED_LOCALE_SET.has(c)) {
      return c as SupportedLocale;
    }
  }
  for (const loc of Localization.getLocales()) {
    const tag = (loc.languageTag || '').split(/[-_]/)[0]?.toLowerCase();
    if (tag && SUPPORTED_LOCALE_SET.has(tag)) {
      return tag as SupportedLocale;
    }
  }
  return 'en';
}
