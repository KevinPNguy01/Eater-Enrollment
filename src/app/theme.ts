import createTheme, { ThemeOptions } from "@mui/material/styles/createTheme";

const theme = createTheme();
export const themeOptions: ThemeOptions = createTheme(theme, {
    palette: {
        mode: 'light',
        primary: {
            main: '#008000',
        },
        secondary: {
            main: '#0080ff',
        },
        background: {
            default: '#303030',
            paper: '#404040',
        },
        text: {
            primary: 'rgba(255,255,255,0.95)',
            secondary: 'rgba(255,255,255,0.85)',
            disabled: 'rgba(255,255,255,0.75)',
        },
        info: {
            main: '#808080',
        },
        white: theme.palette.augmentColor({ color: { main: "#fff" } }),
        black: theme.palette.augmentColor({ color: { main: "#000" } }),
        action: {
            disabledBackground: '#808080',
            disabled: '#808080'
        }
    },

    typography: {
        button: {
            textTransform: 'none'
        }
    }
});

declare module "@mui/material/styles" {
    interface Palette {
        white: string;
        black: string;
    }
    interface PaletteOptions {
        white: string;
        black: string;
    }
}

declare module "@mui/material/Button" {
    interface ButtonPropsColorOverrides {
        white: true;
        black: true;
    }
}

declare module "@mui/material/IconButton" {
    interface IconButtonPropsColorOverrides {
        white: true;
        black: true;
    }
}