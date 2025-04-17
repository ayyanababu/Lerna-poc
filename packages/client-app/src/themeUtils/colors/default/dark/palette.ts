import {
    darkGrey,
    darkOrange,
    darkPrimaryBlue,
    darkPurple,
    darkRed,
    darkGreen,
    common,
} from '../../index';
import { PaletteOptions } from '@mui/material';

declare module '@mui/material/styles' {
    interface Palette {
        surface: Palette['primary'];
    }

    interface PaletteOptions {
        surface: PaletteOptions['primary'];
    }
}

const palette: PaletteOptions = {
    primary: {
        main: darkPrimaryBlue[500],
        light: darkPrimaryBlue[700],
        dark: darkPrimaryBlue[300],
    },
    secondary: {
        main: darkPurple[500],
        light: darkPurple[700],
        dark: darkPurple[300],
    },
    divider: darkGrey[700],
    text: {
        primary: darkGrey[100],
        secondary: darkGrey[300],
        disabled: darkGrey[400],
    },
    warning: {
        main: darkOrange[500],
        light: darkOrange[700],
        dark: darkOrange[300],
    },
    info: {
        main: darkGrey[300],
        light: darkGrey[700],
        dark: darkGrey[200],
    },
    error: {
        main: darkRed[400],
        light: darkRed[700],
        dark: darkRed[300],
    },
    success: {
        main: darkGreen[500],
        light: darkGreen[700],
        dark: darkGreen[300],
    },
    background: {
        paper: common.black,
        default: common.black,
    },
    action: {
        disabled: darkGrey[600],
        disabledBackground: darkGrey[900],
        disabledOpacity: 1,
        hoverOpacity: 0.12,
    },
    surface: {
        main: darkGrey[800],
    },
};

export default palette;
