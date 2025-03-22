import React from 'react';
import { Theme } from '../theme/types';

export type ThemeMode = 'light' | 'dark';

export type ThemeContextType = {
    theme: Theme;

    activeMode: ThemeMode;
    setActiveMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
};
