import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    borderFocus: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    hoverPrimary: string;
    hoverSecondary: string;
    gradient: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const lightTheme = {
  primary: '#522380',
  secondary: '#EFAF2D',
  background: '#FFFFFF',
  surface: '#FEFEFF',
  surfaceElevated: '#F8FAFC',
  text: '#1E1B3A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E5E7EB',
  borderFocus: '#EFAF2D',
  accent: '#6366F1',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  hoverPrimary: '#6B4397',
  hoverSecondary: '#F4C430',
  gradient: 'linear-gradient(135deg, #522380 0%, #EFAF2D 100%)'
};

const darkTheme = {
  primary: '#8B6FB8',
  secondary: '#F4C430',
  background: '#0F0E1A',
  surface: '#1A1625',
  surfaceElevated: '#2D2438',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  border: '#374151',
  borderFocus: '#F4C430',
  accent: '#A78BFA',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#F87171',
  hoverPrimary: '#A084CC',
  hoverSecondary: '#FFD85B',
  gradient: 'linear-gradient(135deg, #8B6FB8 0%, #F4C430 100%)'
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('emblemsight-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Auto-detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('emblemsight-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;

  const value = {
    theme,
    toggleTheme,
    colors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
