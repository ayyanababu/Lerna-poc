import { createContext, useState } from 'react';
import ComponentsPage from './Pages/ComponentsPage';
import DashboardPage from './Pages/DashboardPage';

interface IThemeContext {
    mode: 'dark' | 'light';
    setMode: (mode: 'dark' | 'light') => void;
}

export const ThemeContext = createContext<IThemeContext>({
    mode: 'dark',
    setMode: () => {},
});

const App = () => {
    const [mode, setMode] = useState<'dark' | 'light'>('dark');

    return (
        <ThemeContext.Provider value={{ mode, setMode }}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '4px',
                }}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com"></link>
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
                    rel="stylesheet"></link>

                <div
                    style={{
                        flex: '1 1 100%',
                    }}>
                    <DashboardPage />
                </div>

                <div
                    style={{
                        width: '26%',
                    }}>
                    <ComponentsPage />
                </div>
            </div>
        </ThemeContext.Provider>
    );
};
export default App;
