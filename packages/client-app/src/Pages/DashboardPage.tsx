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
import { useContext, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from '../App';
import ReconciliationCard from '../components/DashboardPage/ReconciliationCard';

// Define types for our chart data
type DonutDataItem = {
    label: string;
    value: number;
    color: string;
};

type TreeMapNode = {
    id: string;
    name: string;
    value: number;
    children?: TreeMapNode[];
};

export type StackedBarItem = {
    label: string;
    data: Record<string, number>;
};

type BarLineDataItem = {
    xAxis: string;
    yAxisLeft: number;
    yAxisRight: number;
};

type BarLineData = {
    xAxislabel: string;
    yAxisLeftLabel: string;
    yAxisRightLabel: string;
    chartData: BarLineDataItem[];
};

type VerticalBarItem = {
    label: string;
    value: number;
};

// Mock API functions to simulate data fetching
const fetchDonutData = (): Promise<DonutDataItem[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    label: 'Successful',
                    value: Math.floor(Math.random() * 30000) + 20000,
                    color: '#56b9b8',
                },
                {
                    label: 'Failed',
                    value: Math.floor(Math.random() * 500) + 100,
                    color: '#ea8660',
                },
            ]);
        }, 5000);
    });

const fetchSemiDonutData = (): Promise<DonutDataItem[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    label: 'Successful Trades',
                    value: Math.floor(Math.random() * 30) + 70, // 70-100% success rate
                    color: 'orange',
                },
                {
                    label: 'Failed Trades',
                    value: Math.floor(Math.random() * 30), // 0-30% failure rate
                    color: '#50c1c2',
                },
            ]);
        }, 1200);
    });

const fetchTreeMapData = (): Promise<TreeMapNode> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: 'portfolio',
                name: 'Portfolio',
                value: 1000,
                children: [
                    {
                        id: 'equities',
                        name: 'Equities',
                        value: Math.floor(Math.random() * 200) + 350, // 350-550
                        children: [
                            {
                                id: 'tech',
                                name: 'Technology',
                                value: Math.floor(Math.random() * 80) + 140, // 140-220
                            },
                            {
                                id: 'health',
                                name: 'Healthcare',
                                value: Math.floor(Math.random() * 50) + 100, // 100-150
                            },
                        ],
                    },
                    {
                        id: 'fixed-income',
                        name: 'Fixed Income',
                        value: Math.floor(Math.random() * 100) + 250, // 250-350
                        children: [
                            {
                                id: 'treasury',
                                name: 'Treasury',
                                value: Math.floor(Math.random() * 50) + 100, // 100-150
                            },
                            {
                                id: 'corporate',
                                name: 'Corporate',
                                value: Math.floor(Math.random() * 40) + 80, // 80-120
                            },
                        ],
                    },
                    {
                        id: 'cash',
                        name: 'Cash',
                        value: Math.floor(Math.random() * 150) + 300, // 300-450
                    },
                ],
            });
        }, 2000);
    });

const fetchStackedBarData = (): Promise<StackedBarItem[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    label: 'Not Priced',
                    data: {
                        notPriced: Math.floor(Math.random() * 100000000) + 2000,
                    },
                },
                {
                    label: 'Stale Priced sdf sdf  sdfsf ',
                    data: {
                        stalePriced:
                            Math.floor(Math.random() * 100000000) + 2500,
                    },
                },
                {
                    label: 'Priced',
                    data: {
                        'priced:Auto':
                            Math.floor(Math.random() * 2000000000) + 200,
                        'priced:Manual':
                            Math.floor(Math.random() * 500000000) + 30,
                    },
                },
            ]);
        }, 1800);
    });

