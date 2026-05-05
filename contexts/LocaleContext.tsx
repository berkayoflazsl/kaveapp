import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../lib/i18n';
import { resolveDeviceLanguage } from '../lib/resolveDeviceLanguage';
import { isSupportedLocale, type SupportedLocale } from '../constants/supportedLocales';

const LOCALE_PREFERENCE_KEY = '@kahvefali/locale_preference';

export type LocalePreference = 'device' | SupportedLocale;

interface LocaleContextType {
  ready: boolean;
  /** `device` = telefon diline eşle; aksi halde sabit dil kodu */
  preference: LocalePreference;
  setPreference: (p: LocalePreference) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [preference, setPref] = useState<LocalePreference>('device');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LOCALE_PREFERENCE_KEY);
        if (cancelled) return;
        if (raw && raw !== 'device' && isSupportedLocale(raw)) {
          await i18n.changeLanguage(raw);
          setPref(raw);
        } else {
          const dev = resolveDeviceLanguage();
          await i18n.changeLanguage(dev);
          setPref('device');
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback(async (p: LocalePreference) => {
    if (p === 'device') {
      await AsyncStorage.setItem(LOCALE_PREFERENCE_KEY, 'device');
      setPref('device');
      const dev = resolveDeviceLanguage();
      await i18n.changeLanguage(dev);
    } else {
      await AsyncStorage.setItem(LOCALE_PREFERENCE_KEY, p);
      setPref(p);
      await i18n.changeLanguage(p);
    }
  }, []);

  const value = useMemo(
    () => ({ ready, preference, setPreference }),
    [ready, preference, setPreference]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const c = useContext(LocaleContext);
  if (!c) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return c;
}
