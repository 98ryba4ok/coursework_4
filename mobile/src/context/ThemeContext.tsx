import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from '@react-navigation/native';
import { ThemeMode } from '../types';

// ─── Нейро-тёмная палитра (основная тема приложения) ───────────────────────
const neuroColors = {
  primary: '#4F9CF9',        // электрик-синий
  primaryDark: '#2563EB',
  secondary: '#06B6D4',      // бирюза / cyan
  accent: '#818CF8',         // индиго
  background: '#070F1E',     // почти чёрный синий
  surface: '#0D1B35',        // тёмно-синий
  surfaceVariant: '#162040', // чуть светлее surface
  card: '#112035',           // карточки
  border: '#1E3A5F',         // границы
  text: '#E8EEF8',           // основной текст
  textSecondary: '#8BA3C7',  // вторичный текст
  placeholder: '#4A6A8A',    // плейсхолдер
  // Степени тяжести
  no_stroke: '#10B981',      // зелёный
  minor: '#3B82F6',          // синий
  moderate: '#F59E0B',       // янтарный
  moderate_severe: '#F97316',// оранжевый
  severe: '#EF4444',         // красный
  error: '#FF6B6B',
};

const neuroLightColors = {
  primary: '#1D4ED8',
  primaryDark: '#1E40AF',
  secondary: '#0891B2',
  accent: '#6366F1',
  background: '#F0F4FF',
  surface: '#FFFFFF',
  surfaceVariant: '#E8EEFF',
  card: '#FFFFFF',
  border: '#C7D7F0',
  text: '#0A1628',
  textSecondary: '#4A5568',
  placeholder: '#94A3B8',
  no_stroke: '#059669',
  minor: '#2563EB',
  moderate: '#D97706',
  moderate_severe: '#EA580C',
  severe: '#DC2626',
  error: '#DC2626',
};

const buildDarkTheme = () => ({
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: neuroColors.primary,
    secondary: neuroColors.secondary,
    background: neuroColors.background,
    surface: neuroColors.surface,
    surfaceVariant: neuroColors.surfaceVariant,
    onSurface: neuroColors.text,
    onBackground: neuroColors.text,
    outline: neuroColors.border,
    error: neuroColors.error,
    onPrimary: '#FFFFFF',
  },
  custom: neuroColors,
});

const buildLightTheme = () => ({
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: neuroLightColors.primary,
    secondary: neuroLightColors.secondary,
    background: neuroLightColors.background,
    surface: neuroLightColors.surface,
    surfaceVariant: neuroLightColors.surfaceVariant,
    onSurface: neuroLightColors.text,
    onBackground: neuroLightColors.text,
    outline: neuroLightColors.border,
    error: neuroLightColors.error,
    onPrimary: '#FFFFFF',
  },
  custom: neuroLightColors,
});

const { DarkTheme: navDark, LightTheme: navLight } = adaptNavigationTheme({
  reactNavigationDark: NavDarkTheme,
  reactNavigationLight: NavLightTheme,
});

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  paperTheme: ReturnType<typeof buildDarkTheme>;
  navigationTheme: typeof navDark;
  colors: typeof neuroColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem('theme_mode').then((saved) => {
      if (saved) setThemeModeState(saved as ThemeMode);
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem('theme_mode', mode);
  };

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const paperTheme = isDark ? buildDarkTheme() : buildLightTheme();
  const navigationTheme = isDark ? navDark : navLight;
  const colors = isDark ? neuroColors : neuroLightColors;

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, paperTheme, navigationTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
