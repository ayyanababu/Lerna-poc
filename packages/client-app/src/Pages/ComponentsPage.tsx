import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AnnouncementsWidget } from '../components/Cards';
const theme = createTheme({
    /* your theme options */
});

const ComponentsPage = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AnnouncementsWidget />
        </ThemeProvider>
    );
};
export default ComponentsPage;
