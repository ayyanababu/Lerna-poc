import React, { createContext, useMemo } from 'react';
import { Theme, defaultDarkTheme, defaultLightTheme } from '../constants/theme';

type ThemeContextType = {
  theme: Theme;

  activeMode: ThemeMode;
  setActiveMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
};
type ThemeMode = 'light' | 'dark';

export const ThemeContext = createContext<ThemeContextType>({
  theme: defaultLightTheme,

  activeMode: 'light',
  setActiveMode: () => {},
});

export const ThemeProvider: React.FC<{
  themeMode?: ThemeMode;
  themeOverrides?: Partial<Theme>;
  children: React.ReactNode;
}> = ({ themeMode = 'light', themeOverrides, children }) => {
  const [activeMode, setActiveMode] = React.useState<ThemeMode>(themeMode);

  const baseTheme = useMemo(
    () => (themeMode === 'dark' ? defaultDarkTheme : defaultLightTheme),
    [themeMode],
  );

  const mergedTheme = useMemo(
    () => ({
      colors: { ...baseTheme.colors, ...themeOverrides?.colors },
      typography: { ...baseTheme.typography, ...themeOverrides?.typography },
    }),
    [baseTheme, themeOverrides],
  );

  return (
    <ThemeContext.Provider
      value={{ theme: mergedTheme, activeMode, setActiveMode }}>
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }

          .shimmer {
            animation: shimmer 2s linear infinite;
            background: linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.1) 25%,
              rgba(0, 0, 0, 0.2) 50%,
              rgba(0, 0, 0, 0.1) 75%
            );
            background-size: 200% 100%;
            position: relative;
            contain: content;
            border-radius: 8px;
            color: transparent !important;
            width: fit-content;
          }

          .shimmer * {
            color: transparent !important;
            pointer-events: none !important;
            opacity: 0 !important;
            border-color: transparent !important;
            background-color: transparent !important;
          }
        `}
      </style>
      {children}
    </ThemeContext.Provider>
  );
};
