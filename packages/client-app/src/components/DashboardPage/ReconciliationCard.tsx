import {
    SortableCard,
    Title,
    HorizontalStackedBarChart,
} from '@my-org/ui-library';
import { useEffect, useState } from 'react';
import { Box, Chip } from '@mui/material';
import { StackedBarItem } from '../../Pages/DashboardPage';

const fetchFirstStackedBarData = (): Promise<StackedBarItem[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    label: 'Portfolio1',
                    data: {
                        break: 1_342,
                        externalMissing: 8_342,
                        internalMissing: 4_342,
                        match: 2_343,
                    },
                },
            ]);
        }, 2000);
    });

const fetchStackedBarData = (): Promise<StackedBarItem[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    label: 'Portfolio1',
                    data: {
                        pendingAnalysis: 4323,
                        pendingReview: 8342,
                        question: 1232,
                        peerApproved: 1232,
                        seniorMgrApproved: 1232,
                        clientToAdvise: 1232,
                        clientAdvised: 1232,
                        prClientToAdvise: 232,
                        notApplicable: 32,
                    },
                },
            ]);
        }, 1800);
    });

export default function ReconciliationCard() {
    const [firstStackedBarData, setFirstStackedBarData] = useState<
        StackedBarItem[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);

    const [stackedBarData, setStackedBarData] = useState<StackedBarItem[]>([]);

    const [isStackedBarLoading, setIsStackedBarLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        fetchFirstStackedBarData().then((data) => {
            setFirstStackedBarData(data);
            setIsLoading(false);
        });
        setIsStackedBarLoading(true);
        fetchStackedBarData().then((data) => {
            setStackedBarData(data);
            setIsStackedBarLoading(false);
        });
    }, []);

    return (
        <SortableCard 
            height={400} 
            width={'100%'}
        >
            <Box
                sx={ {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px',
                    width: '100%',
                    overflowY: 'auto',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}>
                    <Title title="Reconciliation" />

                    <Box
                        sx={{
                            display: 'flex',
                            gap: '8px',
                            width: '100%',
                            overflowX: 'auto',
                        }}>
                        {[
                            'Position',
                            'Cash Rec',
                            'TRS MTM',
                            'TRS Cash',
                            'TRS Payment',
                            'Market Value',
                            'Repo',
                            'FX Positions',
                        ].map((label, index) => (
                            <Chip
                                key={index}
                                label={label}
                                sx={{
                                    alignItems: 'center',
                                    fontWeight: 400,
                                    fontSize: '12px',
                                    lineHeight: '1.4',
                                    letterSpacing: '0.4px',
                                    padding: '0 8px',
                                }}
                                size="small"
                                variant={index === 0 ? 'filled' : 'outlined'}
                                color={index === 0 ? 'primary' : 'default'}
                            />
                        ))}
                    </Box>
                </div>

                <div style={{ height: '60px', width: '100%' }}>
                    <HorizontalStackedBarChart
                        data={firstStackedBarData}
                        groupKeys={['break', 'externalMissing', 'internalMissing', 'match']}
                        colors={[
                            'rgba(232, 134, 97,0.50)',
                            'rgba(232, 134, 97,0.30)',
                            'rgba(232, 134, 97,0.15)',
                            '#4E7AC2',
                        ]}
                        isLoading={isLoading}
                        legendsProps={{
                            position: 'bottom',
                            doStrike: false,
                            isVisible: true,
                        }}
                        maxBarHeight={62}
                        removeBothAxis
                    />
                </div>

                <div style={{ height: '200px', width: '100%' }}>
                    <HorizontalStackedBarChart
                        data={stackedBarData}
                        isLoading={isStackedBarLoading}
                        groupKeys={[
                            'pendingAnalysis',
                            'pendingReview',
                            'question',
                            'peerApproved',
                            'seniorMgrApproved',
                            'clientToAdvise',
                            'clientAdvised',
                            'prClientToAdvise',
                            'notApplicable',
                        ]}
                        legendsProps={{
                            position: 'bottom',
                            doStrike: false,
                            isVisible: true,
                        }}
                        removeBothAxis
                        title="Sign Off Status"
                    />
                </div>
            </Box>
        </SortableCard>
    );
}
