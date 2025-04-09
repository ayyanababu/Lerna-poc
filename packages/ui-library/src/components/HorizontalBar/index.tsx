import React, { useMemo, useState } from "react";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";

import useTheme from "../../hooks/useTheme";
import { ChartWrapper } from "../ChartWrapper";
import CustomBar from "../CustomBar";
import Grid from "../Grid";
import SvgShimmer from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import XAxis from "../XAxis";
import YAxis from "../YAxis";
import { mockHorizontalBarChartData } from "./mockdata";
import { DataPoint, HorizontalBarChartProps } from "./types";

const DEFAULT_MARGIN = {
  top: 20,
  right: 20, // Reduced from 50 to 20
  bottom: 20,
  left: 70 // Increased from 50 to 70
};
const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.02; // Reduced from 1.1 to 1.02
const MAX_BAR_HEIGHT = 16; // Bar thickness

interface DynamicMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Helper: measure the widest label in pixels using a hidden <canvas>
 */
function getMaxLabelWidth(labels: string[], font = '10px sans-serif') {
  if (labels.length === 0) return 0;
  // Create an offscreen canvas to measure text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  ctx.font = font;
  let maxWidth = 0;
  labels.forEach((label) => {
    const { width } = ctx.measureText(label);
    if (width > maxWidth) maxWidth = width;
  });
  return maxWidth;
}

/**
 * Truncate label to 15 chars (same logic as YAxis uses),
 * so we measure the same truncated version.
 */
function truncateLabel(rawLabel: string, maxChars = 15) {
  if (rawLabel.length <= maxChars) return rawLabel;
  return `${rawLabel.substring(0, maxChars)}…`;
}

/**
 * HorizontalBarChart component that renders a simple horizontal bar chart
 */
const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
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
  barProps
}) => {
  const { theme } = useTheme();
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);

  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
    useTooltip<TooltipData[]>();

  // Use the provided data, or mock data if loading
  const data = useMemo<DataPoint[]>(
    () => (isLoading ? mockHorizontalBarChartData : _data),
    [isLoading, _data]
  );

  // Filter out hidden data points
  const filteredData = useMemo(
    () => data.filter((_, index) => !hideIndex.includes(index)),
    [data, hideIndex]
  );

  const truncatedLabels = useMemo(
    () => filteredData.map((d) => truncateLabel(String(d.label), 15)),
    [filteredData]
  );

  const maxLabelPx = useMemo(() => {
    if (!truncatedLabels.length) return 0;
    return getMaxLabelWidth(truncatedLabels, '10px sans-serif');
  }, [truncatedLabels]);

  // We'll define a dynamic margin so the Y axis fits well
  const margin = useMemo<DynamicMargin>(() => {
    if (!width) return initialMargin;
    
    // Calculate the desired left margin based on the widest label
    let desiredLeft = maxLabelPx + 20; // Increased padding from 10 to 20
    
    // Ensure it's not excessively wide
    if (desiredLeft > width / 3) {
      desiredLeft = width / 3;
    }
    
    // Ensure the margin is at least as large as the provided initialMargin
    desiredLeft = Math.max(desiredLeft, initialMargin.left);
    
    const showingXAxis = xAxisProps?.isVisible !== false;
    
    const bottomMargin = showingXAxis 
      ? initialMargin.bottom 
      : Math.max(initialMargin.bottom - 10, 10);

    // Use a smaller right margin to give more space to the chart itself
    const rightMargin = Math.min(initialMargin.right, 20);

    return {
      ...initialMargin,
      left: desiredLeft,
      bottom: bottomMargin,
      right: rightMargin
    };
  }, [initialMargin, maxLabelPx, width, xAxisProps]);

  // Chart's inner dimensions
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Calculate the maximum value for the x-axis scale
  const maxValue = useMemo(
    () => Math.max(0, ...filteredData.map((d) => Number(d.value) || 0)) * SCALE_PADDING,
    [filteredData]
  );

  // Create scales
  // For horizontal bars, yScale uses band and xScale uses linear
  const yScale = useMemo(
    () =>
      scaleBand<string>({
        domain: filteredData.map((d) => String(d.label)),
        range: [0, innerHeight],
        padding: 0.4,
        round: true
      }),
    [filteredData, innerHeight]
  );

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue],
        range: [0, innerWidth],
        nice: true
      }),
    [innerWidth, maxValue]
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
  const handleBarMouseMove = (value: number, color: string, index: number) => (event: React.MouseEvent) => {
    if (!isLoading) {
      showTooltip({
        tooltipData: [{
          label: filteredData[index].label,
          value,
          color
        }],
        tooltipLeft: event.clientX,
        tooltipTop: event.clientY
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
          range: filteredData.map((_, i) => colorScale(i))
        }),
        hideIndex,
        setHideIndex,
        hovered: hoveredBar !== null ? legendData[hoveredBar]?.label : null,
        setHovered: (label) => setHoveredBar(legendData.findIndex((item) => item.label === label)),
        isLoading,
        ...legendsProps
      }}
      tooltipProps={{
        data: tooltipData,
        top: tooltipTop,
        left: tooltipLeft,
        isVisible: !isLoading && tooltipOpen,
        ...tooltipProps
      }}
      timestampProps={{ isLoading, ...timestampProps }}
    >
      <svg width={width} height={height}>
        {isLoading && <SvgShimmer />}

        <Group top={margin.top} left={margin.left}>
          <YAxis
            scale={yScale}
            isLoading={isLoading}
            numTicks={filteredData.length}
            showTicks={false}
            {...yAxisProps}
          />

          <Grid
            height={innerHeight}
            xScale={xScale}
            showHorizontal={false}
            showVertical
            isLoading={isLoading}
            {...gridProps}
          />

          <XAxis
            scale={xScale}
            top={innerHeight}
            isLoading={isLoading}
            availableWidth={innerWidth}
            tickLength={0}
            {...xAxisProps}
          />

          {/* Bars */}
          {filteredData.map((d, index) => {
            const value = Number(d.value);
            if (Number.isNaN(value)) return null;

            // Calculate bar "thickness"
            const rawBarHeight = yScale.bandwidth();
            const barHeight = Math.min(rawBarHeight, MAX_BAR_HEIGHT);
            // Center if we clamped
            const bandY = yScale(d.label) || 0;
            const barY = bandY + (rawBarHeight - barHeight) / 2;

            // Bar length
            const barWidth = xScale(value);
            const barX = 0;

            const isHovered = hoveredBar === index;
            const barOpacity =
              hoveredBar !== null && !isHovered ? REDUCED_OPACITY : DEFAULT_OPACITY;

            // Rounded right corners
            const radius = Math.min(DEFAULT_BAR_RADIUS, barHeight / 2, barWidth);
            const pathD = `
                 M ${barX},${barY + barHeight}
                 L ${barX + barWidth - radius},${barY + barHeight}
                 Q ${barX + barWidth},${barY + barHeight} ${barX + barWidth},${
              barY + barHeight - radius
            }
                 L ${barX + barWidth},${barY + radius}
                 Q ${barX + barWidth},${barY} ${barX + barWidth - radius},${barY}
                 L ${barX},${barY}
                 Z
               `;
               const barColor = d.color || colorScale(index);

            return (
              <CustomBar
                key={`bar-${d.label}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={barColor}
                isLoading={isLoading}
                opacity={barOpacity}
                pathProps={{ d: pathD }}
                onMouseMove={handleBarMouseMove(value, barColor, index)}
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

export { HorizontalBarChart };