const fetchHorizontalStackedData = (): Promise<StackedBarItem[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                ...new Array(1).fill(0).map(() => {
                    const randomDate = new Date(
                        2020 + Math.floor(Math.random() * 4),
                        Math.floor(Math.random() * 12),
                        Math.floor(Math.random() * 28) + 1,
                    );
                    const formattedDate = `${String(randomDate.getDate()).padStart(2, '0')}-${String(randomDate.getMonth() + 1).padStart(2, '0')}-${randomDate.getFullYear()}`;

                    return {
                        label: `${formattedDate}`,
                        data: {
                            futures:
                                Math.floor(Math.random() * 100) + 0,
                            options:
                                Math.floor(Math.random() * 100) + 0,
                            forwards:
                                Math.floor(Math.random() * 100) + 0,
                            fixedIncome:
                                Math.floor(Math.random() * 100) + 0,
                            others: Math.floor(Math.random() * 100) + 0,
                        },
                    };
                }),
            ]);
        }, 1700);
    });

const fetchBarLineData = (): Promise<BarLineData> =>
    new Promise((resolve) => {
        setTimeout(() => {
            const actionTypes = [
                'Dividend (NNA) test this test',
                'Dividend (NCA)',
                'Dividend (NEA)',
  //              'Stock Split (NCA)',
  //              'Rights Issue (NCA)',
  //              'Merger (NEA)',
  //              'Tender Offer (NCA)',
            ];

            resolve({
                xAxislabel: 'Corporate Action',
                yAxisLeftLabel: 'Number of Actions',
                yAxisRightLabel: 'Positions Impacted',
                chartData: actionTypes.map((action, index) => ({
                    xAxis: action,
                    yAxisLeft: Math.floor(Math.random() * 300000000) + 15, // 15-45
                    yAxisRight: Math.floor(Math.random() * 350000000) + 20, // 20-55
                    barColor: index == 0 ? 'red' : null,
                })),
            });
        }, 2200);
    });

const fetchVerticalBarData = (): Promise<VerticalBarItem[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { label: 'Priced', value: 123 },
                { label: 'Priced Beta', value: 2450 },
                { label: 'Priced Gamma', value: 367000000 },
                { label: 'Priced Delta', value: 489000000 },
                { label: 'Priced Epsilon', value: 511000000 },
                { label: 'Priced Zeta', value: 633000000 },
                { label: 'Priced Eta', value: 755000000 },
                { label: 'Priced Theta', value: 877000000 },
                { label: 'Priced Iota', value: 921000000 },
                { label: 'Priced Kappa', value: 999000000 }
              ]
              );
        }, 1300);
    });

const fetchHorizontalBarData = (): Promise<VerticalBarItem[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(
                Array.from({ length: 5 }, (_, index) => ({
                    label: `${index + 1} asdf adfasdf a`,
                    value: Math.floor(Math.random() * 100000),
                })),
            );
        }, 1600);
    });

const fetchVerticalGroupedBarData = (): Promise<StackedBarItem[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                ...new Array(10).fill(0).map((_, index) => ({
                    label: `Q${index + 1} 2024`,
                    data: {
                        future: Math.floor(Math.random() * 10000000) + 20,
                        options: Math.floor(Math.random() * 10000000) + 20,
                        forwards: Math.floor(Math.random() * 10000000) + 20,
                        fixedIncome: Math.floor(Math.random() * 10000000) + 20,
                        others: Math.floor(Math.random() * 10000000) + 20,
                    },
                })),
            ]);
        }, 1900);
    });

