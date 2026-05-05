import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FALCI_NAMES } from '../lib/tarotConstants';

export function useRandomFalci() {
  const { t, i18n } = useTranslation();
  return useCallback(() => {
    const i = Math.floor(Math.random() * FALCI_NAMES.length);
    return { name: FALCI_NAMES[i], trait: t(`falci.trait${i}`) };
  }, [t, i18n.language]);
}
