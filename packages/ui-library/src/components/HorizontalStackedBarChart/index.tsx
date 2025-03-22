import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { stack } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { capitalize, cloneDeep, lowerCase } from 'lodash-es';
import React, { useMemo, useState } from 'react';
import useTheme from '../../hooks/useTheme';
import ChartWrapper from '../ChartWrapper';
import CustomBar from '../CustomBar';
import Grid from '../Grid';
import { HorizontalGroupedBarChartProps } from '../HorizontalGroupedBarChart/types';
import { shimmerClassName } from '../Shimmer/Shimmer';
import SvgShimmer, { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { TooltipData } from '../Tooltip/types';
import { mockVerticalGroupedBarChartData } from '../VerticalGroupedBarChart/mockdata';
import XAxis from '../XAxis';
import YAxis from '../YAxis';
import { DataPoint } from './types';

const DEFAULT_MARGIN = {
    top: 20,
    right: 50,
    bottom: 30,
    left: 120,
};
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;

/**
 * HorizontalStackedBarChart component that renders either grouped or stacked bar charts horizontally
 */
const HorizontalStackedBarChart: React.FC<HorizontalGroupedBarChartProps> = ({
    data: _data,
    groupKeys: _groupKeys,
    margin = DEFAULT_MARGIN,
    title,
    timestamp,
    colors = [],
    isLoading,
    titleProps,
    legendsProps,
    tooltipProps,
    xAxisProps,
    yAxisProps,
    gridProps,
    barProps,
    timestampProps,
    showTicks = false,
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
            isLoading ? mockVerticalGroupedBarChartData : { data: _data, groupKeys: _groupKeys },
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
    const categoryScale = useMemo(
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

    // Hide axis labels when loading
    const renderAxisLabel = (formattedValue: string, tickProps: React.SVGProps<SVGTextElement>) => (
        <text
            {...tickProps}
            className={`${isLoading ? shimmerClassName : ''}`}
            fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
            style={{
                fontSize: '12px',
            }}
        >
            {isLoading ? '' : formattedValue}
        </text>
    );

    const renderStackedBars = () =>
        filteredData.map((categoryData, categoryIndex) => {
            const category = String(categoryData.label);
            const barY = categoryScale(category) || 0;
            const barHeight = categoryScale.bandwidth();

            return activeKeys.map((groupKey) => {
                // Find the corresponding stack data
                const seriesData = stackedData.find((s) => s.key === groupKey);
                if (!seriesData || !seriesData[categoryIndex]) return null;

                const [x0, x1] = seriesData[categoryIndex];
                const barWidth = xScale(x1) - xScale(x0);
                const barX = xScale(x0);
                const value = x1 - x0;

                if (!value) return null;

                const isHoveredGroup = hoveredGroupKey === groupKey;
                const barOpacity =
                    hoveredGroupKey && !isHoveredGroup ? REDUCED_OPACITY : DEFAULT_OPACITY;

                return (
                    <CustomBar
                        key={`stacked-${categoryData.label}-${groupKey}`}
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        fill={isLoading ? `url(#${shimmerGradientId})` : groupColorScale(groupKey)}
                        opacity={barOpacity}
                        rx={0}
                        // value={value}
                        // label={groupKey}
                        onMouseMove={handleMouseMove(groupKey, value)}
                        onMouseLeave={handleMouseLeave}
                        {...barProps}
                    />
                );
            });
        });

    const renderBars = () => renderStackedBars();

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
            timestampProps={{ timestamp, isLoading, ...timestampProps }}
        >
            <svg width={width} height={height}>
                {isLoading && <SvgShimmer />}

                <Group top={margin.top} left={margin.left}>
                    <YAxis
                        scale={categoryScale}
                        tickStroke={theme.colors.axis.line}
                        tickComponent={({ formattedValue, ...tickProps }) =>
                            renderAxisLabel(formattedValue, tickProps)
                        }
                        hideAxisLine
                        numTicks={innerHeight / 20}
                        hideTicks={!showTicks}
                        {...yAxisProps}
                    />

                    <XAxis
                        scale={xScale}
                        top={innerHeight}
                        hideTicks={hideIndex.length === groupKeys.length || !showTicks}
                        numTicks={5}
                        {...xAxisProps}
                    />

                    <Grid
                        height={innerHeight}
                        xScale={xScale}
                        showHorizontal={false}
                        showVertical
                        numTicks={5}
                        {...gridProps}
                    />

                    {/* Bars */}
                    {renderBars()}
                </Group>
            </svg>
        </ChartWrapper>
    );
};

export default HorizontalStackedBarChart;
