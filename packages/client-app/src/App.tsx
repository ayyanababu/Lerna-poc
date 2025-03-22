import {
    ChartThemeProvider,
    DonutChart,
    HorizontalBarChart,
    HorizontalGroupedBarChart,
    HorizontalStackedBarChart,
    Sortable,
    SortableCard,
    VerticalBarChart,
    VerticalGroupedBarChart,
} from '@my-org/ui-library';
import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeMode, setActiveMode] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    return (
        <ChartThemeProvider themeMode={activeMode}>
            <>
                <button onClick={() => setActiveMode('light')}>Light</button>
                <button onClick={() => setActiveMode('dark')}>Dark</button>
            </>

            {/* <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <div
          style={{
            height: 500,
            width: 500,
          }}>
          <VerticalBarChart
            data={[
              { label: 'January', value: 45, color: '#9bc5ef' },
              { label: 'February', value: 60, color: '#50c1c2' },
              { label: 'March', value: 35, color: '#fad176' },
              { label: 'April', value: 70, color: '#407abc' },
              { label: 'May', value: 55, color: '#93a3bc' },
              { label: 'Jun', value: 40, color: 'orange' },
            ]}
            title="Monthly Trade Volume"
            timestamp={new Date().toISOString()}
            isLoading={isLoading}
            titleProps={{
              variant: 'h6',
              align: 'left',
            }}
            legendsProps={{
              position: 'top',

              doStrike: true,
            }}
            tooltipProps={{}}
          />
        </div>
      </div> */}

            {
                <Sortable className="my-cards">
                    {/* Original Donut Chart examples */}
                    <SortableCard
                        title="Trade Capture"
                        height={400}
                        width={'auto'}>
                        <DonutChart
                            data={[
                                {
                                    label: 'Successful Trades',
                                    value: 85,
                                    color: 'orange',
                                },
                                {
                                    label: 'Failed Trades',
                                    value: 15,
                                    color: '#50c1c2',
                                },
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
                                position: 'top',
                                onClick: (data, legend, index) => {
                                    console.log(
                                        `Clicked ${legend} at index ${index}`,
                                        data,
                                    );
                                },
                                doStrike: true,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>

                    <SortableCard
                        title="Trade Notification"
                        height={400}
                        width={'auto'}>
                        <DonutChart
                            data={[
                                {
                                    label: 'Scheduled',
                                    value: 60,
                                    color: '#9bc5ef',
                                },
                                {
                                    label: 'Completed',
                                    value: 15,
                                    color: '#50c1c2',
                                },
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
                                position: 'top',
                                onClick: (data, legend, index) => {
                                    console.log(
                                        `Clicked ${legend} at index ${index}`,
                                        data,
                                    );
                                },
                                doStrike: true,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>

                    {/* VerticalBarChart example */}
                    <SortableCard
                        title="VerticalBarChart"
                        height={400}
                        width={1000}>
                        <VerticalBarChart
                            data={[
                                ...Array.from({ length: 100 }, (_, index) => ({
                                    // label: `label ${index + 1}`,
                                    label: `${index + 1} January sadf asdf asdf asdf asdfasdf asd asdf asf  `,
                                    value:
                                        Math.floor(
                                            Math.random() * 1000000000000,
                                        ) + 20,
                                })),
                            ]}
                            title="Monthly Trade Volume"
                            timestamp={new Date().toISOString()}
                            isLoading={isLoading}
                            titleProps={{
                                variant: 'h6',
                                align: 'left',
                            }}
                            legendsProps={{
                                position: 'top',
                                doStrike: true,
                                isVisible: false,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>

                    {/* HorizontalBarChart example */}
                    <SortableCard
                        title="HorizontalBarChart"
                        height={400}
                        width={'auto'}>
                        <HorizontalBarChart
                            data={[
                                // Array of 30 values with 30 labels
                                ...Array.from({ length: 100 }, (_, index) => ({
                                    label: `${index + 1} Product`,
                                    value: Math.floor(Math.random() * 100),
                                })),
                            ]}
                            title="Product Sales Distribution"
                            timestamp={new Date().toISOString()}
                            isLoading={isLoading}
                            titleProps={{
                                variant: 'h6',
                                align: 'left',
                            }}
                            legendsProps={{
                                position: 'top',
                                doStrike: true,
                                isVisible: false,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>

                    <SortableCard
                        title="Quarterly Trade Distribution"
                        height={400}
                        width={'auto'}>
                        <VerticalGroupedBarChart
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
                            margin={{
                                top: 20,
                                right: 30,
                                bottom: 30,
                                left: 40,
                            }}
                            title="Quarterly Trade Distribution"
                            timestamp={new Date().toISOString()}
                            colors={[
                                '#9bc5ef',
                                '#50c1c2',
                                '#fad176',
                                '#407abc',
                                '#93a3bc',
                            ]}
                            isLoading={isLoading}
                            titleProps={{
                                variant: 'h6',
                                align: 'left',
                            }}
                            legendsProps={{
                                onClick: (data, legend, index) => {
                                    console.log(
                                        `Clicked ${legend} at index ${index}`,
                                        data,
                                    );
                                },
                                doStrike: true,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>

                    {/* VerticalGroupedBarChart with stacked type */}
                    <SortableCard
                        title="Regional Trade Distribution"
                        height={400}
                        width={'auto'}>
                        <VerticalGroupedBarChart
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
                            margin={{
                                top: 20,
                                right: 30,
                                bottom: 30,
                                left: 40,
                            }}
                            title="Regional Trade Distribution (Stacked)"
                            timestamp={new Date().toISOString()}
                            colors={[
                                '#9bc5ef',
                                '#50c1c2',
                                '#fad176',
                                '#407abc',
                                '#93a3bc',
                            ]}
                            isLoading={isLoading}
                            titleProps={{
                                variant: 'h6',
                                align: 'left',
                            }}
                            legendsProps={{
                                onClick: (data, legend, index) => {
                                    console.log(
                                        `Clicked ${legend} at index ${index}`,
                                        data,
                                    );
                                },
                                doStrike: true,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>

                    {/* HorizontalGroupedBarChart with grouped type */}
                    <SortableCard
                        title="Department Performance"
                        height={400}
                        width={'auto'}>
                        <HorizontalGroupedBarChart
                            width={600}
                            height={200}
                            type="grouped"
                            data={[
                                {
                                    label: 'Sales',
                                    data: {
                                        q1: 45,
                                        q2: 60,
                                        q3: 38,
                                        q4: 72,
                                    },
                                },
                                {
                                    label: 'Marketing',
                                    data: {
                                        q1: 35,
                                        q2: 42,
                                        q3: 53,
                                        q4: 48,
                                    },
                                },
                                {
                                    label: 'Operations',
                                    data: {
                                        q1: 52,
                                        q2: 48,
                                        q3: 45,
                                        q4: 60,
                                    },
                                },
                                {
                                    label: 'Finance',
                                    data: {
                                        q1: 30,
                                        q2: 32,
                                        q3: 36,
                                        q4: 40,
                                    },
                                },
                            ]}
                            groupKeys={['q1', 'q2', 'q3', 'q4']}
                            margin={{
                                top: 20,
                                right: 50,
                                bottom: 30,
                                left: 120,
                            }}
                            title="Quarterly Department Performance"
                            timestamp={new Date().toISOString()}
                            colors={[
                                '#9bc5ef',
                                '#50c1c2',
                                '#fad176',
                                '#407abc',
                            ]}
                            isLoading={isLoading}
                            titleProps={{
                                variant: 'h6',
                                align: 'left',
                            }}
                            legendsProps={{
                                onClick: (data, legend, index) => {
                                    console.log(
                                        `Clicked ${legend} at index ${index}`,
                                        data,
                                    );
                                },
                                doStrike: true,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>

                    {/* HorizontalStackedBarChart with stacked type */}
                    <SortableCard
                        title="HorizontalStackedBarChart"
                        height={400}
                        width={'auto'}>
                        <HorizontalStackedBarChart
                            width={600}
                            height={200}
                            type="stacked"
                            data={[
                                ...new Array(100).fill(0).map((_, index) => ({
                                    label: `${index + 1} Team Beta`,
                                    data: {
                                        payroll:
                                            Math.floor(Math.random() * 50000) +
                                            20000,
                                        equipment:
                                            Math.floor(Math.random() * 15000) +
                                            5000,
                                        software:
                                            Math.floor(Math.random() * 10000) +
                                            3000,
                                        travel:
                                            Math.floor(Math.random() * 6000) +
                                            2000,
                                    },
                                })),
                            ]}
                            groupKeys={[
                                'payroll',
                                'equipment',
                                'software',
                                'travel',
                            ]}
                            margin={{
                                top: 20,
                                right: 50,
                                bottom: 30,
                                left: 120,
                            }}
                            title="Budget Allocation by Team (Stacked)"
                            timestamp={new Date().toISOString()}
                            colors={[
                                '#9bc5ef',
                                '#50c1c2',
                                '#fad176',
                                '#407abc',
                            ]}
                            isLoading={isLoading}
                            titleProps={{
                                variant: 'h6',
                                align: 'left',
                            }}
                            legendsProps={{
                                onClick: (data, legend, index) => {
                                    console.log(
                                        `Clicked ${legend} at index ${index}`,
                                        data,
                                    );
                                },
                                doStrike: true,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>
                </Sortable>
            }
        </ChartThemeProvider>
    );
}

export default App;