import {
  ChartThemeProvider,
  DonutChart,
  GroupedBarChart,
  Sortable,
  SortableCard,
} from '@my-org/ui-library';
import { useEffect, useState } from 'react';
import './App.css';

function App() {
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
              { label: 'Failed Trades', value: 15 },
            ]}
            type="semi"
            hideLabels
            timestamp={new Date().toISOString()}
            isLoading={isLoading}
          />
        </SortableCard>

        <SortableCard title="Trade Notification" height={400} width={'auto'}>
          <DonutChart
            data={[
              { label: 'Scheduled', value: 60 },
              { label: 'Completed', value: 15 },
              { label: 'Seat', value: 25 },
            ]}
            timestamp={new Date().toISOString()}
            hideLabels
            isLoading={isLoading}
          />
        </SortableCard>

        <SortableCard title="Trade Notification" height={400} width={'auto'}>
          <GroupedBarChart
            width={600}
            height={200}
            data={[
              {
                label: 'Aasdfasdf asd',
                data: {
                  future: 25,
                  options: 40,
                  forwards: 15,
                  fixedIncome: 12,
                  others: 32,
                },
              },
              {
                label: 'Basdfasdf asd',
                data: {
                  future: 30,
                  options: 1,
                  forwards: 12,
                  fixedIncome: 12,
                  others: 32,
                },
              },
              {
                label: 'Casdfasdf asd',
                data: {
                  future: 15,
                  options: 50,
                  forwards: 1,
                  fixedIncome: 12,
                  others: 32,
                },
              },
              {
                label: 'Dasdfasdf asd',
                data: {
                  future: 40,
                  options: 35,
                  forwards: 10,
                  fixedIncome: 12,
                  others: 32,
                },
              },
            ]}
            groupKeys={[
              'future',
              'options',
              'forwards',
              'fixedIncome',
              'others',
            ]}
            timestamp={new Date().toISOString()}
            isLoading={isLoading}
          />
        </SortableCard>

        <SortableCard title="Trade Notification" height={400} width={'auto'}>
          <GroupedBarChart
            width={600}
            height={200}
            type="stacked"
            data={[
              {
                label: 'Aasdfasdf asd',
                data: {
                  future: 25,
                  options: 40,
                  forwards: 15,
                  fixedIncome: 12,
                  others: 32,
                },
              },
              {
                label: 'Basdfasdf asd',
                data: {
                  future: 30,
                  options: 1,
                  forwards: 12,
                  fixedIncome: 12,
                  others: 32,
                },
              },
              {
                label: 'Casdfasdf asd',
                data: {
                  future: 15,
                  options: 50,
                  forwards: 1,
                  fixedIncome: 12,
                  others: 32,
                },
              },
              {
                label: 'Dasdfasdf asd',
                data: {
                  future: 40,
                  options: 35,
                  forwards: 10,
                  fixedIncome: 12,
                  others: 32,
                },
              },
            ]}
            groupKeys={[
              'future',
              'options',
              'forwards',
              'fixedIncome',
              'others',
            ]}
            timestamp={new Date().toISOString()}
            isLoading={isLoading}
          />
        </SortableCard>
      </Sortable>
    </ChartThemeProvider>
  );
}

export default App;