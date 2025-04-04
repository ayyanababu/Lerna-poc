import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { useTooltip } from '@visx/tooltip';
import React, { useMemo, useState } from 'react';

import useTheme from '../../hooks/useTheme';
import { ChartWrapper } from '../ChartWrapper';
import CustomBar from '../CustomBar';
import Grid from '../Grid';
import SvgShimmer from '../Shimmer/SvgShimmer';
import { TooltipData } from '../Tooltip/types';
import XAxis from '../XAxis';
import YAxis from '../YAxis';
import { mockHorizontalBarChartData } from './mockdata';
import { DataPoint, HorizontalBarChartProps } from './types';

const DEFAULT_MARGIN = {
    top: 20,
    right: 50,
    bottom: 30,
    left: 100,
};
const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;

/**
 * HorizontalBarChart component that renders a simple horizontal bar chart
 */
const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
    data: _data,
    title,
    margin = DEFAULT_MARGIN,
    colors = [],
    isLoading = false,
    titleProps,
    legendsProps,
    tooltipProps,
    xAxisProps,
    yAxisProps,
    gridProps,
    timestampProps,
    barProps,
}) => {
    const { theme } = useTheme();
    const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const [hideIndex, setHideIndex] = useState<number[]>([]);

    const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
        useTooltip<TooltipData>();

    // Use the provided data, or mock data if loading
    const data = useMemo<DataPoint[]>(
        () => (isLoading ? mockHorizontalBarChartData : _data),
        [isLoading, _data],
    );

    // Filter out hidden data points
    const filteredData = useMemo(
        () => data.filter((_, index) => !hideIndex.includes(index)),
        [data, hideIndex],
    );

    // Calculate the maximum value for the x-axis scale
    const maxValue = useMemo(
        () => Math.max(0, ...filteredData.map((d) => Number(d.value) || 0)) * SCALE_PADDING,
        [filteredData],
    );

    // Create scales
    // For horizontal bars, yScale uses band and xScale uses linear
    const yScale = useMemo(
        () =>
            scaleBand<string>({
                domain: filteredData.map((d) => String(d.label)),
                range: [0, innerHeight],
                padding: 0.6,
                round: true,
            }),
        [filteredData, innerHeight],
    );

    const xScale = useMemo(
        () =>
            scaleLinear<number>({
                domain: [0, maxValue],
                range: [0, innerWidth],
                nice: true,
            }),
        [innerWidth, maxValue],
    );

    // Prepare legend data
    const legendData = useMemo(() => data.map((d) => ({ label: d.label, value: d.value })), [data]);

    // Color scale for the bars
    const colorScale = useMemo(() => {
        if (colors?.length) {
            return (index: number) => colors[index % colors.length];
        }
        return (index: number) => theme.colors.charts.bar[index % theme.colors.charts.bar.length];
    }, [colors, theme.colors.charts.bar]);

    // Handle mouse events
    const handleBarMouseMove = (value: number, index: number) => (event: React.MouseEvent) => {
        if (!isLoading) {
            showTooltip({
                tooltipData: {
                    label: filteredData[index].label,
                    value,
                },
                tooltipLeft: event.clientX,
                tooltipTop: event.clientY,
            });
            setHoveredBar(index);
        }
    };

    const handleBarMouseLeave = () => {
        if (!isLoading) {
            hideTooltip();
            setHoveredBar(null);
        }
    };

    if (!_data || _data.length === 0) {
        return <div>No data to display.</div>;
    }

    return (
        <ChartWrapper
            ref={parentRef}
            title={title}
            titleProps={titleProps}
            legendsProps={{
                data: legendData,
                colorScale: scaleOrdinal({
                    domain: legendData.map((d) => d.label),
                    range: filteredData.map((_, i) => colorScale(i)),
                }),
                hideIndex,
                setHideIndex,
                hovered: hoveredBar !== null ? legendData[hoveredBar]?.label : null,
                setHovered: (label) =>
                    setHoveredBar(legendData.findIndex((item) => item.label === label)),
                isLoading,
                ...legendsProps,
            }}
            tooltipProps={{
                data: tooltipData,
                top: tooltipTop,
                left: tooltipLeft,
                isVisible: !isLoading && tooltipOpen,
                ...tooltipProps,
            }}
            timestampProps={{ isLoading, ...timestampProps }}
        >
            <svg width={width} height={height}>
                {isLoading && <SvgShimmer />}

                <Group top={margin.top} left={margin.left}>
                    <YAxis
                        scale={yScale}
                        isLoading={isLoading}
                        numTicks={innerHeight / 20}
                        {...yAxisProps}
                    />

                    <Grid
                        height={innerHeight}
                        xScale={xScale}
                        showHorizontal={false}
                        showVertical
                        {...gridProps}
                    />

                    <XAxis
                        scale={xScale}
                        top={innerHeight}
                        isLoading={isLoading}
                        availableWidth={innerWidth}
                        {...xAxisProps}
                    />

                    {/* Bars */}
                    {filteredData.map((d, index) => {
                        const value = Number(d.value);
                        if (Number.isNaN(value)) return null;

                        const barWidth = xScale(value);
                        const barHeight = yScale.bandwidth();
                        const barX = 0;
                        const barY = yScale(d.label) || 0;
                        const isHovered = hoveredBar === index;
                        const barOpacity =
                            hoveredBar !== null && !isHovered ? REDUCED_OPACITY : DEFAULT_OPACITY;

                        return (
                            <CustomBar
                                key={`bar-${d.label}`}
                                x={barX}
                                y={barY}
                                width={barWidth}
                                height={barHeight}
                                fill={d.color || colorScale(index)}
                                isLoading={isLoading}
                                opacity={barOpacity}
                                pathProps={{
                                    d: `
                                    M ${barX},${barY + barHeight}
                                    L ${barX + barWidth - DEFAULT_BAR_RADIUS},${barY + barHeight}
                                    Q ${barX + barWidth},${barY + barHeight} ${barX + barWidth},${barY + barHeight - DEFAULT_BAR_RADIUS}
                                    L ${barX + barWidth},${barY + DEFAULT_BAR_RADIUS}
                                    Q ${barX + barWidth},${barY} ${barX + barWidth - DEFAULT_BAR_RADIUS},${barY}
                                    L ${barX},${barY}
                                    Z
                                  `,
                                }}
                                onMouseMove={handleBarMouseMove(value, index)}
                                onMouseLeave={handleBarMouseLeave}
                                {...barProps}
                            />
                        );
                    })}
                </Group>
            </svg>
        </ChartWrapper>
    );
};

export default HorizontalBarChart;