const fetchHorizontalGroupedBarData = (): Promise<StackedBarItem[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    label: 'Sales',
                    data: {
                        q1: Math.floor(Math.random() * 30000000) + 30, // 30-60
                        q2: Math.floor(Math.random() * 30000000) + 40, // 40-70
                        q3: Math.floor(Math.random() * 30000000) + 30, // 30-60
                        q4: Math.floor(Math.random() * 30000000) + 60, // 60-90
                    },
                },
                {
                    label: 'Marketing',
                    data: {
                        q1: Math.floor(Math.random() * 20) + 25, // 25-45
                        q2: Math.floor(Math.random() * 20) + 35, // 35-55
                        q3: Math.floor(Math.random() * 20) + 45, // 45-65
                        q4: Math.floor(Math.random() * 20) + 40, // 40-60
                    },
                },
                {
                    label: 'Operations',
                    data: {
                        q1: Math.floor(Math.random() * 20) + 40, // 40-60
                        q2: Math.floor(Math.random() * 20) + 40, // 40-60
                        q3: Math.floor(Math.random() * 20) + 40, // 40-60
                        q4: Math.floor(Math.random() * 20) + 50, // 50-70
                    },
                },
                {
                    label: 'Finance',
                    data: {
                        q1: Math.floor(Math.random() * 15) + 25, // 25-40
                        q2: Math.floor(Math.random() * 15) + 25, // 25-40
                        q3: Math.floor(Math.random() * 15) + 30, // 30-45
                        q4: Math.floor(Math.random() * 15) + 35, // 35-50
                    },
                },
            ]);
        }, 1400);
    });

const fetchMarketTreeMapData = (): Promise<TreeMapNode> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: 'markets',
                name: 'Global Markets',
                value: 1000,
                children: [
                    {
                        id: 'north-america',
                        name: 'North America',
                        value: Math.floor(Math.random() * 100) + 400, // 400-500
                        children: [
                            {
                                id: 'us',
                                name: 'United States',
                                value: Math.floor(Math.random() * 50) + 300, // 300-350
                            },
                            {
                                id: 'canada',
                                name: 'Canada',
                                value: Math.floor(Math.random() * 20) + 70, // 70-90
                            },
                            {
                                id: 'mexico',
                                name: 'Mexico',
                                value: Math.floor(Math.random() * 10) + 15, // 15-25
                            },
                        ],
                    },
                    {
                        id: 'europe',
                        name: 'Europe',
                        value: Math.floor(Math.random() * 50) + 300, // 300-350
                        children: [
                            {
                                id: 'uk',
                                name: 'United Kingdom',
                                value: Math.floor(Math.random() * 30) + 85, // 85-115
                            },
                            {
                                id: 'germany',
                                name: 'Germany',
                                value: Math.floor(Math.random() * 20) + 80, // 80-100
                            },
                            {
                                id: 'france',
                                name: 'France',
                                value: Math.floor(Math.random() * 20) + 70, // 70-90
                            },
                            {
                                id: 'others-eu',
                                name: 'Others',
                                value: Math.floor(Math.random() * 20) + 70, // 70-90
                            },
                        ],
                    },
                    {
                        id: 'asia',
                        name: 'Asia',
                        value: Math.floor(Math.random() * 50) + 250, // 250-300
                        children: [
                            {
                                id: 'china',
                                name: 'China',
                                value: Math.floor(Math.random() * 30) + 115, // 115-145
                            },
                            {
                                id: 'japan',
                                name: 'Japan',
                                value: Math.floor(Math.random() * 20) + 80, // 80-100
                            },
                            {
                                id: 'india',
                                name: 'India',
                                value: Math.floor(Math.random() * 15) + 40, // 40-55
                            },
                            {
                                id: 'others-asia',
                                name: 'Others',
                                value: Math.floor(Math.random() * 10) + 25, // 25-35
                            },
                        ],
                    },
                    {
                        id: 'rest-world',
                        name: 'Rest of World',
                        value: Math.floor(Math.random() * 30) + 85, // 85-115
                        children: [
                            {
                                id: 'latam',
                                name: 'Latin America',
                                value: Math.floor(Math.random() * 15) + 35, // 35-50
                            },
                            {
                                id: 'africa',
                                name: 'Africa',
                                value: Math.floor(Math.random() * 10) + 25, // 25-35
                            },
                            {
                                id: 'oceania',
                                name: 'Oceania',
                                value: Math.floor(Math.random() * 10) + 20, // 20-30
                            },
                        ],
                    },
                ],
            });
        }, 2500);
    });

