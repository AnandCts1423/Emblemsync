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
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
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
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1e293b',
  textSecondary: '#666666',
  border: '#e2e8f0',
  accent: '#EFAF2D',
  success: '#10b981',
  warning: '#EFAF2D',
  error: '#ef4444',
  gradient: 'linear-gradient(135deg, #522380 0%, #EFAF2D 100%)'
};

const darkTheme = {
  primary: '#7B4397',
  secondary: '#F4C54D',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  accent: '#F4C54D',
  success: '#34d399',
  warning: '#F4C54D',
  error: '#f87171',
  gradient: 'linear-gradient(135deg, #7B4397 0%, #F4C54D 100%)'
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
