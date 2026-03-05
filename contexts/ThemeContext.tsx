import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  card: string;
  header: string;
  text: string;
  textSecondary: string;
  buttonBg: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  themeColors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@kahvefali_theme';

const darkTheme: ThemeColors = {
  background: '#121212',
  card: '#1E1E1E',
  header: '#121212',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  buttonBg: '#2C2C2C',
};

const lightTheme: ThemeColors = {
  background: '#FAFAFA',
  card: '#FFFFFF',
  header: '#FAFAFA',
  text: '#1A1A1A',
  textSecondary: '#666666',
  buttonBg: '#F0F0F0',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTheme !== null) {
        setIsDarkMode(storedTheme === 'dark');
      }
    } catch (error) {
      console.error('Tema yüklenirken hata:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Tema kaydedilirken hata:', error);
    }
  };

  const themeColors = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
