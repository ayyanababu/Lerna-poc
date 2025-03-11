import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { Bar } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import React, { useMemo, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ChartWrapper } from '../ChartWrapper';
import { shimmerClassName } from '../Shimmer/Shimmer';
import SvgShimmer, { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { TooltipData } from '../Tooltip/types';
import { mockVerticalBarChartData } from './mockdata';
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
 * Helper function to determine how to display x-axis labels based on available space
 */
const getXAxisLabelDisplay = (
  innerWidth: number,
  labels: string[],
  fontSize: number = 12
) => {
  // Handle special cases
  if (labels.length <= 1) {
    return {
      tickValues: null,
      formatLabel: (label: string) => label,
      rotate: false,
      angle: 0,
      verticalAnchor: "middle",
      textAnchor: "middle",
      extraBottomMargin: 15
    };
  }

  // Increase the number of labels shown - more aggressive approach
  const optimalLabelCount = Math.max(2, Math.floor(innerWidth / 15));

  // Always show first and last labels, then distribute the rest evenly
  if (labels.length > optimalLabelCount || labels.join("").length >= innerWidth - 225) {
    let indicesToShow = [];
    if (labels.length > optimalLabelCount) {
        // Create array to hold indices of labels to show
        indicesToShow = [0, labels.length - 1]; // Always include first and last

        // Calculate how many middle labels we can show
        const middleLabelsToShow = optimalLabelCount - 2; // Subtract 2 for first and last

        if (middleLabelsToShow > 0 && labels.length > 2) {
            // Calculate step size for even distribution between first and last
            const step = (labels.length - 2) / (middleLabelsToShow + 1);

            // Add evenly spaced indices
            for (let i = 1; i <= middleLabelsToShow; i++) {
                const index = Math.round(step * i); // +1 to skip the first label
                if (index > 0 && index < labels.length - 1) { // Ensure we don't duplicate first/last
                indicesToShow.push(index);
                }
            }
        }

        // Sort indices to maintain order
        indicesToShow.sort((a, b) => a - b);
    } else {
        indicesToShow = labels.map((_, i) => i)
    }

    return {
      // Select labels at the chosen indices
      tickValues: indicesToShow.map(i => labels[i]),
      formatLabel: (label: string) => {
        if (typeof label !== 'string') return label;
        // Allow longer labels
        if (label.length > 12) {
          return `${label.substring(0, 12)}...`;
        }
        return label;
      },
      rotate: true,
      angle: -45,
      verticalAnchor: "start",
      textAnchor: "end",
      extraBottomMargin: 35 // Add extra margin for rotated labels
    };
  }

  // For fewer labels, we can show all of them
  if (labels.length <= optimalLabelCount) {
    return {
      tickValues: null, // Show all ticks
      formatLabel: (label: string) => label,
      rotate: false,
      angle: 0,
      verticalAnchor: "middle",
      textAnchor: "middle",
      extraBottomMargin: 15
    };
  }

  // For moderate number of labels
  const indicesToShow = [0, labels.length - 1]; // Always include first and last
  const middleLabelsToShow = optimalLabelCount - 2;

  if (middleLabelsToShow > 0) {
    const step = (labels.length - 2) / (middleLabelsToShow + 1);
    for (let i = 1; i <= middleLabelsToShow; i++) {
      const index = Math.round(step * i) + 1;
      if (index > 0 && index < labels.length - 1) {
        indicesToShow.push(index);
      }
    }
  }

  indicesToShow.sort((a, b) => a - b);

  return {
    tickValues: indicesToShow.map(i => labels[i]),
    formatLabel: (label: string) => {
      if (typeof label !== 'string') return label;
      // More generous truncation
      if (label.length > 12) {
        return `${label.substring(0, 12)}...`;
      }
      return label;
    },
    rotate: true,
    angle: -30,
    verticalAnchor: "start",
    textAnchor: "end",
    extraBottomMargin: 30 // Add extra margin for rotated labels
  };
};

/**
 * VerticalBarChart component that renders a simple vertical bar chart
 */
const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
    data: _data,
    margin: initialMargin = DEFAULT_MARGIN,
    title,
    timestamp,
    colors = [],
    isLoading,
    titleProps,
    legendsProps,
    tooltipProps,
    showTicks = false,
    showGrid = true,
    showYAxis = false,
    barProps
}) => {
    if (!_data || _data.length === 0) {
        return <div>No data to display.</div>;
    }

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

    // Get label display settings based on chart width and number of labels
    const { tickValues, formatLabel, rotate, angle, verticalAnchor, textAnchor, extraBottomMargin } = useMemo(() => {
        // Default values in case innerWidth is not available yet
        if (!width) {
            return {
                tickValues: null,
                formatLabel: (label: string) => label,
                rotate: false,
                angle: 0,
                verticalAnchor: "middle",
                textAnchor: "middle",
                extraBottomMargin: 0
            };
        }

        const innerWidth = width - initialMargin.left - initialMargin.right;
        return getXAxisLabelDisplay(
            innerWidth,
            filteredData.map(d => String(d.label)),
            parseInt(`${theme.typography.fontSize.small || 12}`)
        );
    }, [width, filteredData, theme.typography.fontSize.small, initialMargin]);

    // Dynamically adjust the margin based on label requirements
    const margin = useMemo(() => ({
        ...initialMargin,
        bottom: initialMargin.bottom + extraBottomMargin
    }), [initialMargin, extraBottomMargin]);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
        useTooltip<TooltipData>();

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

    // Hide axis labels when loading
    const renderAxisLabel = (formattedValue: string, tickProps: any, isLoading: boolean, theme: any) => (
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

    // Calculate positions for evenly spaced labels
    const getEvenlySpacedXPositions = useMemo(() => {
        if (!tickValues || !filteredData.length) return null;
        
        // If showing all labels, let the scale handle it
        if (tickValues === null) return null;
        
        // Create a map of label to position for even spacing
        const positions = new Map();
        const labelCount = tickValues.length;
        
        // Calculate spacing between labels
        if (labelCount > 1) {
            const spacing = innerWidth / (labelCount );
            tickValues.forEach((label, index) => {
                positions.set(label, index * spacing);
            });
        } else if (labelCount === 1) {
            positions.set(tickValues[0], innerWidth / 2);
        }
        
        return positions;
    }, [tickValues, filteredData, innerWidth]);

    return (
        <ChartWrapper
            ref={parentRef}
            title={title}
            titleProps={titleProps}
            legendsProps={{
                data: legendData,
                colorScale: scaleOrdinal({
                    domain: legendData.map(d => d.label),
                    range: filteredData.map((_, i) => colorScale(i))
                }),
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
                {isLoading && <SvgShimmer />}

                <Group top={margin.top} left={margin.left}>
                    {/* Y-Axis */}
                    <AxisLeft
                        scale={yScale}
                        tickFormat={(value) => (isLoading ? '' : `${value}`)}
                        stroke={theme.colors.axis.line}
                        tickStroke={theme.colors.axis.line}
                        tickLabelProps={{
                            fill: theme.colors.axis.label,
                            fontSize: theme.typography.fontSize.small,
                            textAnchor: 'end',
                            dy: '0.33em',
                        }}
                        tickComponent={({ formattedValue, ...tickProps }) =>
                            renderAxisLabel(formattedValue, tickProps, isLoading, theme)
                        }
                        numTicks={5}
                        hideTicks={!showTicks}
                        hideAxisLine={!showYAxis}
                    />

                    {/* Grid Lines */}
                    {showGrid && (
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
                                    opacity={0.5}
                                />
                            ))}
                        </g>
                    )}

                    {/* X-Axis with evenly spaced labels */}
                    <AxisBottom
                        scale={xScale}
                        top={innerHeight}
                        stroke={theme.colors.axis.line}
                        tickStroke={theme.colors.axis.line}
                        tickValues={tickValues}
                        tickLabelProps={() => ({
                            fill: theme.colors.axis.label,
                            fontSize: theme.typography.fontSize.small,
                        })}
                        tickComponent={({ formattedValue, ...tickProps }) => {
                            const label = isLoading ? '' : formatLabel(formattedValue);
                            
                            // Get position for evenly spaced labels if available
                            let xPosition = tickProps.x;
                            
                            // Use even spacing if we're using a subset of labels
                            if (getEvenlySpacedXPositions && tickValues) {
                                const evenPosition = getEvenlySpacedXPositions.get(formattedValue);
                                if (evenPosition !== undefined) {
                                    xPosition = evenPosition;
                                }
                            } else {
                                // Calculate center of the current bar when showing all labels
                                const barWidth = xScale.bandwidth();
                                xPosition = tickProps.x + barWidth / 2;
                            }

                            // For rotated labels, use a g element to handle rotation properly
                            if (rotate) {
                                return (
                                    <g transform={`translate(${xPosition},${tickProps.y})`}>
                                        <text
                                            className={isLoading ? shimmerClassName : ''}
                                            fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
                                            style={{
                                                fontSize: theme.typography.fontSize.small,
                                            }}
                                            textAnchor={textAnchor}
                                            transform={`rotate(${angle})`}
                                            dy="0.5em"
                                            dx="0.32em"
                                        >
                                            {label}
                                        </text>
                                    </g>
                                );
                            }

                            // For non-rotated labels, position with even spacing
                            return (
                                <g transform={`translate(${xPosition},${tickProps.y})`}>
                                    <text
                                        className={`${isLoading ? shimmerClassName : ''}`}
                                        fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
                                        style={{
                                            fontSize: theme.typography.fontSize.small,
                                        }}
                                        textAnchor="middle"
                                        dy="0.71em"
                                    >
                                        {label}
                                    </text>
                                </g>
                            );
                        }}
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
                                {...barProps}
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

