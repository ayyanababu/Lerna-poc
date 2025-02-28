import React, { createContext, useId, useMemo } from 'react';
import { Shimmer } from '../components/Shimmer/Shimmer';
import { defaultDarkTheme, defaultLightTheme } from '../constants/theme';
import { Theme } from '../constants/types';
import { FontFamilyImport } from '../styles/FontFamilyImport';
import { ThemeContextType, ThemeMode } from './types';


export const ThemeContext = createContext<ThemeContextType>({
  theme: defaultLightTheme,

  activeMode: 'light',
  setActiveMode: () => {},
});

export const ChartThemeProvider: React.FC<{
  themeMode?: ThemeMode;
  themeOverrides?: Partial<Theme>;
  children: React.ReactNode;
}> = ({ themeMode = 'light', themeOverrides, children }) => {
  const uniqueId = useId();
  const [activeMode, setActiveMode] = React.useState<ThemeMode>(themeMode);

  const baseTheme = useMemo(
    () => (themeMode === 'dark' ? defaultDarkTheme : defaultLightTheme),
    [themeMode],
  );

  const mergedTheme = useMemo(
    () => ({
      colors: {
        common: {
          ...baseTheme.colors.common,
          ...themeOverrides?.colors?.common,
        },
        charts: {
          ...baseTheme.colors.charts,
          ...themeOverrides?.colors?.charts,
          barChart:
            themeOverrides?.colors?.charts?.barChart ||
            baseTheme.colors.charts.barChart,
          donutChart:
            themeOverrides?.colors?.charts?.donutChart ||
            baseTheme.colors.charts.donutChart,
        },
      },
      typography: {
        ...baseTheme.typography,
        ...themeOverrides?.typography,
      },
    }),
    [baseTheme, themeOverrides],
  );

  return (
    <ThemeContext.Provider
      value={{ theme: mergedTheme, activeMode, setActiveMode }}>
      <Shimmer />
      <FontFamilyImport uniqueId={uniqueId} />
      {children}
    </ThemeContext.Provider>
  );
};
