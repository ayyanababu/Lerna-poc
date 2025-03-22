import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { Bar, stack } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { capitalize, cloneDeep, lowerCase } from 'lodash-es';
import { default as React, useMemo, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ChartWrapper } from '../ChartWrapper';
import Grid from '../Grid';
import { HorizontalGroupedBarChartProps } from '../HorizontalGroupedBarChart/types';
import { shimmerClassName } from '../Shimmer/Shimmer';
import SvgShimmer, { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { TooltipData } from '../Tooltip/types';
import { mockVerticalGroupedBarChartData } from '../VerticalGroupedBarChart/mockdata';
import XAxis from '../XAxis';
import YAxis from '../YAxis';
import { DataPoint } from './types';

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
    right: 50,
    bottom: 30,
    left: 120,
};
const DEFAULT_BAR_RADIUS = 5;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;

/**
 * HorizontalStackedBarChart component that renders either grouped or stacked bar charts horizontally
 */
const HorizontalStackedBarChart: React.FC<HorizontalGroupedBarChartProps> = ({
    data: _data,
    groupKeys: _groupKeys,
    type = 'grouped',
    margin = DEFAULT_MARGIN,
    title,
    timestamp,
    colors = [],
    isLoading,
    titleProps,
    legendsProps,
    tooltipProps,
    showTicks = false,
    showGrid = true,
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
        if (type !== 'stacked') return null;

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
    }, [type, activeKeys, filteredData]);

    // Calculate max value for x-axis scale
    const maxValue = useMemo(() => {
        if (type === 'stacked') {
            // For stacked charts, sum all values in each category
            return Math.max(
                0,
                ...filteredData.map((d) =>
                    Object.entries(d.data)
                        .filter(([key]) => activeKeys.includes(key))
                        .reduce((sum, [_, value]) => sum + Number(value || 0), 0),
                ),
            );
        }

        // For grouped charts, find max individual value
        return Math.max(
            0,
            ...filteredData.reduce((values, categoryData) => {
                activeKeys.forEach((key) => {
                    const value = Number(categoryData.data?.[key]);
                    if (!isNaN(value)) {
                        values.push(value);
                    }
                });
                return values;
            }, [] as number[]),
        );
    }, [filteredData, activeKeys, type]);

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

    const groupScale = useMemo(
        () =>
            scaleBand<string>({
                domain: activeKeys,
                range: [0, categoryScale.bandwidth()],
                padding: 0.3, // Increased padding for thinner bars
            }),
        [activeKeys, categoryScale],
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

    // Render bars based on chart type
    const renderBars = () => renderStackedBars();

    // Render stacked bars (horizontal)
    const renderStackedBars = () => {
        return filteredData.map((categoryData, categoryIndex) => {
            const category = String(categoryData.label);
            const barY = categoryScale(category) || 0;
            const barHeight = categoryScale.bandwidth();

            return activeKeys.map((groupKey, groupIndex) => {
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
    };

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
                    <YAxis
                        scale={categoryScale}
                        tickStroke={theme.colors.axis.line}
                        tickComponent={({ formattedValue, ...tickProps }) =>
                            renderAxisLabel(formattedValue, tickProps, isLoading, theme)
                        }
                        hideAxisLine
                        numTicks={innerHeight / 20}
                        hideTicks={!showTicks}
                    />

                    {/* X-Axis (values) */}
                    <XAxis
                        scale={xScale}
                        top={innerHeight}
                        hideTicks={hideIndex.length === groupKeys.length || !showTicks}
                        numTicks={5}
                    />

                    {/* Grid Lines */}
                    {showGrid && (
                        <Grid
                            height={innerHeight}
                            xScale={xScale}
                            showHorizontal={false}
                            showVertical={true}
                            numTicks={5}
                        />
                    )}

                    {/* Bars */}
                    {renderBars()}
                </Group>
            </svg>
        </ChartWrapper>
    );
};

export default HorizontalStackedBarChart;
