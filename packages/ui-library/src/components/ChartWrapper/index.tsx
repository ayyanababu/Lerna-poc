import { Box } from '@mui/material';
import { scaleOrdinal } from '@visx/scale';
import React, { forwardRef, useEffect, useRef } from 'react';
import Legends from '../Legends';
import Timestamp from '../Timestamp';
import Title from '../Title';
import Tooltip from '../Tooltip';
import { ChartWrapperProps } from './types';

const defaultColorScale = scaleOrdinal<string, string>({
    domain: ['default'],
    range: ['#000000'], // Default color (black)
});

const ChartWrapper = forwardRef<HTMLDivElement, ChartWrapperProps>(
    ({ children, title, titleProps, legendsProps, tooltipProps, timestampProps }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const [canRender, setCanRender] = React.useState(true);

        const {
            colorScale = defaultColorScale,
            data: legendData,
            position = 'top',
        } = legendsProps || {};
        const { data: toolTipData } = tooltipProps || {};

        useEffect(() => {
            const checkCanRender = () => {
                const parentElement = containerRef?.current?.parentElement;
                if (!parentElement) {
                    setCanRender(false);
                    return;
                }
                const isParentElementAvailable = !!parentElement;
                const parentRect = parentElement?.getBoundingClientRect();
                const isParentSizeValid = parentRect?.width > 200 && parentRect?.height > 200;

                setCanRender(isParentElementAvailable && isParentSizeValid);
            };

            checkCanRender();

            window.addEventListener('resize', checkCanRender);

            return () => {
                window.removeEventListener('resize', checkCanRender);
            };
        }, []);

        const renderContent = React.useCallback(
            () => (
                <>
                    <Title title={title} {...titleProps} />

                    <Box
                        sx={{
                            position: 'relative',
                            display: 'flex',
                            flex: '1 1 auto',
                            minHeight: 0,
                            gap: '20px',
                            ...(position === 'left' || position === 'right'
                                ? {
                                      flexDirection: position === 'left' ? 'row' : 'row-reverse',
                                  }
                                : {
                                      flexDirection: 'column',
                                  }),
                        }}
                    >
                        <Legends
                            {...legendsProps}
                            position={position}
                            colorScale={colorScale}
                            data={legendData}
                        />

                        <Box
                            ref={ref}
                            sx={{
                                position: 'relative',
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                flex: '1 1 100%',
                                minHeight: 0,
                            }}
                        >
                            {children}
                        </Box>
                    </Box>

                    {toolTipData && <Tooltip {...tooltipProps} data={toolTipData} />}

                    <Timestamp {...timestampProps} />
                </>
            ),
            [
                title,
                titleProps,
                legendsProps,
                tooltipProps,
                timestampProps,
                position,
                colorScale,
                legendData,
                toolTipData,
                children,
                ref,
            ],
        );

        return (
            <Box
                sx={{
                    position: 'relative',
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}
                ref={containerRef}
            >
                {canRender ? renderContent() : <p> Cannot Render the chart under this size</p>}
            </Box>
        );
    },
);

export default ChartWrapper;
