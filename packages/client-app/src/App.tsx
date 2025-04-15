import ComponentsPage from './Pages/ComponentsPage';
import DashboardPage from './Pages/DashboardPage';

const App = () => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '4px',
            }}>
            <DashboardPage />

            <div
                style={{
                    width: '40%',
                    minWidth: '361px',
                }}>
                <ComponentsPage />
            </div>
        </div>
    );
};
export default App;
