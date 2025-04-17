import {
    lightGreen,
    lightGrey,
    lightOrange,
    lightPrimaryBlue,
    lightPurple,
    lightRed,
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
        main: lightPrimaryBlue[500],
        light: lightPrimaryBlue[200],
        dark: lightPrimaryBlue[600],
    },
    secondary: {
        main: lightPurple[600],
        light: lightPurple[200],
        dark: lightPurple[700],
    },
    divider: lightGrey[200],
    text: {
        primary: lightGrey[900],
        secondary: lightGrey[600],
        disabled: lightGrey[400],
    },
    warning: {
        main: lightOrange[500],
        light: lightOrange[200],
        dark: lightOrange[600],
    },
    info: {
        main: lightGrey[500],
        light: lightGrey[200],
        dark: lightGrey[700],
    },
    error: {
        main: lightRed[500],
        light: lightRed[200],
        dark: lightRed[600],
    },
    success: {
        main: lightGreen[500],
        light: lightGreen[200],
        dark: lightGreen[600],
    },
    background: {
        paper: common.white,
        default: lightGrey[50],
    },
    action: {
        disabled: lightGrey[400],
        disabledBackground: lightGrey[100],
        disabledOpacity: 1,
        hoverOpacity: 0.12,
    },
    surface: {
        main: common.white,
    },
};

export default palette;
