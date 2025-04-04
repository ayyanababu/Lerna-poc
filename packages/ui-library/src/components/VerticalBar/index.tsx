import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { useTooltip } from '@visx/tooltip';
import React, { useMemo, useState } from 'react';

import useTheme from '../../hooks/useTheme';
import ChartWrapper from '../ChartWrapper';
import CustomBar from '../CustomBar';
import Grid from '../Grid';
import SvgShimmer from '../Shimmer/SvgShimmer';
import { TooltipData } from '../Tooltip/types';
import XAxis from '../XAxis';
import YAxis from '../YAxis';
import mockVerticalBarChartData from './mockdata';
import { DataPoint, VerticalBarChartProps } from './types';

const DEFAULT_MARGIN = {
    top: 20,
    right: 30,
    bottom: 50,
    left: 50,
};
const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
    data: _data,
    title,
    margin: initialMargin = DEFAULT_MARGIN,
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

    // Use the provided data, or mock data if loading
    const data = useMemo<DataPoint[]>(
        () => (isLoading ? mockVerticalBarChartData : _data),
        [isLoading, _data],
    );

    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const [hideIndex, setHideIndex] = useState<number[]>([]);

    // Filter out hidden data points
    const filteredData = useMemo(
        () => data.filter((_, index) => !hideIndex.includes(index)),
        [data, hideIndex],
    );

    // We'll calculate a dynamic bottom margin based on whether labels need rotation
    // Add extra margin if there are many labels that will likely be rotated
    const margin = useMemo(() => {
        if (!width) return initialMargin;

        const innerWidth = width - initialMargin.left - initialMargin.right;
        const labels = filteredData.map((d) => String(d.label));

        // Estimate if we'll need extra margin for rotated labels
        const averageCharWidth = 7;
        const totalLabelWidth = labels.join('').length * averageCharWidth;
        const needsRotation = labels.length > 5 || totalLabelWidth >= innerWidth;

        return {
            ...initialMargin,
            bottom: initialMargin.bottom + (needsRotation ? 30 : 0),
        };
    }, [initialMargin, width, filteredData]);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
        useTooltip<TooltipData>();

    // Calculate the maximum value for the y-axis scale
    const maxValue = useMemo(
        () => Math.max(0, ...filteredData.map((d) => Number(d.value) || 0)) * SCALE_PADDING,
        [filteredData],
    );

    // Create scales
    const xScale = useMemo(
        () =>
            scaleBand<string>({
                domain: filteredData.map((d) => String(d.label)),
                range: [0, innerWidth],
                padding: 0.6, // Increased padding for thinner bars
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
                    <YAxis scale={yScale} isLoading={isLoading} {...yAxisProps} />

                    <Grid width={innerWidth} yScale={yScale} {...gridProps} />

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

                        const barWidth = xScale.bandwidth();
                        const barHeight = innerHeight - yScale(value);
                        const barX = xScale(d.label) || 0;
                        const barY = yScale(value);
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
                                    L ${barX + barWidth},${barY + barHeight}
                                    L ${barX + barWidth},${barY + DEFAULT_BAR_RADIUS}
                                    Q ${barX + barWidth},${barY} ${barX + barWidth - DEFAULT_BAR_RADIUS},${barY}
                                    L ${barX + DEFAULT_BAR_RADIUS},${barY}
                                    Q ${barX},${barY} ${barX},${barY + DEFAULT_BAR_RADIUS}
                                    L ${barX},${barY + barHeight}
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

export default VerticalBarChart;
