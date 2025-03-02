import React, { createContext, useMemo } from 'react';

import { Shimmer } from '../components/Shimmer/Shimmer';
import { defaultDarkTheme, defaultLightTheme } from '../theme/theme';
import { Theme } from '../theme/types';

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

export const ChartThemeProvider: React.FC<{
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

  const contextValue = useMemo(
    () => ({ theme: mergedTheme, activeMode, setActiveMode }),
    [mergedTheme, activeMode, setActiveMode],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <Shimmer />
      {children}
    </ThemeContext.Provider>
  );
};
