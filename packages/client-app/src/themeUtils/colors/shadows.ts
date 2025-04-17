import { createTheme, Shadows } from "@mui/material";

const muiDefaultTheme = createTheme();
const muiShadows = [...muiDefaultTheme.shadows];
const customShadows: Partial<Shadows> = [
  "none",
  "0px 0.354896605014801px 1.0646897554397583px 0.354896605014801px rgba(0, 0, 0, 0.15), 0px 0.354896605014801px 0.709793210029602px 0px rgba(0, 0, 0, 0.3)",
  "0px 0.709793210029602px 2.1293795108795166px 0.709793210029602px rgba(0, 0, 0, 0.15), 0px 0.354896605014801px 0.709793210029602px 0px rgba(0, 0, 0, 0.3)",
  "0px 0.354896605014801px 1.0646897554397583px 0px rgba(0, 0, 0, 0.3), 0px 1.419586420059204px 2.839172840118408px 1.0646897554397583px rgba(0, 0, 0, 0.15)",
  "0px 0.709793210029602px 0.709793210029602px 0px rgba(175, 196, 219, 0.4)",
  "0px 0.709793210029602px 1.419586420059204px 0px rgba(175, 196, 219, 0.4)",
  "0px 1.419586420059204px 2.839172840118408px 0px rgba(175, 196, 219, 0.4)",
  "0px 2.1293795108795166px 4.258759021759033px 0px rgba(175, 196, 219, 0.4)",
  "0px 2.839172840118408px 5.678345680236816px 0px rgba(175, 196, 219, 0.4)",
];
const shadows = [
  ...customShadows,
  ...muiShadows.slice(customShadows.length),
] as Shadows;
export default shadows;
