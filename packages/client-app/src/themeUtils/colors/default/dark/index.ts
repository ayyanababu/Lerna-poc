import { ThemeOptions, createTheme } from "@mui/material/styles";
import palette from "./palette";
import shadows from "../../shadows";

export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    ...palette,
  },
  spacing: 8,
  shadows,
};

export default createTheme(darkThemeOptions);