function DashboardPage() {
    const { mode: activeMode, setMode: setActiveMode } =
        useContext(ThemeContext);

    // State for chart data with proper typing
    const [donutData, setDonutData] = useState<DonutDataItem[]>([]);
    const [semiDonutData, setSemiDonutData] = useState<DonutDataItem[]>([]);
    const [treeMapData, setTreeMapData] = useState<TreeMapNode>({
        id: 'portfolio',
        name: 'Portfolio',
        value: 1000,
        children: [],
    });
    const [marketTreeMapData, setMarketTreeMapData] = useState<TreeMapNode>({
        id: 'markets',
        name: 'Global Markets',
        value: 1000,
        children: [],
    });
    const [stackedBarData, setStackedBarData] = useState<StackedBarItem[]>([]);
    const [horizontalStackedData, setHorizontalStackedData] = useState<
        StackedBarItem[]
    >([]);
    const [barLineData, setBarLineData] = useState<BarLineData>({
        xAxislabel: 'Corporate Action',
        yAxisLeftLabel: 'Number of Actions',
        yAxisRightLabel: 'Positions Impacted',
        chartData: [],
    });
    const [verticalBarData, setVerticalBarData] = useState<VerticalBarItem[]>(
        [],
    );
    const [horizontalBarData, setHorizontalBarData] = useState<
        VerticalBarItem[]
    >([]);
    const [verticalGroupedBarData, setVerticalGroupedBarData] = useState<
        StackedBarItem[]
    >([]);
    const [horizontalGroupedBarData, setHorizontalGroupedBarData] = useState<
        StackedBarItem[]
    >([]);

    // Track loading state for each chart
    const [dataLoading, setDataLoading] = useState({
        donut: true,
        semiDonut: true,
        treeMap: true,
        marketTreeMap: true,
        stackedBar: true,
        horizontalStacked: true,
        barLine: true,
        verticalBar: true,
        horizontalBar: true,
        verticalGroupedBar: true,
        horizontalGroupedBar: true,
    });

    const isAllLoading = useMemo(
        () => Object.values(dataLoading).some((loading) => loading),
        [dataLoading],
    );

    // Fetch data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data for all charts in parallel
                const [
                    donutResult,
                    semiDonutResult,
                    treeMapResult,
                    marketTreeMapResult,
                    stackedBarResult,
                    horizontalStackedResult,
                    barLineResult,
                    verticalBarResult,
                    horizontalBarResult,
                    verticalGroupedBarResult,
                    horizontalGroupedBarResult,
                ] = await Promise.all([
                    fetchDonutData(),
                    fetchSemiDonutData(),
                    fetchTreeMapData(),
                    fetchMarketTreeMapData(),
                    fetchStackedBarData(),
                    fetchHorizontalStackedData(),
                    fetchBarLineData(),
                    fetchVerticalBarData(),
                    fetchHorizontalBarData(),
                    fetchVerticalGroupedBarData(),
                    fetchHorizontalGroupedBarData(),
                ]);

                // Update state with fetched data
                setDonutData(donutResult);
                setSemiDonutData(semiDonutResult);
                setTreeMapData(treeMapResult);
                setMarketTreeMapData(marketTreeMapResult);
                setStackedBarData(stackedBarResult);
                setHorizontalStackedData(horizontalStackedResult);
                setBarLineData(barLineResult);
                setVerticalBarData(verticalBarResult);
                setHorizontalBarData(horizontalBarResult);
                setVerticalGroupedBarData(verticalGroupedBarResult);
                setHorizontalGroupedBarData(horizontalGroupedBarResult);
            } catch (error) {
                console.error('Error fetching chart data:', error);
            } finally {
                // Set all loading states to false
                setDataLoading({
                    donut: false,
                    semiDonut: false,
                    treeMap: false,
                    marketTreeMap: false,
                    stackedBar: false,
                    horizontalStacked: false,
                    barLine: false,
                    verticalBar: false,
                    horizontalBar: false,
                    verticalGroupedBar: false,
                    horizontalGroupedBar: false,
                });
            }
        };

        fetchData();
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
                <style>
                    {`body {
    padding: 8px;
}

body:not(.dark) {
    background-color: #f0f9ff;
}

.dark body {
    background-color: #1e293b;
}

.blur-circle {
    position: fixed;
    width: 350px;
    height: 350px;
    border-radius: 50%;
    background-color: #bfe8fd;
    filter: blur(75px);
    opacity: 0.7;
    z-index: -1;
}

.blur-circle.top {
    top: -150px;
    left: 90vw;
}

.blur-circle.bottom {
    bottom: -200px;
    left: 20vw;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.container {
    border: 1px solid;
    border-radius: 12px;
    padding: 12px;
    backdrop-filter: blur(40px) saturate(1.5);
    margin: auto;
}

.container:not(.dark) {
    border-color: #f0f8fe;
    background-color: #f0f8feaa;
    box-shadow: 0 0 20px #bfe8fd55;
}

.dark .container {
    border-color: #ffffff11;
    background-color: #1e293bcc;
    box-shadow: 0 0 20px #bfe8fd11;
}

.my-cards {
    max-width: 1920px;
    margin: 0 auto;

    .card-body {
        height: 350px;
        width: 100%;
    }
}
`}
                </style>

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

                    <button
                        onClick={() =>
                            setDataLoading((prev) => {
                                const keys = Object.keys(prev);

                                return keys.reduce(
                                    (acc, key) => {
                                        // @ts-expect-error this is a workaround
                                        acc[key] = !prev[keys[0]];
                                        return acc;
                                    },
                                    {} as typeof prev,
                                );
                            })
                        }
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isAllLoading ? '#e07200' : '#e0e0e0',
                            color: isAllLoading ? 'white' : '#333',
                            fontWeight: isAllLoading ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}>
                        {isAllLoading ? 'Stop' : 'Start'} Loading
                    </button>
                </div>

                <div className="blur-circle top"></div>
                <div className="blur-circle bottom"></div>
            </>

            <div className="main-container">
                <div className="container">
                    {
                        <Sortable className="my-cards" styles={{
                            3: {
                                gridColumn: 'span 1',
                            },
                            6: {
                                gridColumn: 'span 1',
                            }
                        }}>
                            <SortableCard height={400} width={'100%'}>
                                <DonutChart
                                    data={donutData}
                                    type="full"
                                    title="Transaction Capture"
                                    isLoading={dataLoading.donut}
                                />
                            </SortableCard>

                            <SortableCard height={400} width={'100%'}>
                                <VerticalStackedBarChart
                                    data={stackedBarData}
                                    groupKeys={[
                                        'notPriced',
                                        'stalePriced',
                                        'priced:Auto',
                                        'priced:Manual',
                                    ]}
                                    title="Valuation"
                                    colors={[
                                        '#a4266e',
                                        '#f57e52',
                                        '#4774b9',
                                        '#9ac7ea',
                                    ]}
                                    isLoading={dataLoading.stackedBar}
                                    showYAxis={false}
                                    showXAxis={false}
                                    maxBarWidth={230}
                                />
                            </SortableCard>

                            <SortableCard height={200} width={'100%'}>
                                <HorizontalStackedBarChart
                                    data={horizontalStackedData}
                                    groupKeys={[
                                        'futures',
                                        'options',
                                        'forwards',
                                        'fixedIncome',
                                        'others',
                                    ]}
                                    title="Expiry and Settlements"
                                    colors={[
                                        '#a0c8e9',
                                        '#56b9b8',
                                        '#f2ce7a',
                                        '#4e79bb',
                                        '#9aa4b3',
                                    ]}
                                    isLoading={dataLoading.horizontalStacked}
                                    maxBarHeight={32}
                                    removeBothAxis
                                />
                            </SortableCard>

                            <SortableCard height={400} width={'100%'}>
                                <BarLineChart
                                    data={barLineData}
                                    title="Monthly Trade Volume"
                                    timestamp={new Date().toISOString()}
                                    isLoading={dataLoading.barLine}
                                    titleProps={{
                                        variant: 'h6',
                                        align: 'left',
                                    }}
                                    legendsProps={{
                                        position: Legends.Position.BOTTOM,
                                        doStrike: true,
                                        isVisible: true,
                                    }}
                                    tooltipProps={{}}
                                    maxBarWidth={32}
                                />
                            </SortableCard>

                            <SortableCard height={400} width={'100%'}>
                                <DonutChart
                                    data={semiDonutData}
                                    type="semi"
                                    hideLabels
                                    title="Trade Success Rate"
                                    timestamp={new Date().toISOString()}
                                    colors={['orange', '#50c1c2']}
                                    isLoading={dataLoading.semiDonut}
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


                            {/* VerticalBarChart example */}
                            <SortableCard height={400} width={'100%'}>
                                <VerticalBarChart
                                    data={verticalBarData}
                                    title="Valuation"
                                    colors={[
                                        '#AC48C6',
                                        '#E88661',
                                        '#9FC7E9',
                                        '#93a3bc',
                                    ]}
                                    isLoading={dataLoading.verticalBar}
                                    legendsProps={{
                                        position: Legends.Position.BOTTOM,
                                        isVisible: true,
                                        eachLegendGap: 23,
                                        scrollbarAfter: 3,
                                        legendsHeight:0.5, // 50% height incase of -1 and if left out 0 it will show all the legends without scrollbar
                                        onClick: (data, legend, index) => {
                                            console.log(
                                                `Clicked ${legend} at index ${index}`,
                                                data,
                                            );
                                        },
                                    }}
                                    tooltipProps={{}}
                                />
                            </SortableCard>

                            <ReconciliationCard />

                            {/* HorizontalBarChart example */}
                            <SortableCard height={400} width={'100%'}>
                                <HorizontalBarChart
                                    data={horizontalBarData}
                                    isLoading={dataLoading.horizontalBar}
                                    titleProps={{
                                        variant: 'h6',
                                        align: 'left',
                                    }}
                                    maxBarHeight={160}
                                    title={'Trade Volume'}
                                    legendsProps={{
                                        position: Legends.Position.BOTTOM,
                                        doStrike: true,
                                        isVisible: true,
                                    }}
                                    tooltipProps={{}}
                                />
                            </SortableCard>

                            <SortableCard height={400} width={'100%'}>
                                <VerticalGroupedBarChart
                                    width={600}
                                    height={200}
                                    data={verticalGroupedBarData}
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
                                    isLoading={dataLoading.verticalGroupedBar}
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
                            <SortableCard height={400} width={'100%'}>
                                <HorizontalGroupedBarChart
                                    width={600}
                                    height={200}
                                    type="grouped"
                                    data={horizontalGroupedBarData}
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
                                    isLoading={dataLoading.horizontalGroupedBar}
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

                            <SortableCard height={400} width={'100%'}>
                                <TreeMapChart
                                    data={treeMapData}
                                    title="Investment Portfolio Allocation"
                                    timestamp={new Date().toISOString()}
                                    colors={Array.from(
                                        { length: 500 },
                                        () =>
                                            `hsl(${Math.random() * 360}, 100%, 45%)`,
                                    )}
                                    isLoading={dataLoading.treeMap}
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
                            <SortableCard height={400} width={'100%'}>
                                <TreeMapChart
                                    data={marketTreeMapData}
                                    title="Global Market Exposure"
                                    timestamp={new Date().toISOString()}
                                    colors={[
                                        '#407abc',
                                        '#50c1c2',
                                        '#fad176',
                                        '#93a3bc',
                                    ]}
                                    isLoading={dataLoading.marketTreeMap}
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
                </div>
            </div>
        </ChartThemeProvider>
    );
}

export default DashboardPage;
