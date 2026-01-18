import { createContext, useContext, useState, FC, ReactNode } from 'react';

export type Theme = 'amber' | 'green';

interface ThemeColors {
  primary: string;
  dim: string;
  bright: string;
  glow: string;
  glowRgba: string;
  hueRotate: string;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
}

const themeColors: Record<Theme, ThemeColors> = {
  amber: {
    primary: '#ffb000',
    dim: '#cc8800',
    bright: '#ffc832',
    glow: '#ff9500',
    glowRgba: 'rgba(255, 176, 0, 0.5)',
    hueRotate: '-10deg',
  },
  green: {
    primary: '#00ff41',
    dim: '#00cc33',
    bright: '#39ff14',
    glow: '#00ff00',
    glowRgba: 'rgba(0, 255, 65, 0.5)',
    hueRotate: '75deg',
  },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('amber');

  const value: ThemeContextValue = {
    theme,
    setTheme,
    colors: themeColors[theme],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
