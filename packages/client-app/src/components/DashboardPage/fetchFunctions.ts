import { BarLineData } from "@my-org/ui-library";
import { DonutDataItem, TreeMapNode, StackedBarItem, VerticalBarItem } from "./types";


// Mock API functions to simulate data fetching
export const fetchDonutData = (): Promise<DonutDataItem[]> =>
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

export const fetchSemiDonutData = (): Promise<DonutDataItem[]> =>
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

export const fetchTreeMapData = (): Promise<TreeMapNode> =>
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

export const fetchStackedBarData = (): Promise<StackedBarItem[]> =>
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

export const fetchHorizontalStackedData = (): Promise<StackedBarItem[]> =>
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

export const fetchBarLineData = (): Promise<BarLineData> =>
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

export const fetchVerticalBarData = (): Promise<BarLineData> =>
    new Promise((resolve) => {
        setTimeout(() => {
            const actionTypes = [           
                { label: 'Priced hahf  shs fsh s   sdh dsh   h ds fhsf sh', value: 123 },
                { label: 'Priced', value: 2450 },
                { label: 'Priced', value: 36700 },
                { label: 'Priced', value: 48900 },
                { label: 'Priced Epsilon', value: 511000000 },
                { label: 'Priced Zeta', value: 633000000 },
                { label: 'Priced Eta', value: 755000000 },
                { label: 'Priced Theta', value: 877000000 },
                { label: 'Priced Iota', value: 921000000 },
                { label: 'Priced Kappa', value: 999000000 }
            ]            
            resolve({
                xAxislabel: 'Corporate Action - no line',
                yAxisLeftLabel: 'Number of Actions - no line',
                yAxisRightLabel: 'Positions Impacted no line',
                chartData: actionTypes.map((action, index) => ({
                    xAxis: action.label,
                    yAxisLeft: action.value, // 15-45
                    yAxisRight: undefined,
                    barColor: index == 0 ? 'red' : null,
                })),
            });
        }, 1300);
    });

export const fetchHorizontalBarData = (): Promise<VerticalBarItem[]> =>
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

export const fetchVerticalGroupedBarData = (): Promise<StackedBarItem[]> =>
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

export const fetchHorizontalGroupedBarData = (): Promise<StackedBarItem[]> =>
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

export const fetchMarketTreeMapData = (): Promise<TreeMapNode> =>
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