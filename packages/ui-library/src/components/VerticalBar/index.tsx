import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { Bar } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import React, { useMemo, useState } from 'react';

import useTheme from '../../hooks/useTheme';
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
  labels: string[]
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

  const optimalLabelCount = Math.max(2, Math.floor(innerWidth / 15));

  // Always show first and last labels, then distribute the rest evenly
  const averageCharWidth = 7; // estimated width per character (adjust as needed)
  const totalLabelWidth = labels.join("").length * averageCharWidth;
  if (labels.length > optimalLabelCount || totalLabelWidth >= innerWidth) {
    let indicesToShow = [];
    if (labels.length > optimalLabelCount) {
        indicesToShow = [0, labels.length - 1]; // Always include first and last

        const middleLabelsToShow = optimalLabelCount - 2; // Subtract 2 for first and last

        if (middleLabelsToShow > 0 && labels.length > 2) {
            const step = (labels.length - 2) / (middleLabelsToShow + 1);

            // Add evenly spaced indices
            for (let i = 1; i <= middleLabelsToShow; i++) {
                const index = Math.round(step * i); // +1 to skip the first label
                if (index > 0 && index < labels.length - 1) {
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
        if (label.length > 12) {
          return `${label.substring(0, 12)}...`;
        }
        return label;
      },
      rotate: true,
      angle: -45,
      verticalAnchor: "start",
      textAnchor: "end",
      extraBottomMargin: 35
    };
  }

  // For fewer labels, we can show all of them
  if (labels.length <= optimalLabelCount) {
    return {
      tickValues: null,
      formatLabel: (label: string) => {
        if (typeof label !== 'string') return label;
        if (label.length > 12) {
          return `${label.substring(0, 12)}...`;
        }
        return label;
      },
      rotate: false,
      angle: 0,
      verticalAnchor: "middle",
      textAnchor: "middle",
      extraBottomMargin: 15
    };
  }

  // For moderate number of labels
  const indicesToShow = [0, labels.length - 1];
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
    extraBottomMargin: 30
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
    isLoading = false,
    titleProps,
    legendsProps,
    tooltipProps,
    showTicks = false,
    showGrid = true,
    showYAxis = false,
    barProps
}) => {
   
    const { theme } = useTheme();
    const { parentRef, width, height } = useParentSize({ debounceTime: 150 });

    const data = useMemo<DataPoint[]>(
        () => (isLoading ? mockVerticalBarChartData : _data),
        [isLoading, _data],
    );

    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const [hideIndex, setHideIndex] = useState<number[]>([]);

    const filteredData = useMemo(
        () => data.filter((_, index) => !hideIndex.includes(index)),
        [data, hideIndex],
    );

    const { tickValues, formatLabel, rotate, angle, textAnchor, extraBottomMargin } = useMemo(() => {
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
            filteredData.map(d => String(d.label))
        );
    }, [width, filteredData, initialMargin]);

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
    const maxValue = useMemo(() => Math.max(0, ...filteredData.map((d) => Number(d.value) || 0)) * SCALE_PADDING, [filteredData]);

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

    const colorScale = useMemo(
        () => {
            if (colors?.length) {
                return (index: number) => colors[index % colors.length];
            }
            return (index: number) => theme.colors.charts.bar[index % theme.colors.charts.bar.length];
        },
        [colors, theme.colors.charts.bar],
    );

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
    const renderAxisLabel = (formattedValue: string | undefined , tickProps: any, isChartLoading: boolean) => (
        <text
            {...tickProps}
            className={`${isChartLoading ? shimmerClassName : ''}`}
            fill={isChartLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
            style={{
                fontSize: '12px',
            }}
        >
            {isChartLoading ? '' : formattedValue}
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
            <svg width={width} height={height} data-testid="vertical-bar-chart">
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
                            fontSize: '12px',
                            textAnchor: 'end',
                            dy: '0.33em',
                        }}
                        tickComponent={({ formattedValue, ...tickProps }) =>
                            renderAxisLabel(formattedValue, tickProps, isLoading)
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
                        tickValues={tickValues || undefined}
                        tickLabelProps={() => ({
                            fill: theme.colors.axis.label,
                            fontSize: '12px'
                        })}
                        tickComponent={({ formattedValue, ...tickProps }) => {
                            const label = isLoading ? '' : formatLabel(formattedValue ?? '');
                            
                            // Get position for evenly spaced labels if available
                            let xPosition = tickProps.x;
                            
                            if (getEvenlySpacedXPositions && tickValues) {
                                const evenPosition = getEvenlySpacedXPositions.get(formattedValue);
                                if (evenPosition !== undefined) {
                                    xPosition = evenPosition;
                                }
                            }

                            // For rotated labels, use a g element to handle rotation properly
                            if (rotate) {
                                return (
                                    <g transform={`translate(${tickValues?.length !== data.length ? xPosition : tickProps.x},${tickProps.y})`}>
                                        <text
                                            className={isLoading ? shimmerClassName : ''}
                                            fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
                                            style={{
                                                fontSize: '12px',
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
                                <g transform={`translate(${tickProps.x},${tickProps.y})`}>
                                    <text
                                        className={`${isLoading ? shimmerClassName : ''}`}
                                        fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
                                        style={{
                                            fontSize: '12px',
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
                        if (Number.isNaN(value)) return null;

                        const barWidth = xScale.bandwidth();
                        const barHeight = innerHeight - yScale(value);
                        const barX = xScale(d.label) || 0;
                        const barY = yScale(value);
                        const isHovered = hoveredBar === index;
                        const barOpacity = hoveredBar !== null && !isHovered ? REDUCED_OPACITY : DEFAULT_OPACITY;

                        return (
                            <Bar
                                {...barProps}
                                key={`bar-${d.label}`}
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

export { VerticalBarChart };
