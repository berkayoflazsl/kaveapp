import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface TokenContextType {
  tokens: number;
  addTokens: (amount: number) => void;
  useToken: () => boolean;
  watchAd: () => Promise<void>;
  canWatchAd: boolean;
  loading: boolean;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

const STORAGE_KEY = '@kahvefali_tokens';
const AD_WATCH_KEY = '@kahvefali_last_ad_watch';
const INITIAL_TOKENS = 50;

export function TokenProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<number>(INITIAL_TOKENS);
  const [loading, setLoading] = useState(true);
  const [canWatchAd, setCanWatchAd] = useState(true);

  // Load tokens from AsyncStorage on mount
  useEffect(() => {
    loadTokens();
    checkAdWatchStatus();
  }, []);

  const loadTokens = async () => {
    try {
      const storedTokens = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTokens !== null) {
        let count = parseInt(storedTokens, 10);
        if (count < 50) {
          count = 50;
          await AsyncStorage.setItem(STORAGE_KEY, '50');
        }
        setTokens(count);
      }
    } catch (error) {
      console.error('Token yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdWatchStatus = async () => {
    try {
      const lastWatchDate = await AsyncStorage.getItem(AD_WATCH_KEY);
      if (lastWatchDate) {
        const lastDate = new Date(lastWatchDate);
        const today = new Date();
        
        // Aynı gün mü kontrol et
        const isSameDay = 
          lastDate.getDate() === today.getDate() &&
          lastDate.getMonth() === today.getMonth() &&
          lastDate.getFullYear() === today.getFullYear();
        
        setCanWatchAd(!isSameDay);
      } else {
        setCanWatchAd(true);
      }
    } catch (error) {
      console.error('Reklam durumu kontrol hatası:', error);
      setCanWatchAd(true);
    }
  };

  const saveTokens = async (newTokens: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newTokens.toString());
    } catch (error) {
      console.error('Token kaydedilirken hata:', error);
    }
  };

  const addTokens = (amount: number) => {
    setTokens(prev => {
      const newTotal = prev + amount;
      saveTokens(newTotal);
      return newTotal;
    });
  };

  const useToken = (): boolean => {
    if (tokens > 0) {
      setTokens(prev => {
        const newTotal = prev - 1;
        saveTokens(newTotal);
        return newTotal;
      });
      return true;
    }
    return false;
  };

  const watchAd = async (): Promise<void> => {
    if (!canWatchAd) {
      Alert.alert(
        '⏰ Günlük Limit',
        'Günlük reklam izleme hakkınızı doldurdunuz. Yarın tekrar deneyin!'
      );
      throw new Error('Daily limit reached');
    }

    return new Promise((resolve) => {
      // Simüle reklam izleme süresi (3 saniye)
      setTimeout(async () => {
        addTokens(1); // Reklam izleyince 1 elmas ver
        
        // Bugünün tarihini kaydet
        const today = new Date().toISOString();
        await AsyncStorage.setItem(AD_WATCH_KEY, today);
        setCanWatchAd(false);
        
        resolve();
      }, 3000);
    });
  };

  return (
    <TokenContext.Provider value={{ tokens, addTokens, useToken, watchAd, canWatchAd, loading }}>
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
