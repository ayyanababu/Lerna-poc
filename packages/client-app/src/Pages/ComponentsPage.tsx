import { ThemeProvider } from '@mui/material';
import { useContext, useState } from 'react'; // Import useState
import { ThemeContext } from '../App';
import Announcements from '../components/announcements/Announcements';
import darkTheme from '../themeUtils/colors/default/dark';
import lightTheme from '../themeUtils/colors/default/light';
import { AnnouncementsWidget } from '../components/Cards';

const ComponentsPage = () => {
    const { mode } = useContext(ThemeContext);
    const [showWidget, setShowWidget] = useState(false); 

    const toggleWidget = () => {
        setShowWidget(!showWidget);
    };

    return (
        <>
            <ThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
                <Announcements />
            </ThemeProvider>

            {/* Add button to toggle visibility */}
            <button onClick={toggleWidget}>
                {showWidget ? 'Hide' : 'Show'} Announcements Widget
            </button>

            {/* Conditionally render the widget */}
            {showWidget && (
                <ThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
                    <AnnouncementsWidget />
                </ThemeProvider>
            )}
        </>
    );
};
export default ComponentsPage;
