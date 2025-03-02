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
  setActiveMode: () => { },
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
        axis: {
          ...baseTheme.colors.axis,
          ...themeOverrides?.colors?.axis,
        },
        tooltip: {
          ...baseTheme.colors.tooltip,
          ...themeOverrides?.colors?.tooltip,
        },
        legend: {
          ...baseTheme.colors.legend,
          ...themeOverrides?.colors?.legend,
        },
        charts: {
          ...baseTheme.colors.charts,
          ...themeOverrides?.colors?.charts,
          bar: themeOverrides?.colors?.charts?.bar || baseTheme.colors.charts.bar,
          stackedBar: themeOverrides?.colors?.charts?.stackedBar || baseTheme.colors.charts.stackedBar,
          line: themeOverrides?.colors?.charts?.line || baseTheme.colors.charts.line,
          area: themeOverrides?.colors?.charts?.area || baseTheme.colors.charts.area,
          treemap: themeOverrides?.colors?.charts?.treemap || baseTheme.colors.charts.treemap,
          donut: themeOverrides?.colors?.charts?.donut || baseTheme.colors.charts.donut,
          pie: themeOverrides?.colors?.charts?.pie || baseTheme.colors.charts.pie,
          scatter: themeOverrides?.colors?.charts?.scatter || baseTheme.colors.charts.scatter,
        },
      },
      typography: {
        ...baseTheme.typography,
        ...themeOverrides?.typography,
        fontSize: {
          ...baseTheme.typography.fontSize,
          ...themeOverrides?.typography?.fontSize,
        },
        fontWeight: {
          ...baseTheme.typography.fontWeight,
          ...themeOverrides?.typography?.fontWeight,
        },
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
