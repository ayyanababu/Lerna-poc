import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import React, { useMemo, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ChartWrapper } from '../ChartWrapper';
import { shimmerClassName } from '../Shimmer/Shimmer';
import SvgShimmer, { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { TooltipData } from '../Tooltip/types';
import { DataPoint, VerticalBarChartProps } from './types';

const DEFAULT_MARGIN = {
    top: 20,
    right: 30,
    bottom: 50,
    left: 50,
};
const DEFAULT_BAR_RADIUS = 5;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;

/**
 * VerticalBarChart component that renders a simple vertical bar chart
 */
const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
    data: _data,
    margin = DEFAULT_MARGIN,
    title,
    timestamp,
    colors = [],
    isLoading,
    titleProps,
    legendsProps,
    tooltipProps,
    showTicks = false,
}) => {
    if (!_data || _data.length === 0) {
        return <div>No data to display.</div>;
    }

    const { theme } = useTheme();
    const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const [hideIndex, setHideIndex] = useState<number[]>([]);

    const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
        useTooltip<TooltipData>();

    // Use the provided data, or empty array if loading
    const data = useMemo<DataPoint[]>(
        () => (isLoading ? [] : _data),
        [isLoading, _data],
    );

    // Filter out hidden data points
    const filteredData = useMemo(
        () => data.filter((_, index) => !hideIndex.includes(index)),
        [data, hideIndex],
    );

    // Calculate the maximum value for the y-axis scale
    const maxValue = useMemo(() => {
        return Math.max(0, ...filteredData.map((d) => Number(d.value) || 0)) * SCALE_PADDING;
    }, [filteredData]);

    // Create scales
    const xScale = useMemo(
        () =>
            scaleBand<string>({
                domain: filteredData.map((d) => String(d.label)),
                range: [0, innerWidth],
                padding: 0.4,
                round: true,
            }),
        [filteredData, innerWidth],
    );

    const yScale = useMemo(
        () =>
            scaleLinear<number>({
                domain: [0, maxValue],
                range: [innerHeight, 0],
                nice: true,
            }),
        [innerHeight, maxValue],
    );

    // Prepare legend data
    const legendData = useMemo(
        () => data.map((d) => ({ label: d.label, value: d.value })),
        [data],
    );

    // Color scale for the bars
    const colorScale = useMemo(
        () => {
            if (colors?.length) {
                return (index: number) => colors[index % colors.length];
            }
            return (index: number) => theme.colors.charts.bar[index % theme.colors.charts.bar.length];
        },
        [colors, theme.colors.charts.bar],
    );

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

    return (
        <ChartWrapper
            ref={parentRef}
            title={title}
            titleProps={titleProps}
            legendsProps={{
                data: legendData,
                colorScale: (_, index) => colorScale(index),
                hideIndex,
                setHideIndex,
                hovered: hoveredBar !== null ? legendData[hoveredBar]?.label : null,
                setHovered: (label) => setHoveredBar(legendData.findIndex(item => item.label === label)),
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
            timestampProps={{ timestamp, isLoading }}
        >
            <svg width={width} height={height}>
                <SvgShimmer />

                <Group top={margin.top} left={margin.left}>
                    {/* Y-Axis */}
                    <AxisLeft
                        scale={yScale}
                        tickFormat={(value) => `${value}`}
                        stroke={theme.colors.axis.line}
                        tickStroke={theme.colors.axis.line}
                        tickLabelProps={{
                            fill: theme.colors.axis.label,
                            fontSize: theme.typography.fontSize.small,
                            textAnchor: 'end',
                            dy: '0.33em',
                        }}
                        tickComponent={({ formattedValue, ...tickProps }) => (
                            <text
                                {...tickProps}
                                className={`${isLoading ? shimmerClassName : ''}`}
                                fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
                                style={{
                                    fontSize: theme.typography.fontSize.small,
                                }}
                            >
                                {formattedValue}
                            </text>
                        )}
                        numTicks={5}
                        hideTicks={!showTicks}
                    />

                    {/* Grid Lines */}
                    <g>
                        {yScale.ticks(5).map((tick) => (
                            <line
                                key={tick}
                                x1={0}
                                x2={innerWidth}
                                y1={yScale(tick)}
                                y2={yScale(tick)}
                                stroke={theme.colors.axis.grid}
                                strokeDasharray="2,2"
                                opacity={0.3}
                            />
                        ))}
                    </g>

                    {/* X-Axis */}
                    <AxisBottom
                        scale={xScale}
                        top={innerHeight}
                        stroke={theme.colors.axis.line}
                        tickStroke={theme.colors.axis.line}
                        tickLabelProps={{
                            fill: theme.colors.axis.label,
                            fontSize: theme.typography.fontSize.small,
                            textAnchor: 'middle',
                            dy: '0.33em',
                        }}
                        tickComponent={({ formattedValue, ...tickProps }) => (
                            <text
                                {...tickProps}
                                className={`${isLoading ? shimmerClassName : ''}`}
                                fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
                                style={{
                                    fontSize: theme.typography.fontSize.small,
                                }}
                            >
                                {formattedValue}
                            </text>
                        )}
                        hideTicks={!showTicks}
                    />

                    {/* Bars */}
                    {filteredData.map((d, index) => {
                        const value = Number(d.value);
                        if (isNaN(value)) return null;

                        const barWidth = xScale.bandwidth();
                        const barHeight = innerHeight - yScale(value);
                        const barX = xScale(d.label) || 0;
                        const barY = yScale(value);
                        const isHovered = hoveredBar === index;
                        const barOpacity = hoveredBar !== null && !isHovered ? REDUCED_OPACITY : DEFAULT_OPACITY;

                        return (
                            <Bar
                                key={`bar-${d.label}-${index}`}
                                x={barX}
                                y={barY}
                                width={barWidth}
                                height={barHeight}
                                fill={isLoading ? `url(#${shimmerGradientId})` : d.color || colorScale(index)}
                                opacity={barOpacity}
                                rx={DEFAULT_BAR_RADIUS}
                                onMouseMove={handleBarMouseMove(value, index)}
                                onMouseLeave={handleBarMouseLeave}
                            />
                        );
                    })}
                </Group>
            </svg>
        </ChartWrapper>
    );
};

export default VerticalBarChart;