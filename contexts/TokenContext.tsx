/**
 * Elmas: tek doğruluk kaynağı sunucu (public.profiles.diamonds, GET /api/me).
 * Bu context istemci önbelleğidir; harcama sonrası yanıt veya refreshBalance ile güncellenir.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { getMe, claimDailyAd, mockPurchase } from '../lib/api';

const AD_HINT_KEY = '@kahvefali_last_ad_claim_ok';

interface TokenContextType {
  tokens: number;
  setFromServer: (diamonds: number) => void;
  refreshBalance: () => Promise<void>;
  addTokens: (amount: number) => Promise<boolean>;
  watchAd: () => Promise<void>;
  canWatchAd: boolean;
  setCanWatchAd: (v: boolean) => void;
  loading: boolean;
  balanceLoading: boolean;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [canWatchAd, setCanWatchAd] = useState(true);

  const setFromServer = useCallback((diamonds: number) => {
    setTokens(Math.max(0, diamonds | 0));
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!session) {
      setTokens(0);
      return;
    }
    setBalanceLoading(true);
    try {
      const r = await getMe(session);
      if (r.ok) {
        setFromServer(r.diamonds);
      }
    } finally {
      setBalanceLoading(false);
    }
  }, [session, setFromServer]);

  const addTokens = useCallback(
    async (amount: number) => {
      if (!session) return false;
      const r = await mockPurchase(session, amount);
      if (r.ok && r.diamonds != null) {
        setFromServer(r.diamonds);
        return true;
      }
      return false;
    },
    [session, setFromServer]
  );

  useEffect(() => {
    (async () => {
      const last = await AsyncStorage.getItem(AD_HINT_KEY);
      if (last) {
        const d = new Date(last);
        const t = new Date();
        const same =
          d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
        if (same) setCanWatchAd(false);
        else setCanWatchAd(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setTokens(0);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await getMe(session);
      if (!cancelled && r.ok) {
        setFromServer(r.diamonds);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [session, authLoading, setFromServer]);

  useEffect(() => {
    if (!session) return;
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        void refreshBalance();
      }
    });
    return () => sub.remove();
  }, [session, refreshBalance]);

  const watchAd = async (): Promise<void> => {
    if (!session) {
      throw new Error('Giriş gerekli');
    }
    if (!canWatchAd) {
      throw new Error('Günlük limit');
    }
    const r = await claimDailyAd(session);
    if (!r.ok) {
      throw new Error('Ödül alınamadı');
    }
    if ('diamonds' in r && typeof r.diamonds === 'number') {
      setFromServer(r.diamonds);
    }
    if (r.alreadyClaimed) {
      setCanWatchAd(false);
    } else {
      await AsyncStorage.setItem(AD_HINT_KEY, new Date().toISOString());
      setCanWatchAd(false);
    }
  };

  return (
    <TokenContext.Provider
      value={{
        tokens,
        setFromServer,
        refreshBalance,
        addTokens,
        watchAd,
        canWatchAd,
        setCanWatchAd,
        loading: loading || authLoading,
        balanceLoading,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useTokens must be used within TokenProvider');
  }
  return context;
}
