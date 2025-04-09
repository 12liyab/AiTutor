import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type ThemeVariant = 'vibrant' | 'professional' | 'tint';
export type ThemeAppearance = 'light' | 'dark' | 'system';

interface ThemeContextType {
  variant: ThemeVariant;
  appearance: ThemeAppearance;
  primaryColor: string;
  radius: number;
  setTheme: (theme: {
    variant?: ThemeVariant;
    appearance?: ThemeAppearance;
    primaryColor?: string;
    radius?: number;
  }) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  variant: 'vibrant',
  appearance: 'system',
  primaryColor: '#0ea5e9', // Default sky blue
  radius: 0.75,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load theme preferences from localStorage
  const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
  const initialTheme = storedTheme ? JSON.parse(storedTheme) : {};
  
  const [variant, setVariant] = useState<ThemeVariant>(initialTheme.variant || 'vibrant');
  const [appearance, setAppearance] = useState<ThemeAppearance>(initialTheme.appearance || 'system');
  const [primaryColor, setPrimaryColor] = useState(initialTheme.primaryColor || '#0ea5e9');
  const [radius, setRadius] = useState(initialTheme.radius || 0.75);
  
  // Update the theme in localStorage and apply it
  const setTheme = (theme: {
    variant?: ThemeVariant;
    appearance?: ThemeAppearance;
    primaryColor?: string;
    radius?: number;
  }) => {
    const newTheme = {
      variant: theme.variant !== undefined ? theme.variant : variant,
      appearance: theme.appearance !== undefined ? theme.appearance : appearance,
      primaryColor: theme.primaryColor !== undefined ? theme.primaryColor : primaryColor,
      radius: theme.radius !== undefined ? theme.radius : radius,
    };
    
    setVariant(newTheme.variant);
    setAppearance(newTheme.appearance);
    setPrimaryColor(newTheme.primaryColor);
    setRadius(newTheme.radius);
    
    localStorage.setItem('theme', JSON.stringify(newTheme));
  };
  
  // Apply dark mode class based on appearance preference
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply theme variant class
    root.classList.remove('theme-vibrant', 'theme-professional', 'theme-tint');
    root.classList.add(`theme-${variant}`);
    
    // Apply border radius
    root.style.setProperty('--radius', `${radius}rem`);
    
    // Apply primary color
    root.style.setProperty('--primary', primaryColor);
    
    // Apply dark mode
    if (appearance === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemPrefersDark);
    } else {
      root.classList.toggle('dark', appearance === 'dark');
    }
    
    // Listen for system preference changes if set to 'system'
    if (appearance === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [variant, appearance, primaryColor, radius]);
  
  const contextValue: ThemeContextType = {
    variant,
    appearance,
    primaryColor,
    radius,
    setTheme,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);