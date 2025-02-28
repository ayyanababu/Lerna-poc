export type ThemeMode = 'light' | 'dark';

export type ThemeContextType = {
  theme: Theme;

  activeMode: ThemeMode;
  setActiveMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
};
