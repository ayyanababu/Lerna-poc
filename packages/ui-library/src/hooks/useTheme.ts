import { useContext } from 'react';

import { ThemeContext } from '../context/ChartThemeProvider';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ChartThemeProvider');
  }
  return context;
};