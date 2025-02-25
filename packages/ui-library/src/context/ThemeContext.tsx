import React, { createContext, useMemo } from 'react';
import { Theme, defaultDarkTheme, defaultLightTheme } from '../constants/theme';
import { Shimmer } from '../components/Shimmer/Shimmer';

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
      <Shimmer />
      {children}
    </ThemeContext.Provider>
  );
};
