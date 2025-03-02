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

        <SortableCard title="Trade Notification" height={400} width={'auto'}>
          <GroupedBarChart
            width={600}
            height={200}
            data={[
              {
                label: 'Q1 2024',
                data: {
                  future: 25,
                  options: 40,
                  forwards: 15,
                  fixedIncome: 12,
                  others: 32,
                },
              },
              {
                label: 'Q2 2024',
                data: {
                  future: 30,
                  options: 1,
                  forwards: 12,
                  fixedIncome: 12,
                  others: 32,
                },
              },
              {
                label: 'Q3 2024',
                data: {
                  future: 15,
                  options: 50,
                  forwards: 1,
                  fixedIncome: 12,
                  others: 32,
                },
              },
              {
                label: 'Q4 2024',
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
            type="grouped"
            margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
            title="Quarterly Trade Distribution"
            timestamp={new Date().toISOString()}
            colors={['#9bc5ef', '#50c1c2', '#fad176', '#407abc', '#93a3bc']}
            isLoading={isLoading}
            titleProps={{
              variant: 'h6',
              align: 'left',
            }}
            legendsProps={{
              direction: 'row',
              onClick: (data, legend, index) => {
                console.log(`Clicked ${legend} at index ${index}`, data);
              },
              doStrike: true,
            }}
            tooltipProps={{}}
          />
        </SortableCard>

        <SortableCard title="Trade Notification" height={400} width={'auto'}>
          <GroupedBarChart
            width={600}
            height={200}
            type="stacked"
            data={[
              {
                label: 'Region A',
                data: {
                  future: 25,
                  options: 40,
                  forwards: 15,
                  fixedIncome: 12,
                  others: 32,
                },
              },
              {
                label: 'Region B',
                data: {
                  future: 30,
                  options: 1,
                  forwards: 12,
                  fixedIncome: 12,
                  others: 32,
                },
              },
              {
                label: 'Region C',
                data: {
                  future: 15,
                  options: 50,
                  forwards: 1,
                  fixedIncome: 12,
                  others: 32,
                },
              },
              {
                label: 'Region D',
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
            margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
            title="Regional Trade Distribution (Stacked)"
            timestamp={new Date().toISOString()}
            colors={['#9bc5ef', '#50c1c2', '#fad176', '#407abc', '#93a3bc']}
            isLoading={isLoading}
            titleProps={{
              variant: 'h6',
              align: 'left',
            }}
            legendsProps={{
              direction: 'row',
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

export default App;