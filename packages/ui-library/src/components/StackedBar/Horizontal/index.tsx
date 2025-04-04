import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { stack } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { capitalize, cloneDeep, lowerCase } from 'lodash-es';
import React, { useMemo, useState } from 'react';

import useTheme from '../../../hooks/useTheme';
import { ChartWrapper } from '../../ChartWrapper';
import CustomBar from '../../CustomBar';
import Grid from '../../Grid';
import SvgShimmer, { shimmerGradientId } from '../../Shimmer/SvgShimmer';
import { TooltipData } from '../../Tooltip/types';
import XAxis from '../../XAxis';
import YAxis from '../../YAxis';
import { mockHorizontalStackedBarChartData } from './mockdata';
import { DataPoint, HorizontalStackedBarChartProps } from './types';

const DEFAULT_MARGIN = {
    top: 20,
    right: 50,
    bottom: 30,
    left: 120,
};
const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;

/**
 * HorizontalStackedBar component that renders either grouped or stacked bar charts horizontally
 */
const HorizontalStackedBar: React.FC<HorizontalStackedBarChartProps> = ({
    data: _data,
    groupKeys: _groupKeys,
    stackGap = 0,
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

    // State hooks
    const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
    const [hideIndex, setHideIndex] = useState<number[]>([]);

    const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
        useTooltip<TooltipData>();

    // Process data
    const { data, groupKeys } = useMemo<{
        data: DataPoint[];
        groupKeys: string[];
    }>(
        () =>
            isLoading ? mockHorizontalStackedBarChartData : { data: _data, groupKeys: _groupKeys },
        [isLoading, _data, _groupKeys],
    );

    // Filter data based on hidden groups
    const filteredData = useMemo(
        () =>
            data.map((categoryData) => {
                const d = cloneDeep(categoryData);

                if (hideIndex.length > 0) {
                    groupKeys.forEach((groupKey, index) => {
                        if (hideIndex.includes(index) && d.data) {
                            delete d.data[groupKey];
                        }
                    });
                }

                return d;
            }),
        [data, hideIndex, groupKeys],
    );

    // Prepare legend data
    const legendData = useMemo(
        () =>
            groupKeys.map((key) => ({
                label: capitalize(lowerCase(key)),
                value: data.reduce(
                    (total, categoryData) => total + Number(categoryData.data[key] || 0),
                    0,
                ),
            })),
        [groupKeys, data],
    );

    // Get active keys (not hidden)
    const activeKeys = useMemo(
        () => groupKeys.filter((_, index) => !hideIndex.includes(index)),
        [groupKeys, hideIndex],
    );

    // Generate stacked data if chart type is stacked
    const stackedData = useMemo(() => {
        try {
            // Convert data to the format expected by stack generator
            const prepared = filteredData.map((item) => {
                const result: Record<string, number | string> = { label: item.label };
                activeKeys.forEach((key) => {
                    result[key] = Number(item.data[key]) || 0;
                });
                return result;
            });

            // Create stack generator with the active keys
            const stackGenerator = stack({ keys: activeKeys });
            return stackGenerator(prepared);
        } catch (error) {
            console.error('Error generating stack data:', error);
            return [];
        }
    }, [activeKeys, filteredData]);

    // Calculate max value for x-axis scale
    const maxValue = useMemo(
        () =>
            // For stacked charts, sum all values in each category
            Math.max(
                0,
                ...filteredData.map((d) =>
                    Object.entries(d.data)
                        .filter(([key]) => activeKeys.includes(key))
                        .reduce((sum, [_, value]) => sum + Number(value || 0), 0),
                ),
            ),
        [filteredData, activeKeys],
    );

    // Create scales for horizontal orientation
    const yScale = useMemo(
        () =>
            scaleBand<string>({
                domain: filteredData.map((d) => String(d.label)),
                range: [0, innerHeight],
                padding: 0.4, // Increased padding for thinner bars
            }),
        [filteredData, innerHeight],
    );

    const xScale = useMemo(
        () =>
            scaleLinear<number>({
                domain: [0, maxValue * SCALE_PADDING],
                range: [0, innerWidth],
                nice: true,
            }),
        [innerWidth, maxValue],
    );

    const groupColorScale = useMemo(
        () =>
            scaleOrdinal<string, string>({
                domain: groupKeys,
                range: colors?.length ? colors : theme.colors.charts.bar,
            }),
        [groupKeys, colors, theme.colors.charts.bar],
    );

    // Handler for mouse events
    const handleMouseMove = (groupKey: string, value: number) => (event: React.MouseEvent) => {
        if (!isLoading) {
            showTooltip({
                tooltipData: {
                    label: capitalize(lowerCase(groupKey)),
                    value,
                },
                tooltipLeft: event.clientX,
                tooltipTop: event.clientY,
            });
            setHoveredGroupKey(groupKey);
        }
    };

    const handleMouseLeave = () => {
        if (!isLoading) {
            hideTooltip();
            setHoveredGroupKey(null);
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
                colorScale: groupColorScale,
                hideIndex,
                setHideIndex,
                hovered: hoveredGroupKey,
                setHovered: setHoveredGroupKey,
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

                    <XAxis
                        scale={xScale}
                        top={innerHeight}
                        isLoading={isLoading}
                        availableWidth={innerWidth}
                        {...xAxisProps}
                    />

                    <Grid
                        height={innerHeight}
                        xScale={xScale}
                        showHorizontal={false}
                        showVertical
                        isLoading={isLoading}
                        {...gridProps}
                    />

                    {/* Bars */}
                    {filteredData.map((categoryData, categoryIndex) => {
                        const category = String(categoryData.label);
                        const barY = yScale(category) || 0;
                        const barHeight = yScale.bandwidth();

                        // Calculate total value and number of segments with value for this category
                        const segmentsWithValue = activeKeys.filter((key) => {
                            const seriesData = stackedData.find((s) => s.key === key);
                            if (!seriesData || !seriesData[categoryIndex]) return false;
                            const [x0, x1] = seriesData[categoryIndex];
                            return x1 - x0 > 0;
                        });

                        // Calculate total gaps needed and scale factor to ensure we stay within bounds
                        const totalGaps = Math.max(0, segmentsWithValue.length - 1) * stackGap;

                        // Calculate how much we need to scale each bar to accommodate gaps
                        const categoryTotal = activeKeys.reduce(
                            (sum, key) => sum + (Number(categoryData.data[key]) || 0),
                            0,
                        );
                        const scaleFactor =
                            categoryTotal > 0
                                ? (xScale(categoryTotal) - totalGaps) / xScale(categoryTotal)
                                : 1;

                        // Track the current position
                        let currentX = 0;

                        return activeKeys.map((groupKey, idx) => {
                            // Find the corresponding stack data
                            const seriesData = stackedData.find((s) => s.key === groupKey);
                            if (!seriesData || !seriesData[categoryIndex]) return null;

                            const [x0, x1] = seriesData[categoryIndex];
                            const value = x1 - x0;

                            if (!value) return null;

                            // Calculate the scaled width for this segment
                            const originalWidth = xScale(x1) - xScale(x0);
                            const scaledWidth = originalWidth * scaleFactor;

                            // Calculate x position considering previous segments and gaps
                            const barX = idx === 0 ? xScale(x0) : currentX + stackGap;
                            currentX = barX + scaledWidth;

                            const isHoveredGroup = hoveredGroupKey === groupKey;
                            const barOpacity =
                                hoveredGroupKey && !isHoveredGroup
                                    ? REDUCED_OPACITY
                                    : DEFAULT_OPACITY;

                            return (
                                <CustomBar
                                    key={`stacked-${categoryData.label}-${groupKey}`}
                                    x={barX}
                                    y={barY}
                                    width={scaledWidth}
                                    height={barHeight}
                                    fill={
                                        isLoading
                                            ? `url(#${shimmerGradientId})`
                                            : groupColorScale(groupKey)
                                    }
                                    opacity={barOpacity}
                                    pathProps={
                                        activeKeys.length - 1 === idx
                                            ? {
                                                  d: CustomBar.PathProps.getRoundedRight({
                                                      barX,
                                                      barY,
                                                      barHeight,
                                                      barWidth: scaledWidth,
                                                      barRadius: DEFAULT_BAR_RADIUS,
                                                  }),
                                              }
                                            : null
                                    }
                                    onMouseMove={handleMouseMove(groupKey, value)}
                                    onMouseLeave={handleMouseLeave}
                                    {...barProps}
                                />
                            );
                        });
                    })}
                </Group>
            </svg>
        </ChartWrapper>
    );
};

export default HorizontalStackedBar;
