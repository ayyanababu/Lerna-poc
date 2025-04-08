import {
    BarLineChart,
    ChartThemeProvider,
    DonutChart,
    HorizontalBarChart,
    HorizontalGroupedBarChart,
    HorizontalStackedBarChart,
    Legends,
    Sortable,
    SortableCard,
    TreeMapChart,
    VerticalBarChart,
    VerticalGroupedBarChart,
    VerticalStackedBarChart,
} from '@my-org/ui-library';
import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeMode, setActiveMode] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        if (activeMode === 'light') {
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
        }
    }, [activeMode]);

    return (
        <ChartThemeProvider themeMode={activeMode}>
            <>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '10px',
                        margin: '20px 0',
                        padding: '10px',
                        borderRadius: '8px',
                        width: 'fit-content',
                        background:
                            activeMode === 'dark' ? '#2a3854' : '#e8f0fb',
                    }}>
                    <button
                        onClick={() => setActiveMode('light')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            background:
                                activeMode === 'light' ? '#407abc' : '#e0e0e0',
                            color: activeMode === 'light' ? 'white' : '#333',
                            fontWeight:
                                activeMode === 'light' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}>
                        Light
                    </button>
                    <button
                        onClick={() => setActiveMode('dark')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            background:
                                activeMode === 'dark' ? '#407abc' : '#e0e0e0',
                            color: activeMode === 'dark' ? 'white' : '#333',
                            fontWeight:
                                activeMode === 'dark' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}>
                        Dark
                    </button>
                </div>
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
              position: Legends.Position.TOP,

              doStrike: true,
            }}
            tooltipProps={{}}
          />
        </div>
      </div> */}

            {
                <Sortable className="my-cards">
                    {/* Original Donut Chart examples */}
                    <SortableCard title="SemiDonut" height={400} width={400}>
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
                                position: Legends.Position.TOP,
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

                    <SortableCard title="DonutChart" height={400} width={400}>
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
                            title="Trade Status Distribution"
                            timestamp={new Date().toISOString()}
                            colors={['#9bc5ef', '#50c1c2', '#fad176']}
                            isLoading={isLoading}
                            legendsProps={{
                                position: Legends.Position.TOP,
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
                        title="BarLineChart"
                        height={400}
                        width={'100%'}>
                        <BarLineChart
                            data={{
                                xAxisLabel: 'Corporate Action',
                                yAxisLeftLabel: 'Number of Actions',
                                yAxisRightLabel: 'Positions Impacted',
                                chartData: [
                                    {
                                        xAxis: 'Dividend (NNA)',
                                        yAxisLeft: 25,
                                        yAxisRight: 35,
                                    },
                                    {
                                        xAxis: 'Dividend (NCA)',
                                        yAxisLeft: 15,
                                        yAxisRight: 22,
                                    },
                                    {
                                        xAxis: 'Dividend (NEA)',
                                        yAxisLeft: 18,
                                        yAxisRight: 45,
                                    },
                                    {
                                        xAxis: 'Stock Split (NCA)',
                                        yAxisLeft: 22,
                                        yAxisRight: 28,
                                    },
                                    {
                                        xAxis: 'Rights Issue (NCA)',
                                        yAxisLeft: 30,
                                        yAxisRight: 40,
                                    },
                                    {
                                        xAxis: 'Merger (NEA)',
                                        yAxisLeft: 35,
                                        yAxisRight: 25,
                                    },
                                    {
                                        xAxis: 'Tender Offer (NCA)',
                                        yAxisLeft: 42,
                                        yAxisRight: 55,
                                    },
                                ],
                            }}
                            title="Monthly Trade Volume"
                            timestamp={new Date().toISOString()}
                            isLoading={isLoading}
                            titleProps={{
                                variant: 'h6',
                                align: 'left',
                            }}
                            legendsProps={{
                                position: Legends.Position.TOP,
                                doStrike: true,
                                isVisible: false,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>

                    {/* VerticalBarChart example */}
                    <SortableCard
                        title="VerticalBarChart"
                        height={400}
                        width={'100%'}>
                        <VerticalBarChart
                            data={[
                                { label: 'Not Priced', value: 30 },
                                { label: 'Stale Price', value: 45 },
                                {
                                    label: 'Priced/Auto s asdf asdf adfasdfa sdfasdf asdf',
                                    value: 15,
                                },
                                { label: 'Priced/Manual', value: 10 },
                            ]}
                            title="Valuation"
                            colors={[
                                '#AC48C6',
                                '#E88661',
                                '#9FC7E9',
                                '#93a3bc',
                            ]}
                            legendsProps={{
                                position: Legends.Position.BOTTOM,
                                isVisible: true,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>

                    {/* HorizontalBarChart example */}
                    <SortableCard
                        title="HorizontalBarChart"
                        height={400}
                        width={'100%'}>
                        <HorizontalBarChart
                            data={[
                                // Array of 30 values with 30 labels
                                ...Array.from({ length: 10 }, (_, index) => ({
                                    label: `${index + 1} asdf adfasdf a`,
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
                                position: Legends.Position.TOP,
                                doStrike: true,
                                isVisible: false,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>

                    <SortableCard
                        title="VerticalGroupedBarChart"
                        height={400}
                        width={'100%'}>
                        <VerticalGroupedBarChart
                            width={600}
                            height={200}
                            data={[
                                ...new Array(100).fill(0).map((_, index) => ({
                                    label: `Q${index + 1} 2024 asfd asdf asdf asdf asdfa sdf `,
                                    data: {
                                        future:
                                            Math.floor(Math.random() * 100) +
                                            20,
                                        options:
                                            Math.floor(Math.random() * 100) +
                                            20,
                                        forwards:
                                            Math.floor(Math.random() * 100) +
                                            20,
                                        fixedIncome:
                                            Math.floor(Math.random() * 100) +
                                            20,
                                        others:
                                            Math.floor(Math.random() * 100) +
                                            20,
                                    },
                                })),
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

                    {/* VerticalStackedBarChart with stacked type */}
                    <SortableCard
                        title="VerticalStackedBarChart"
                        height={400}
                        width={'100%'}>
                        <VerticalStackedBarChart
                            data={[
                                ...new Array(10).fill(0).map((_, index) => ({
                                    label: `Region ${index + 1}`,
                                    data: {
                                        future:
                                            Math.floor(Math.random() * 100000) +
                                            20,
                                        options:
                                            Math.floor(Math.random() * 100000) +
                                            20,
                                        forwards:
                                            Math.floor(Math.random() * 100000) +
                                            20,
                                        fixedIncome:
                                            Math.floor(Math.random() * 100000) +
                                            20,
                                        others:
                                            Math.floor(Math.random() * 100000) +
                                            20,
                                    },
                                })),
                            ]}
                            groupKeys={[
                                'future',
                                'options',
                                'forwards',
                                'fixedIncome',
                                'others',
                            ]}
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
                                doStrike: false,
                                position: Legends.Position.BOTTOM,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>

                    {/* HorizontalGroupedBarChart with grouped type */}
                    <SortableCard
                        title="Department Performance"
                        height={400}
                        width={'100%'}>
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
                        width={400}>
                        <HorizontalStackedBarChart
                            data={[
                                ...new Array(10).fill(0).map((_, index) => ({
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
                                variant: Legends.Variant.EXPANDED,
                            }}
                            tooltipProps={{}}
                        />
                    </SortableCard>

                    <SortableCard
                        title="Asset Allocation"
                        height={80}
                        width={'100%'}>
                        <TreeMapChart
                            data={{
                                id: 'portfolio',
                                name: 'Portfolio',
                                value: 1000,
                                children: [
                                    {
                                        id: 'equities',
                                        name: 'Equities',
                                        value: 450,
                                        children: [
                                            {
                                                id: 'tech',
                                                name: 'Technology',
                                                value: 180,
                                            },
                                            {
                                                id: 'health',
                                                name: 'Healthcare',
                                                value: 120,
                                            },
                                            {
                                                id: 'finance',
                                                name: 'Financial',
                                                value: 90,
                                            },
                                            {
                                                id: 'consumer',
                                                name: 'Consumer',
                                                value: 60,
                                            },
                                        ],
                                    },
                                    {
                                        id: 'fixed-income',
                                        name: 'Fixed Income',
                                        value: 300,
                                        children: [
                                            {
                                                id: 'treasury',
                                                name: 'Treasury',
                                                value: 120,
                                            },
                                            {
                                                id: 'corporate',
                                                name: 'Corporate',
                                                value: 100,
                                            },
                                            {
                                                id: 'municipal',
                                                name: 'Municipal',
                                                value: 80,
                                            },
                                        ],
                                    },
                                    {
                                        id: 'alternatives',
                                        name: 'Alternatives',
                                        value: 200,
                                        children: [
                                            {
                                                id: 'realestate',
                                                name: 'Real Estate',
                                                value: 100,
                                            },
                                            {
                                                id: 'commodities',
                                                name: 'Commodities',
                                                value: 60,
                                            },
                                            {
                                                id: 'hedge',
                                                name: 'Hedge Funds',
                                                value: 40,
                                            },
                                        ],
                                    },
                                    {
                                        id: 'cash',
                                        name: 'Cash',
                                        value: 50,
                                    },
                                ],
                            }}
                            title="Investment Portfolio Allocation"
                            timestamp={new Date().toISOString()}
                            colors={Array.from(
                                { length: 500 },
                                () => `hsl(${Math.random() * 360}, 100%, 45%)`,
                            )}
                            isLoading={isLoading}
                            titleProps={{
                                variant: 'h6',
                                align: 'left',
                            }}
                            legendsProps={{
                                position: Legends.Position.BOTTOM,
                                doStrike: true,
                            }}
                            tooltipProps={{}}
                            tilePadding={2}
                            borderRadius={5}
                        />
                    </SortableCard>

                    {/* Second TreeMapChart example */}
                    <SortableCard
                        title="Market Analysis"
                        height={500}
                        width={400}>
                        <TreeMapChart
                            data={{
                                id: 'markets',
                                name: 'Global Markets',
                                value: 1000,
                                children: [
                                    {
                                        id: 'north-america',
                                        name: 'North America',
                                        value: 450,
                                        children: [
                                            {
                                                id: 'us',
                                                name: 'United States',
                                                value: 350,
                                            },
                                            {
                                                id: 'canada',
                                                name: 'Canada',
                                                value: 80,
                                            },
                                            {
                                                id: 'mexico',
                                                name: 'Mexico',
                                                value: 20,
                                            },
                                        ],
                                    },
                                    {
                                        id: 'europe',
                                        name: 'Europe',
                                        value: 350,
                                        children: [
                                            {
                                                id: 'uk',
                                                name: 'United Kingdom',
                                                value: 100,
                                            },
                                            {
                                                id: 'germany',
                                                name: 'Germany',
                                                value: 90,
                                            },
                                            {
                                                id: 'france',
                                                name: 'France',
                                                value: 80,
                                            },
                                            {
                                                id: 'others-eu',
                                                name: 'Others',
                                                value: 80,
                                            },
                                        ],
                                    },
                                    {
                                        id: 'asia',
                                        name: 'Asia',
                                        value: 300,
                                        children: [
                                            {
                                                id: 'china',
                                                name: 'China',
                                                value: 130,
                                            },
                                            {
                                                id: 'japan',
                                                name: 'Japan',
                                                value: 90,
                                            },
                                            {
                                                id: 'india',
                                                name: 'India',
                                                value: 50,
                                            },
                                            {
                                                id: 'others-asia',
                                                name: 'Others',
                                                value: 30,
                                            },
                                        ],
                                    },
                                    {
                                        id: 'rest-world',
                                        name: 'Rest of World',
                                        value: 100,
                                        children: [
                                            {
                                                id: 'latam',
                                                name: 'Latin America',
                                                value: 45,
                                            },
                                            {
                                                id: 'africa',
                                                name: 'Africa',
                                                value: 30,
                                            },
                                            {
                                                id: 'oceania',
                                                name: 'Oceania',
                                                value: 25,
                                            },
                                        ],
                                    },
                                ],
                            }}
                            title="Global Market Exposure"
                            timestamp={new Date().toISOString()}
                            colors={[
                                '#407abc',
                                '#50c1c2',
                                '#fad176',
                                '#93a3bc',
                            ]}
                            isLoading={isLoading}
                            titleProps={{
                                variant: 'h6',
                                align: 'left',
                            }}
                            legendsProps={{
                                position: Legends.Position.TOP,
                                doStrike: true,
                            }}
                            tooltipProps={{}}
                            showLabels={true}
                            tilePadding={1}
                        />
                    </SortableCard>
                </Sortable>
            }
        </ChartThemeProvider>
    );
}

export default App;