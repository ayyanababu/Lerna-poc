import React from 'react';
import { useTheme } from 'styled-components';

export const ThemeSwitch = () => {
  const { setActiveMode } = useTheme();

  return (
    <div>
      <button onClick={() => setActiveMode('light')}>Light</button>
      <button onClick={() => setActiveMode('dark')}>Dark</button>
    </div>
  );
};
