import { ThemeOptions, createTheme } from "@mui/material/styles";

import palette from "./palette";
import shadows from "../../shadows";

export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    ...palette,
  },
  spacing: 8,
  shadows,
};

export default createTheme(lightThemeOptions);
