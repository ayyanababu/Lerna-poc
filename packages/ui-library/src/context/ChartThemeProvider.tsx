import React, { createContext, useMemo } from 'react';

import { Shimmer } from '../components/Shimmer/Shimmer';
import { defaultDarkTheme, defaultLightTheme } from '../theme/theme';
import { Theme } from '../theme/types';

type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
    theme: Theme;
    activeMode: ThemeMode;
    setActiveMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
};

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
    const uniqueId = Math.random().toString(36).substring(2, 15);
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
                    stackedBar:
                        themeOverrides?.colors?.charts?.stackedBar ||
                        baseTheme.colors.charts.stackedBar,
                    line: themeOverrides?.colors?.charts?.line || baseTheme.colors.charts.line,
                    area: themeOverrides?.colors?.charts?.area || baseTheme.colors.charts.area,
                    treemap:
                        themeOverrides?.colors?.charts?.treemap || baseTheme.colors.charts.treemap,
                    donut: themeOverrides?.colors?.charts?.donut || baseTheme.colors.charts.donut,
                    pie: themeOverrides?.colors?.charts?.pie || baseTheme.colors.charts.pie,
                    scatter:
                        themeOverrides?.colors?.charts?.scatter || baseTheme.colors.charts.scatter,
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
            <div className={`chart-theme-provider-${uniqueId}`}>
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
                    rel="stylesheet"
                />
                <style>
                    {`
                        .chart-theme-provider-${uniqueId} {
                            font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen,
                            Ubuntu, Cantarell, sans-serif;
                        }
                    `}
                </style>
                <Shimmer theme={mergedTheme} />
                {children}
            </div>
        </ThemeContext.Provider>
    );
};
