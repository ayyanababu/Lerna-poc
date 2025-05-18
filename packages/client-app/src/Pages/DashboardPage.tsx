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
    BarLineData,
} from '@my-org/ui-library';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ThemeContext } from '../App';
import ReconciliationCard from '../components/DashboardPage/ReconciliationCard';
import { fetchDonutData, fetchSemiDonutData, fetchTreeMapData, fetchMarketTreeMapData, fetchStackedBarData, fetchHorizontalStackedData, fetchBarLineData, fetchVerticalBarData, fetchHorizontalBarData, fetchVerticalGroupedBarData, fetchHorizontalGroupedBarData } from '../components/DashboardPage/fetchFunctions';
import { DonutDataItem, TreeMapNode, StackedBarItem, VerticalBarItem } from '../components/DashboardPage/types';


const CAROUSEL_PAGES = 3;

function DashboardPage() {
    const { mode: activeMode, setMode: setActiveMode } =
        useContext(ThemeContext);

    const [activePage, setActivePage] = useState(0);
    const pagesContainerRef = useRef<HTMLDivElement>(null);
    const scrollToPage = (pageIndex: number) => {
        if (pagesContainerRef.current) {    
            const pageWidth = pagesContainerRef.current.clientWidth;
            const scrollPosition = pageWidth * pageIndex;
            pagesContainerRef.current.scrollTo({
                left: scrollPosition,
                behavior: 'smooth',
            });
            setActivePage(pageIndex);
        }
    };

    useEffect(() => {
        const container = pagesContainerRef.current;
        if (!container) return;
        
        let scrollTimer: NodeJS.Timeout | null = null;

        const handleScroll = () => {
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            scrollTimer = setTimeout(() => {
            
                const scrollPosition = container.scrollLeft;
                const pageWidth = container.clientWidth;
                const newActivePage = Math.round(scrollPosition / pageWidth);
                
                if (newActivePage !== activePage) {
                    setActivePage(newActivePage);
                    container.scrollTo({
                        left: newActivePage * pageWidth,
                        behavior: 'smooth',
                    });
                } else {
                    container.scrollTo({
                        left: newActivePage * pageWidth,
                        behavior: 'smooth',
                    });
                }
            }, 1000);
        };
        
        container.addEventListener('scroll', handleScroll);
        
        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (scrollTimer) clearTimeout(scrollTimer);
        };
    }, [activePage]);

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
    const [verticalBarData, setVerticalBarData] = useState<BarLineData>({
        xAxislabel: 'Corporate Action',
        yAxisLeftLabel: 'Number of Actions',
        yAxisRightLabel: 'Positions Impacted',
        chartData: [],
    });

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
console.log("barline",barLineResult)
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
    flex-direction: row;
    overflow-y: hidden;
    overflow-x: auto;
    align-items: start;
}

.container {
    border: 1px solid;
    border-radius: 12px;
    padding: 12px;
    backdrop-filter: blur(40px) saturate(1.5);
    flex: 0 0 100%;
    height: 100%;
    width: 100%;
    min-width: 100%;
    overflow-y: auto;
    box-sizing: border-box;
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

.dot-container {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 20px 0;
}

.dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #407abc;
    cursor: pointer;
    transition: all 0.250s ease-in-out;
    outline:none;
    border: 1px solid #fff;
}
.dot:hover {
    background-color: #f57e52;
    transform: scale(1.2);
}
.dot:active {
    background-color: #f57e52;
    transform: scale(0.8);
}

.dot.active {
    background-color: #f57e52;
    transform: scale(1.2);
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

            <div className="main-container" ref={pagesContainerRef}>
            {[...(new Array(CAROUSEL_PAGES).fill(0))].map((_, index) => (
                <div className="container" key={index}>
                    {
                        <Sortable
                            className="my-cards"
                            styles={{
                                3: {
                                    gridColumn: 'span 1',
                                },
                                6: {
                                    gridColumn: 'span 1',
                                },
                            }}
                            sx={{
                                gridTemplateColumns:
                                    'repeat(3, minmax(0, 1fr))',
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
                                    chartProps={{
                                        variant: 'Bar and Line',
                                    }}
                                    legendsProps={{
                                        position: Legends.Position.BOTTOM,
                                        eachLegendGap: 23,
                                        scrollbarAfter: -1,
                                        legendsHeight: 1,
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
                            <SortableCard height={400} width={'300'}>
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
                                    chartProps={{
                                        variant: 'Vertical Bar',
                                    }}
                                    legendsProps={{
                                        showArrow: true,
                                        position: Legends.Position.BOTTOM,
                                        isVisible: true,
                                        eachLegendGap: 20,
                                        scrollbarAfter: -1,
                                        legendsHeight: 1, // 50% height incase of -1 and if left out 0 it will show all the legends without scrollbar
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
                                        doStrike: false,
                                        isVisible: true,
                                        hideLegendLableClick: false,
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
            ))}
            </div>

            <div className="dot-container">
                {[...(new Array(CAROUSEL_PAGES).fill(0))].map((_, index) => (
                    <button key={index} className={`dot ${activePage === index ? 'active' : ''}`} onClick={() => scrollToPage(index)}></button>
                ))}
            </div>

        </ChartThemeProvider>
    );
}

export default DashboardPage;
