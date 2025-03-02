import {
  ChartThemeProvider,
  Sortable,
  SortableCard,
  DonutChart,
} from '@my-org/ui-library';
import { useEffect, useState } from 'react';

function App2() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  }, []);

  return (
    <ChartThemeProvider themeMode={activeMode}>
      <>
        <button onClick={() => setActiveMode('light')}>Light</button>
        <button onClick={() => setActiveMode('dark')}>Dark</button>
      </>
      <Sortable className="my-cards">
        <SortableCard title="Trade Capture" height={400} width={'auto'}>
          <DonutChart
            data={[
              { label: 'Successful Trades', value: 85, color: 'orange' },
              { label: 'Failed Trades', value: 15, color: '#50c1c2' },
            ]}
            type="semi"
            hideLabels
            title="Trade Success Rate"
            timestamp={new Date().toISOString()}
            colors={['orange', '#50c1c2']}
            isLoading={isLoading}
            titleProps={{
              variant: 'h6',
              gutterBottom: true,
            }}
            legendsProps={{
              position: 'right',
              onClick: (data, legend, index) => {
                console.log(`Clicked ${legend} at index ${index}`, data);
              },
              doStrike: true,
            }}
            tooltipProps={{}}
          />
        </SortableCard>

        <SortableCard title="Trade Notification" height={400} width={'auto'}>
          <DonutChart
            data={[
              { label: 'Scheduled', value: 60, color: '#9bc5ef' },
              { label: 'Completed', value: 15, color: '#50c1c2' },
              { label: 'Seat', value: 25, color: '#fad176' },
            ]}
            type="full"
            hideLabels={false}
            title="Trade Status Distribution"
            timestamp={new Date().toISOString()}
            colors={['#9bc5ef', '#50c1c2', '#fad176']}
            isLoading={isLoading}
            titleProps={{
              variant: 'subtitle1',
              align: 'center',
            }}
            legendsProps={{
              position: 'left',
              onClick: (data, legend, index) => {
                console.log(`Clicked ${legend} at index ${index}`, data);
              },
              doStrike: true,
            }}
            tooltipProps={{}}
          />
        </SortableCard>
      </Sortable>
    </ChartThemeProvider>
  );
}

export default App2;
