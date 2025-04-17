export const lightTheme = {
    breakpoints: {
        keys: ['xs', 'sm', 'md', 'lg', 'xl'],
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
        unit: 'px',
    },
    direction: 'ltr',
    components: {
        MuiAutocomplete: {
            defaultProps: {
                size: 'medium',
            },
            styleOverrides: {},
        },
        MuiButton: {
            defaultProps: {
                disableRipple: true,
            },
            styleOverrides: {
                iconSizeSmall: {
                    '& > *:first-of-type': {
                        fontSize: '1rem',
                    },
                },
                iconSizeMedium: {
                    '& > *:first-of-type': {
                        fontSize: '1rem',
                    },
                },
                iconSizeLarge: {
                    '& > *:first-of-type': {
                        fontSize: '1.25rem',
                    },
                },
            },
            variants: [
                {
                    props: {
                        size: 'extraLarge',
                    },
                    style: {
                        height: '42px',
                        padding: '6px 12px',
                        fontSize: '1rem',
                        letterSpacing: '0.1px',
                        lineHeight: 1.75,
                        minWidth: '82px',
                        '& > span > *:first-of-type': {
                            fontSize: '1.5rem',
                        },
                        '& > svg': {
                            fontSize: '1.5rem',
                        },
                    },
                },
            ],
        },
        MuiButtonGroup: {
            defaultProps: {
                disableRipple: true,
            },
            styleOverrides: {},
        },
        MuiToggleButton: {
            defaultProps: {
                color: 'primary',
                disableRipple: true,
            },
            styleOverrides: {},
            variants: [
                {
                    props: {
                        size: 'extraLarge',
                    },
                    style: {
                        height: '42px',
                        padding: '6px 12px',
                        fontSize: '1rem',
                        letterSpacing: '0.1px',
                        lineHeight: 1.75,
                        minWidth: '82px',
                        '& > span > *:first-of-type': {
                            fontSize: '1.5rem',
                        },
                        '& > svg': {
                            fontSize: '1.5rem',
                        },
                    },
                },
            ],
        },
        MuiToggleButtonGroup: {
            defaultProps: {
                color: 'primary',
                exclusive: true,
            },
            styleOverrides: {},
        },
        MuiBadge: {
            defaultProps: {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                },
            },
            styleOverrides: {},
        },
        MuiCheckbox: {
            defaultProps: {
                size: 'medium',
                disableRipple: true,
            },
            styleOverrides: {},
        },
        MuiChip: {
            defaultProps: {
                color: 'primary',
            },
            styleOverrides: {
                sizeMedium: {
                    height: '24px',
                    padding: '4px',
                    gap: '4px',
                    fontSize: '14px',
                },
                sizeSmall: {
                    height: '16px',
                    padding: '0px 4px',
                    gap: '4px',
                    fontSize: '12px',
                    letterSpacing: '0.4px',
                },
            },
            variants: [
                {
                    props: {
                        size: 'large',
                    },
                    style: {
                        padding: '4px 6px',
                        gap: '8px',
                        fontSize: '16px',
                        lineHeight: 1.57,
                        letterSpacing: '0.15px',
                    },
                },
            ],
        },
        MuiFormControlLabel: {
            defaultProps: {},
            styleOverrides: {},
        },
        MuiFormLabel: {
            defaultProps: {},
            styleOverrides: {},
        },
        MuiSvgIcon: {
            defaultProps: {
                fontSize: 'small',
            },
            styleOverrides: {},
        },
        MuiIconButton: {
            defaultProps: {
                disableRipple: true,
                size: 'medium',
            },
            styleOverrides: {
                sizeLarge: {
                    '& > *:first-of-type': {
                        fontSize: '24px',
                    },
                },
                sizeMedium: {
                    '& > *:first-of-type': {
                        fontSize: '20px',
                    },
                },
                sizeSmall: {
                    '& > *:first-of-type': {
                        fontSize: '16px',
                    },
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                list: {
                    borderRadius: '4px',
                    paddingTop: '0',
                    paddingBottom: '0',
                },
            },
        },
        MuiMenuItem: {
            defaultProps: {
                disableRipple: true,
            },
            styleOverrides: {},
        },
        MuiRadio: {
            defaultProps: {
                disableRipple: true,
            },
            styleOverrides: {},
        },
        MuiSwitch: {
            defaultProps: {
                size: 'small',
                disableRipple: true,
            },
            styleOverrides: {},
        },
        MuiTooltip: {
            defaultProps: {},
            styleOverrides: {
                popper: {
                    '&.MuiTooltip-popper[data-popper-placement*="bottom"] .MuiTooltip-tooltip':
                        {
                            marginTop: '15px',
                        },
                    '&.MuiTooltip-popper[data-popper-placement*="top"] .MuiTooltip-tooltip':
                        {
                            marginBottom: '15px',
                        },
                    '&.MuiTooltip-popper[data-popper-placement*="left"] .MuiTooltip-tooltip':
                        {
                            marginRight: '15px',
                        },
                    '&.MuiTooltip-popper[data-popper-placement*="right"] .MuiTooltip-tooltip':
                        {
                            marginLeft: '15px',
                        },
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'medium',
            },
            styleOverrides: {},
        },
        MuiTabs: {
            defaultProps: {},
            styleOverrides: {},
        },
        MuiTab: {
            defaultProps: {
                disableFocusRipple: true,
                disableRipple: true,
            },
            styleOverrides: {},
        },
        jsonEditor: {
            light: {
                base00: '#FFFFFF',
                base01: '#F8FAFC',
                base02: '#E2E8F0',
                base03: '#94A3B8',
                base04: '#E2E8F0',
                base05: '#0F477E',
                base06: '#14293D',
                base07: '#0F3757',
                base08: '#761F24',
                base09: '#B00020',
                base0A: '#13534D',
                base0B: '#5D3199',
                base0C: '#3E2066',
                base0D: '#334155',
                base0E: '#0F477E',
                base0F: '#9C27B0',
            },
            dark: {
                base00: '#202529',
                base01: '#282E33',
                base02: '#3E4C59',
                base03: '#5A6A7B',
                base04: '#3E4C59',
                base05: '#BCDFFB',
                base06: '#CAD2D8',
                base07: '#80B4FF',
                base08: '#F88E86',
                base09: '#FF9559',
                base0A: '#FAB1D7',
                base0B: '#85C988',
                base0C: '#C9A3FC',
                base0D: '#67B8E3',
                base0E: '#C2E4C3',
                base0F: '#FFC107',
            },
        },
        MuiCssBaseline: {},
    },
    palette: {
        mode: 'light',
        primary: {
            main: '#1976D2',
            light: '#A3C8ED',
            dark: '#145EA8',
            contrastText: '#fff',
        },
        secondary: {
            main: '#7C41CC',
            light: '#D7B9FF',
            dark: '#5D3199',
            contrastText: '#fff',
        },
        divider: '#E2E8F0',
        text: {
            primary: '#0F172A',
            secondary: '#475569',
            disabled: '#94A3B8',
        },
        warning: {
            main: '#ED6C02',
            light: '#F8C49A',
            dark: '#BE5602',
            contrastText: '#fff',
        },
        info: {
            main: '#64748B',
            light: '#E2E8F0',
            dark: '#334155',
            contrastText: '#fff',
        },
        error: {
            main: '#C4343C',
            light: '#E7AEB1',
            dark: '#9D2A30',
            contrastText: '#fff',
        },
        success: {
            main: '#01866E',
            light: '#99CFC5',
            dark: '#016B58',
            contrastText: '#fff',
        },
        background: {
            paper: '#FFFFFF',
            default: '#F8FAFC',
        },
        action: {
            disabled: '#94A3B8',
            disabledBackground: '#F1F5F8',
            disabledOpacity: 1,
            hoverOpacity: 0.12,
            active: 'rgba(0, 0, 0, 0.54)',
            hover: 'rgba(0, 0, 0, 0.04)',
            selected: 'rgba(0, 0, 0, 0.08)',
            selectedOpacity: 0.08,
            focus: 'rgba(0, 0, 0, 0.12)',
            focusOpacity: 0.12,
            activatedOpacity: 0.12,
        },
        surface: {
            main: '#FFFFFF',
        },
        common: {
            black: '#000',
            white: '#fff',
        },
        grey: {
            '50': '#fafafa',
            '100': '#f5f5f5',
            '200': '#eeeeee',
            '300': '#e0e0e0',
            '400': '#bdbdbd',
            '500': '#9e9e9e',
            '600': '#757575',
            '700': '#616161',
            '800': '#424242',
            '900': '#212121',
            A100: '#f5f5f5',
            A200: '#eeeeee',
            A400: '#bdbdbd',
            A700: '#616161',
        },
        contrastThreshold: 3,
        tonalOffset: 0.2,
    },
    shape: {
        borderRadius: 4,
    },
    shadows: [
        'none',
        '0px 0.354896605014801px 1.0646897554397583px 0.354896605014801px rgba(0, 0, 0, 0.15), 0px 0.354896605014801px 0.709793210029602px 0px rgba(0, 0, 0, 0.3)',
        '0px 0.709793210029602px 2.1293795108795166px 0.709793210029602px rgba(0, 0, 0, 0.15), 0px 0.354896605014801px 0.709793210029602px 0px rgba(0, 0, 0, 0.3)',
        '0px 0.354896605014801px 1.0646897554397583px 0px rgba(0, 0, 0, 0.3), 0px 1.419586420059204px 2.839172840118408px 1.0646897554397583px rgba(0, 0, 0, 0.15)',
        '0px 0.709793210029602px 0.709793210029602px 0px rgba(175, 196, 219, 0.4)',
        '0px 0.709793210029602px 1.419586420059204px 0px rgba(175, 196, 219, 0.4)',
        '0px 1.419586420059204px 2.839172840118408px 0px rgba(175, 196, 219, 0.4)',
        '0px 2.1293795108795166px 4.258759021759033px 0px rgba(175, 196, 219, 0.4)',
        '0px 2.839172840118408px 5.678345680236816px 0px rgba(175, 196, 219, 0.4)',
        '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
        '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
        '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
        '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
        '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
        '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
        '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
        '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
        '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
        '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
        '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
        '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
        '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
        '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
        '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
        '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
    ],
    typography: {
        fontFamily: '"Roboto", sans-serif',
        h1: {
            fontSize: 34,
            fontWeight: 400,
            lineHeight: 1.23,
            letterSpacing: 0.25,
            fontFamily: '"Roboto", sans-serif',
        },
        h2: {
            fontSize: 24,
            fontWeight: 400,
            lineHeight: 1.33,
            letterSpacing: 0.25,
            fontFamily: '"Roboto", sans-serif',
        },
        h3: {
            fontSize: 20,
            fontWeight: 500,
            lineHeight: 1.6,
            letterSpacing: 0.15,
            fontFamily: '"Roboto", sans-serif',
        },
        h4: {
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1.75,
            letterSpacing: 0.1,
            fontFamily: '"Roboto", sans-serif',
        },
        h5: {
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.57,
            letterSpacing: 0.15,
            fontFamily: '"Roboto", sans-serif',
        },
        h6: {
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.43,
            letterSpacing: 0.1,
            fontFamily: '"Roboto", sans-serif',
        },
        subtitle1: {
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.43,
            letterSpacing: 0.25,
            fontFamily: '"Roboto", sans-serif',
        },
        subtitle2: {
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.43,
            letterSpacing: 0.25,
            fontFamily: '"Roboto", sans-serif',
        },
        body1: {
            fontSize: 13,
            fontWeight: 400,
            lineHeight: 1.43,
            letterSpacing: 0.25,
            fontFamily: '"Roboto", sans-serif',
        },
        body2: {
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1.43,
            letterSpacing: 0.4,
            fontFamily: '"Roboto", sans-serif',
        },
        caption: {
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.43,
            letterSpacing: 0.4,
            fontFamily: '"Roboto", sans-serif',
        },
        overline: {
            fontSize: 10,
            fontWeight: 500,
            lineHeight: 1.66,
            letterSpacing: 0.4,
            fontFamily: '"Roboto", sans-serif',
            textTransform: 'uppercase',
        },
        overline2: {
            fontSize: 10,
            fontWeight: 400,
            lineHeight: 1.66,
            letterSpacing: 0.4,
        },
        htmlFontSize: 16,
        fontSize: 14,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
        button: {
            fontFamily: '"Roboto", sans-serif',
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.75,
            textTransform: 'uppercase',
        },
        inherit: {
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            letterSpacing: 'inherit',
        },
    },
    unstable_sxConfig: {
        border: {
            themeKey: 'borders',
        },
        borderTop: {
            themeKey: 'borders',
        },
        borderRight: {
            themeKey: 'borders',
        },
        borderBottom: {
            themeKey: 'borders',
        },
        borderLeft: {
            themeKey: 'borders',
        },
        borderColor: {
            themeKey: 'palette',
        },
        borderTopColor: {
            themeKey: 'palette',
        },
        borderRightColor: {
            themeKey: 'palette',
        },
        borderBottomColor: {
            themeKey: 'palette',
        },
        borderLeftColor: {
            themeKey: 'palette',
        },
        outline: {
            themeKey: 'borders',
        },
        outlineColor: {
            themeKey: 'palette',
        },
        borderRadius: {
            themeKey: 'shape.borderRadius',
        },
        color: {
            themeKey: 'palette',
        },
        bgcolor: {
            themeKey: 'palette',
            cssProperty: 'backgroundColor',
        },
        backgroundColor: {
            themeKey: 'palette',
        },
        p: {},
        pt: {},
        pr: {},
        pb: {},
        pl: {},
        px: {},
        py: {},
        padding: {},
        paddingTop: {},
        paddingRight: {},
        paddingBottom: {},
        paddingLeft: {},
        paddingX: {},
        paddingY: {},
        paddingInline: {},
        paddingInlineStart: {},
        paddingInlineEnd: {},
        paddingBlock: {},
        paddingBlockStart: {},
        paddingBlockEnd: {},
        m: {},
        mt: {},
        mr: {},
        mb: {},
        ml: {},
        mx: {},
        my: {},
        margin: {},
        marginTop: {},
        marginRight: {},
        marginBottom: {},
        marginLeft: {},
        marginX: {},
        marginY: {},
        marginInline: {},
        marginInlineStart: {},
        marginInlineEnd: {},
        marginBlock: {},
        marginBlockStart: {},
        marginBlockEnd: {},
        displayPrint: {
            cssProperty: false,
        },
        display: {},
        overflow: {},
        textOverflow: {},
        visibility: {},
        whiteSpace: {},
        flexBasis: {},
        flexDirection: {},
        flexWrap: {},
        justifyContent: {},
        alignItems: {},
        alignContent: {},
        order: {},
        flex: {},
        flexGrow: {},
        flexShrink: {},
        alignSelf: {},
        justifyItems: {},
        justifySelf: {},
        gap: {},
        rowGap: {},
        columnGap: {},
        gridColumn: {},
        gridRow: {},
        gridAutoFlow: {},
        gridAutoColumns: {},
        gridAutoRows: {},
        gridTemplateColumns: {},
        gridTemplateRows: {},
        gridTemplateAreas: {},
        gridArea: {},
        position: {},
        zIndex: {
            themeKey: 'zIndex',
        },
        top: {},
        right: {},
        bottom: {},
        left: {},
        boxShadow: {
            themeKey: 'shadows',
        },
        width: {},
        maxWidth: {},
        minWidth: {},
        height: {},
        maxHeight: {},
        minHeight: {},
        boxSizing: {},
        fontFamily: {
            themeKey: 'typography',
        },
        fontSize: {
            themeKey: 'typography',
        },
        fontStyle: {
            themeKey: 'typography',
        },
        fontWeight: {
            themeKey: 'typography',
        },
        letterSpacing: {},
        textTransform: {},
        lineHeight: {},
        textAlign: {},
        typography: {
            cssProperty: false,
            themeKey: 'typography',
        },
    },
    mixins: {
        toolbar: {
            minHeight: 56,
            '@media (min-width:0px)': {
                '@media (orientation: landscape)': {
                    minHeight: 48,
                },
            },
            '@media (min-width:600px)': {
                minHeight: 64,
            },
        },
    },
    transitions: {
        easing: {
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
        duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195,
        },
    },
    zIndex: {
        mobileStepper: 1000,
        fab: 1050,
        speedDial: 1050,
        appBar: 1100,
        drawer: 1200,
        modal: 1300,
        snackbar: 1400,
        tooltip: 1500,
    },
    vars: null,
};

export const darkTheme = {
    breakpoints: {
        keys: ['xs', 'sm', 'md', 'lg', 'xl'],
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
        unit: 'px',
    },
    direction: 'ltr',
    components: {
        MuiAutocomplete: {
            defaultProps: {
                size: 'medium',
            },
            styleOverrides: {},
        },
        MuiButton: {
            defaultProps: {
                disableRipple: true,
            },
            styleOverrides: {
                iconSizeSmall: {
                    '& > *:first-of-type': {
                        fontSize: '1rem',
                    },
                },
                iconSizeMedium: {
                    '& > *:first-of-type': {
                        fontSize: '1rem',
                    },
                },
                iconSizeLarge: {
                    '& > *:first-of-type': {
                        fontSize: '1.25rem',
                    },
                },
            },
            variants: [
                {
                    props: {
                        size: 'extraLarge',
                    },
                    style: {
                        height: '42px',
                        padding: '6px 12px',
                        fontSize: '1rem',
                        letterSpacing: '0.1px',
                        lineHeight: 1.75,
                        minWidth: '82px',
                        '& > span > *:first-of-type': {
                            fontSize: '1.5rem',
                        },
                        '& > svg': {
                            fontSize: '1.5rem',
                        },
                    },
                },
            ],
        },
        MuiButtonGroup: {
            defaultProps: {
                disableRipple: true,
            },
            styleOverrides: {},
        },
        MuiToggleButton: {
            defaultProps: {
                color: 'primary',
                disableRipple: true,
            },
            styleOverrides: {},
            variants: [
                {
                    props: {
                        size: 'extraLarge',
                    },
                    style: {
                        height: '42px',
                        padding: '6px 12px',
                        fontSize: '1rem',
                        letterSpacing: '0.1px',
                        lineHeight: 1.75,
                        minWidth: '82px',
                        '& > span > *:first-of-type': {
                            fontSize: '1.5rem',
                        },
                        '& > svg': {
                            fontSize: '1.5rem',
                        },
                    },
                },
            ],
        },
        MuiToggleButtonGroup: {
            defaultProps: {
                color: 'primary',
                exclusive: true,
            },
            styleOverrides: {},
        },
        MuiBadge: {
            defaultProps: {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                },
            },
            styleOverrides: {},
        },
        MuiCheckbox: {
            defaultProps: {
                size: 'medium',
                disableRipple: true,
            },
            styleOverrides: {},
        },
        MuiChip: {
            defaultProps: {
                color: 'primary',
            },
            styleOverrides: {
                sizeMedium: {
                    height: '24px',
                    padding: '4px',
                    gap: '4px',
                    fontSize: '14px',
                },
                sizeSmall: {
                    height: '16px',
                    padding: '0px 4px',
                    gap: '4px',
                    fontSize: '12px',
                    letterSpacing: '0.4px',
                },
            },
            variants: [
                {
                    props: {
                        size: 'large',
                    },
                    style: {
                        padding: '4px 6px',
                        gap: '8px',
                        fontSize: '16px',
                        lineHeight: 1.57,
                        letterSpacing: '0.15px',
                    },
                },
            ],
        },
        MuiFormControlLabel: {
            defaultProps: {},
            styleOverrides: {},
        },
        MuiFormLabel: {
            defaultProps: {},
            styleOverrides: {},
        },
        MuiSvgIcon: {
            defaultProps: {
                fontSize: 'small',
            },
            styleOverrides: {},
        },
        MuiIconButton: {
            defaultProps: {
                disableRipple: true,
                size: 'medium',
            },
            styleOverrides: {
                sizeLarge: {
                    '& > *:first-of-type': {
                        fontSize: '24px',
                    },
                },
                sizeMedium: {
                    '& > *:first-of-type': {
                        fontSize: '20px',
                    },
                },
                sizeSmall: {
                    '& > *:first-of-type': {
                        fontSize: '16px',
                    },
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                list: {
                    borderRadius: '4px',
                    paddingTop: '0',
                    paddingBottom: '0',
                },
            },
        },
        MuiMenuItem: {
            defaultProps: {
                disableRipple: true,
            },
            styleOverrides: {},
        },
        MuiRadio: {
            defaultProps: {
                disableRipple: true,
            },
            styleOverrides: {},
        },
        MuiSwitch: {
            defaultProps: {
                size: 'small',
                disableRipple: true,
            },
            styleOverrides: {},
        },
        MuiTooltip: {
            defaultProps: {},
            styleOverrides: {
                popper: {
                    '&.MuiTooltip-popper[data-popper-placement*="bottom"] .MuiTooltip-tooltip':
                        {
                            marginTop: '15px',
                        },
                    '&.MuiTooltip-popper[data-popper-placement*="top"] .MuiTooltip-tooltip':
                        {
                            marginBottom: '15px',
                        },
                    '&.MuiTooltip-popper[data-popper-placement*="left"] .MuiTooltip-tooltip':
                        {
                            marginRight: '15px',
                        },
                    '&.MuiTooltip-popper[data-popper-placement*="right"] .MuiTooltip-tooltip':
                        {
                            marginLeft: '15px',
                        },
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'medium',
            },
            styleOverrides: {},
        },
        MuiTabs: {
            defaultProps: {},
            styleOverrides: {},
        },
        MuiTab: {
            defaultProps: {
                disableFocusRipple: true,
                disableRipple: true,
            },
            styleOverrides: {},
        },
        jsonEditor: {
            light: {
                base00: '#FFFFFF',
                base01: '#F8FAFC',
                base02: '#E2E8F0',
                base03: '#94A3B8',
                base04: '#E2E8F0',
                base05: '#0F477E',
                base06: '#14293D',
                base07: '#0F3757',
                base08: '#761F24',
                base09: '#B00020',
                base0A: '#13534D',
                base0B: '#5D3199',
                base0C: '#3E2066',
                base0D: '#334155',
                base0E: '#0F477E',
                base0F: '#9C27B0',
            },
            dark: {
                base00: '#202529',
                base01: '#282E33',
                base02: '#3E4C59',
                base03: '#5A6A7B',
                base04: '#3E4C59',
                base05: '#BCDFFB',
                base06: '#CAD2D8',
                base07: '#80B4FF',
                base08: '#F88E86',
                base09: '#FF9559',
                base0A: '#FAB1D7',
                base0B: '#85C988',
                base0C: '#C9A3FC',
                base0D: '#67B8E3',
                base0E: '#C2E4C3',
                base0F: '#FFC107',
            },
        },
        MuiCssBaseline: {},
    },
    palette: {
        mode: 'dark',
        primary: {
            main: '#90CAF9',
            light: '#567995',
            dark: '#BCDFFB',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        secondary: {
            main: '#C9A3FC',
            light: '#796297',
            dark: '#DFC8FD',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        divider: '#3E4C59',
        text: {
            primary: '#E4E7EB',
            secondary: '#ACBBC7',
            disabled: '#7B8695',
            icon: 'rgba(255, 255, 255, 0.5)',
        },
        warning: {
            main: '#FF9559',
            light: '#995935',
            dark: '#FFBF9B',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        info: {
            main: '#ACBBC7',
            light: '#3E4C59',
            dark: '#CAD2D8',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        error: {
            main: '#F6695E',
            light: '#922820',
            dark: '#F88E86',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        success: {
            main: '#66BB6A',
            light: '#3D7040',
            dark: '#A3D6A6',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        background: {
            paper: '#202529',
            default: '#202529',
        },
        action: {
            disabled: '#52606D',
            disabledBackground: '#1B2025',
            disabledOpacity: 1,
            hoverOpacity: 0.12,
            active: '#fff',
            hover: 'rgba(255, 255, 255, 0.08)',
            selected: 'rgba(255, 255, 255, 0.16)',
            selectedOpacity: 0.16,
            focus: 'rgba(255, 255, 255, 0.12)',
            focusOpacity: 0.12,
            activatedOpacity: 0.24,
        },
        surface: {
            main: '#282E33',
        },
        common: {
            black: '#000',
            white: '#fff',
        },
        grey: {
            '50': '#fafafa',
            '100': '#f5f5f5',
            '200': '#eeeeee',
            '300': '#e0e0e0',
            '400': '#bdbdbd',
            '500': '#9e9e9e',
            '600': '#757575',
            '700': '#616161',
            '800': '#424242',
            '900': '#212121',
            A100: '#f5f5f5',
            A200: '#eeeeee',
            A400: '#bdbdbd',
            A700: '#616161',
        },
        contrastThreshold: 3,
        tonalOffset: 0.2,
    },
    shape: {
        borderRadius: 4,
    },
    shadows: [
        'none',
        '0px 0.354896605014801px 1.0646897554397583px 0.354896605014801px rgba(0, 0, 0, 0.15), 0px 0.354896605014801px 0.709793210029602px 0px rgba(0, 0, 0, 0.3)',
        '0px 0.709793210029602px 2.1293795108795166px 0.709793210029602px rgba(0, 0, 0, 0.15), 0px 0.354896605014801px 0.709793210029602px 0px rgba(0, 0, 0, 0.3)',
        '0px 0.354896605014801px 1.0646897554397583px 0px rgba(0, 0, 0, 0.3), 0px 1.419586420059204px 2.839172840118408px 1.0646897554397583px rgba(0, 0, 0, 0.15)',
        '0px 0.709793210029602px 0.709793210029602px 0px rgba(175, 196, 219, 0.4)',
        '0px 0.709793210029602px 1.419586420059204px 0px rgba(175, 196, 219, 0.4)',
        '0px 1.419586420059204px 2.839172840118408px 0px rgba(175, 196, 219, 0.4)',
        '0px 2.1293795108795166px 4.258759021759033px 0px rgba(175, 196, 219, 0.4)',
        '0px 2.839172840118408px 5.678345680236816px 0px rgba(175, 196, 219, 0.4)',
        '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
        '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
        '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
        '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
        '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
        '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
        '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
        '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
        '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
        '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
        '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
        '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
        '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
        '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
        '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
        '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
    ],
    typography: {
        fontFamily: '"Roboto", sans-serif',
        h1: {
            fontSize: 34,
            fontWeight: 400,
            lineHeight: 1.23,
            letterSpacing: 0.25,
            fontFamily: '"Roboto", sans-serif',
        },
        h2: {
            fontSize: 24,
            fontWeight: 400,
            lineHeight: 1.33,
            letterSpacing: 0.25,
            fontFamily: '"Roboto", sans-serif',
        },
        h3: {
            fontSize: 20,
            fontWeight: 500,
            lineHeight: 1.6,
            letterSpacing: 0.15,
            fontFamily: '"Roboto", sans-serif',
        },
        h4: {
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1.75,
            letterSpacing: 0.1,
            fontFamily: '"Roboto", sans-serif',
        },
        h5: {
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.57,
            letterSpacing: 0.15,
            fontFamily: '"Roboto", sans-serif',
        },
        h6: {
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.43,
            letterSpacing: 0.1,
            fontFamily: '"Roboto", sans-serif',
        },
        subtitle1: {
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.43,
            letterSpacing: 0.25,
            fontFamily: '"Roboto", sans-serif',
        },
        subtitle2: {
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.43,
            letterSpacing: 0.25,
            fontFamily: '"Roboto", sans-serif',
        },
        body1: {
            fontSize: 13,
            fontWeight: 400,
            lineHeight: 1.43,
            letterSpacing: 0.25,
            fontFamily: '"Roboto", sans-serif',
        },
        body2: {
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1.43,
            letterSpacing: 0.4,
            fontFamily: '"Roboto", sans-serif',
        },
        caption: {
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.43,
            letterSpacing: 0.4,
            fontFamily: '"Roboto", sans-serif',
        },
        overline: {
            fontSize: 10,
            fontWeight: 500,
            lineHeight: 1.66,
            letterSpacing: 0.4,
            fontFamily: '"Roboto", sans-serif',
            textTransform: 'uppercase',
        },
        overline2: {
            fontSize: 10,
            fontWeight: 400,
            lineHeight: 1.66,
            letterSpacing: 0.4,
        },
        htmlFontSize: 16,
        fontSize: 14,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
        button: {
            fontFamily: '"Roboto", sans-serif',
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.75,
            textTransform: 'uppercase',
        },
        inherit: {
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            letterSpacing: 'inherit',
        },
    },
    unstable_sxConfig: {
        border: {
            themeKey: 'borders',
        },
        borderTop: {
            themeKey: 'borders',
        },
        borderRight: {
            themeKey: 'borders',
        },
        borderBottom: {
            themeKey: 'borders',
        },
        borderLeft: {
            themeKey: 'borders',
        },
        borderColor: {
            themeKey: 'palette',
        },
        borderTopColor: {
            themeKey: 'palette',
        },
        borderRightColor: {
            themeKey: 'palette',
        },
        borderBottomColor: {
            themeKey: 'palette',
        },
        borderLeftColor: {
            themeKey: 'palette',
        },
        outline: {
            themeKey: 'borders',
        },
        outlineColor: {
            themeKey: 'palette',
        },
        borderRadius: {
            themeKey: 'shape.borderRadius',
        },
        color: {
            themeKey: 'palette',
        },
        bgcolor: {
            themeKey: 'palette',
            cssProperty: 'backgroundColor',
        },
        backgroundColor: {
            themeKey: 'palette',
        },
        p: {},
        pt: {},
        pr: {},
        pb: {},
        pl: {},
        px: {},
        py: {},
        padding: {},
        paddingTop: {},
        paddingRight: {},
        paddingBottom: {},
        paddingLeft: {},
        paddingX: {},
        paddingY: {},
        paddingInline: {},
        paddingInlineStart: {},
        paddingInlineEnd: {},
        paddingBlock: {},
        paddingBlockStart: {},
        paddingBlockEnd: {},
        m: {},
        mt: {},
        mr: {},
        mb: {},
        ml: {},
        mx: {},
        my: {},
        margin: {},
        marginTop: {},
        marginRight: {},
        marginBottom: {},
        marginLeft: {},
        marginX: {},
        marginY: {},
        marginInline: {},
        marginInlineStart: {},
        marginInlineEnd: {},
        marginBlock: {},
        marginBlockStart: {},
        marginBlockEnd: {},
        displayPrint: {
            cssProperty: false,
        },
        display: {},
        overflow: {},
        textOverflow: {},
        visibility: {},
        whiteSpace: {},
        flexBasis: {},
        flexDirection: {},
        flexWrap: {},
        justifyContent: {},
        alignItems: {},
        alignContent: {},
        order: {},
        flex: {},
        flexGrow: {},
        flexShrink: {},
        alignSelf: {},
        justifyItems: {},
        justifySelf: {},
        gap: {},
        rowGap: {},
        columnGap: {},
        gridColumn: {},
        gridRow: {},
        gridAutoFlow: {},
        gridAutoColumns: {},
        gridAutoRows: {},
        gridTemplateColumns: {},
        gridTemplateRows: {},
        gridTemplateAreas: {},
        gridArea: {},
        position: {},
        zIndex: {
            themeKey: 'zIndex',
        },
        top: {},
        right: {},
        bottom: {},
        left: {},
        boxShadow: {
            themeKey: 'shadows',
        },
        width: {},
        maxWidth: {},
        minWidth: {},
        height: {},
        maxHeight: {},
        minHeight: {},
        boxSizing: {},
        fontFamily: {
            themeKey: 'typography',
        },
        fontSize: {
            themeKey: 'typography',
        },
        fontStyle: {
            themeKey: 'typography',
        },
        fontWeight: {
            themeKey: 'typography',
        },
        letterSpacing: {},
        textTransform: {},
        lineHeight: {},
        textAlign: {},
        typography: {
            cssProperty: false,
            themeKey: 'typography',
        },
    },
    mixins: {
        toolbar: {
            minHeight: 56,
            '@media (min-width:0px)': {
                '@media (orientation: landscape)': {
                    minHeight: 48,
                },
            },
            '@media (min-width:600px)': {
                minHeight: 64,
            },
        },
    },
    transitions: {
        easing: {
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
        duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195,
        },
    },
    zIndex: {
        mobileStepper: 1000,
        fab: 1050,
        speedDial: 1050,
        appBar: 1100,
        drawer: 1200,
        modal: 1300,
        snackbar: 1400,
        tooltip: 1500,
    },
    vars: null,
};
