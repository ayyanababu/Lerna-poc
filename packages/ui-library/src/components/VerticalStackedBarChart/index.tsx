import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { Bar, stack } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { capitalize, cloneDeep, lowerCase } from 'lodash-es';
import { default as React, useCallback, useMemo, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ChartWrapper } from '../ChartWrapper';
import Grid from '../Grid';
import { shimmerClassName } from '../Shimmer/Shimmer';
import SvgShimmer, { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { TooltipData } from '../Tooltip/types';
import XAxis from '../XAxis';
import YAxis from '../YAxis';
import { mockVerticalStackedBarChartData } from './mockdata';
import { DataPoint, VerticalStackedBarChartProps } from './types';

interface BarProps {
    key: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
    rx?: number;
    value: number;
    label: string;
    onMouseMove: (event: React.MouseEvent) => void;
    onMouseLeave: () => void;
}

const DEFAULT_MARGIN = {
    top: 20,
    right: 30,
    bottom: 30,
    left: 40,
};
const DEFAULT_BAR_RADIUS = 5;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;

/**
 * VerticalStackedBarChart component that renders either grouped or stacked bar charts vertically
 */
const VerticalStackedBarChart: React.FC<VerticalStackedBarChartProps> = ({
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
    showTicks = false,
    yAxisProps,
    xAxisProps,
    showYAxis = true,
    showGrid = true,
    showXAxis = true,
}) => {
    if (!_data || _data.length === 0) {
        return <div>No data to display.</div>;
    }

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
            isLoading ? mockVerticalStackedBarChartData : { data: _data, groupKeys: _groupKeys },
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
                const result: Record<string, any> = { label: item.label };
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

    // Calculate max value for y-axis scale
    const maxValue = useMemo(() => {
        return Math.max(
            0,
            ...filteredData.map((d) =>
                Object.entries(d.data)
                    .filter(([key]) => activeKeys.includes(key))
                    .reduce((sum, [_, value]) => sum + Number(value || 0), 0),
            ),
        );
    }, [filteredData, activeKeys]);

    // Create scales
    const xScale = useMemo(
        () =>
            scaleBand<string>({
                domain: filteredData.map((d) => String(d.label)),
                range: [0, innerWidth],
                padding: 0.4, // Increased padding for thinner bars
            }),
        [filteredData, innerWidth],
    );

    const groupScale = useMemo(
        () =>
            scaleBand<string>({
                domain: activeKeys,
                range: [0, xScale.bandwidth()],
                padding: 0.3, // Increased padding for thinner bars
            }),
        [activeKeys, xScale],
    );

    const yScale = useMemo(
        () =>
            scaleLinear<number>({
                domain: [0, maxValue * SCALE_PADDING],
                range: [innerHeight, 0],
            }),
        [innerHeight, maxValue],
    );

    const groupColorScale = useMemo(
        () =>
            scaleOrdinal<string, string>({
                domain: groupKeys,
                range: colors?.length ? colors : theme.colors.charts.bar,
            }),
        [groupKeys, colors, theme.colors.charts.bar],
    );

    // Helper function to create bars
    const renderBar = (props: BarProps) => <Bar {...props} />;

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

    // Render stacked bars
    const renderStackedBars = useCallback(() => {
        if (!stackedData) return null;

        return filteredData.map((categoryData, categoryIndex) => {
            const category = String(categoryData.label);
            const barX = xScale(category) || 0;
            const barWidth = xScale.bandwidth();

            return activeKeys.map((groupKey, groupIndex) => {
                // Find the corresponding stack data
                const seriesData = stackedData.find((s) => s.key === groupKey);
                if (!seriesData || !seriesData[categoryIndex]) return null;

                const [y0, y1] = seriesData[categoryIndex];
                const barHeight = yScale(y0) - yScale(y1);
                const barY = yScale(y1);
                const value = y1 - y0;

                if (!value) return null;

                const isHoveredGroup = hoveredGroupKey === groupKey;
                const barOpacity =
                    hoveredGroupKey && !isHoveredGroup ? REDUCED_OPACITY : DEFAULT_OPACITY;

                return renderBar({
                    key: `stacked-${category}-${groupKey}`,
                    x: barX,
                    y: barY,
                    width: barWidth,
                    height: barHeight,
                    fill: isLoading ? `url(#${shimmerGradientId})` : groupColorScale(groupKey),
                    opacity: barOpacity,
                    rx: 0, // Always set to 0 for stacked bars
                    value,
                    label: groupKey,
                    onMouseMove: handleMouseMove(groupKey, value),
                    onMouseLeave: handleMouseLeave,
                });
            });
        });
    }, [
        stackedData,
        filteredData,
        xScale,
        yScale,
        groupColorScale,
        activeKeys,
        hoveredGroupKey,
        isLoading,
    ]);

    // Render bars based on chart type
    const renderBars = useCallback(() => {
        return renderStackedBars();
    }, [stackedData, renderStackedBars]);

    // Hide axis labels when loading
    const renderAxisLabel = (
        formattedValue: string,
        tickProps: any,
        isLoading: boolean,
        theme: any,
    ) => (
        <text
            {...tickProps}
            className={`${isLoading ? shimmerClassName : ''}`}
            fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
            style={{
                fontSize: theme.typography.fontSize.small,
            }}
        >
            {isLoading ? '' : formattedValue}
        </text>
    );

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
            timestampProps={{ timestamp, isLoading }}
        >
            <svg width={width} height={height}>
                {isLoading && <SvgShimmer />}

                <Group top={margin.top} left={margin.left}>
                    {/* Y-Axis */}
                    <YAxis
                        scale={yScale}
                        isLoading={isLoading}
                        showTicks={showTicks}
                        showAxisLine={showYAxis}
                        availableHeight={innerHeight}
                        {...yAxisProps}
                    />

                    {/* Grid Lines */}
                    {showGrid && <Grid width={innerWidth} yScale={yScale} numTicks={5} />}

                    {/* X-Axis with auto-rotating labels */}
                    <XAxis
                        scale={xScale}
                        top={innerHeight}
                        isLoading={isLoading}
                        showTicks={showTicks}
                        showAxisLine={showXAxis}
                        labels={filteredData.map((d) => String(d.label))}
                        availableWidth={innerWidth}
                        autoRotate
                        {...xAxisProps}
                    />

                    {/* Bars */}
                    {renderBars()}
                </Group>
            </svg>
        </ChartWrapper>
    );
};

export default VerticalStackedBarChart;
