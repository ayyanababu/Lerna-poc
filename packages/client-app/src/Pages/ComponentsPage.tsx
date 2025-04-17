import { ThemeProvider } from '@mui/material';
import { useContext } from 'react';
import { ThemeContext } from '../App';
import Announcements from '../components/announcements/Announcements';
import darkTheme from '../themeUtils/colors/default/dark';
import lightTheme from '../themeUtils/colors/default/light';
import { AnnouncementsWidget } from '../components/Cards';

const ComponentsPage = () => {
    const { mode } = useContext(ThemeContext);

    return (
        <>
            <ThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
                <Announcements />
            </ThemeProvider>

            <ThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
                <AnnouncementsWidget />
            </ThemeProvider>
        </>
    );
};
export default ComponentsPage;
