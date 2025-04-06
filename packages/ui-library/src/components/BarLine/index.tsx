import React, { useMemo, useState } from "react";
import { curveLinear } from "@visx/curve";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { useTooltip } from "@visx/tooltip";

import useTheme from "../../hooks/useTheme";
import { ChartWrapper } from "../ChartWrapper";
import CustomBar from "../CustomBar";
import Grid from "../Grid";
import SvgShimmer, { shimmerGradientId } from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import XAxis from "../XAxis";
import YAxis from "../YAxis";
import mockBarLineChartData from "./mockData";
import { BarLineChartProps, BarLineData } from "./types";

const DEFAULT_MARGIN = {
  top: 20,
  right: 60,
  bottom: 50,
  left: 60,
};
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;
const MAX_BAR_WIDTH = 16;
const DEFAULT_BAR_RADIUS = 4;
/**
 * HorizontalBarChart component that renders a simple horizontal bar chart
 */
const BarLineChart: React.FC<BarLineChartProps> = ({
  data: _data,
  margin = DEFAULT_MARGIN,
  title,
  colors: _colors,
  titleProps,
  isLoading = false,
  tooltipProps,
  legendsProps,
  showTicks = false,
  showGrid = true,
  showXAxis = false,
  showYAxis = false,
  yAxisProps,
  xAxisProps,
  gridProps,
  barProps,
  timestampProps,
  timestamp,
}) => {
  const { theme } = useTheme();
  const colors = _colors ?? {
    line: theme.colors.charts.bar[2],
    bar: theme.colors.charts.line[0],
  };
  const [hideChart, setHideChart] = useState<number[]>([]);
  const {
    parentRef,
    width = 100,
    height,
  } = useParentSize({ debounceTime: 150 });
  // Use the provided data, or mock data if loading
  const data = useMemo<BarLineData>(
    () => (isLoading ? mockBarLineChartData : _data),
    [isLoading, _data],
  );

  const { xAxisLabel, yAxisLeftLabel, yAxisRightLabel, chartData } = data;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const xMax = innerWidth;
  const yMax = innerHeight;
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData>();

  // Prepare legend data
  const legendData = useMemo(
    () => [
      { label: yAxisLeftLabel, value: 0 },
      { label: yAxisRightLabel, value: 0 },
    ],
    [yAxisLeftLabel, yAxisRightLabel],
  );

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        padding: 0.4,
        domain: chartData.map((d) => d.xAxis),
      }),
    [chartData, xMax],
  );

  const leftScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [
          0,
          Math.max(...chartData.map((d) => d.yAxisLeft)) * SCALE_PADDING,
        ],
      }),
    [chartData, yMax],
  );

  const rightScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [
          0,
          Math.max(...chartData.map((d) => d.yAxisRight)) * SCALE_PADDING,
        ],
      }),
    [chartData, yMax],
  );

  const handleBarMouseMove =
    (value: number, index: number) => (event: React.MouseEvent) => {
      if (!isLoading) {
        const { yAxisLeft, yAxisRight, xAxis } = chartData[index];

        showTooltip({
          tooltipData: {
            label: xAxis,
            value: `${yAxisLeftLabel} ${yAxisLeft} \n ${yAxisRightLabel} ${yAxisRight}`,
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

  // Calculate circle radius based on bar width
  const defaultBarWidth = xScale.bandwidth();
  const barWidth = Math.min(MAX_BAR_WIDTH, defaultBarWidth);

  // Center the bar if it's smaller than the available space
  const xOffset =
    barWidth < defaultBarWidth ? (defaultBarWidth - barWidth) / 2 : 0;

  // Calculate circle radius for line points - proportional to bar width
  const circleRadius = Math.min(4, barWidth / 4);

  if (chartData.length === 0) return <div>No data to display.</div>;

  return (
    <ChartWrapper
      ref={parentRef}
      title={title}
      titleProps={titleProps}
      legendsProps={{
        data: legendData,
        colorScale: scaleOrdinal({
          domain: legendData.map((d) => d.label),
          range: [colors.bar, colors.line],
        }),
        hovered: hoveredChart,
        setHovered: setHoveredChart,
        isLoading,
        hideIndex: hideChart,
        setHideIndex: setHideChart,
        hideValues: true,
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
          <XAxis
            scale={xScale}
            top={innerHeight}
            isLoading={isLoading}
            showTicks={showTicks}
            showAxisLine={showXAxis}
            labels={chartData.map((d) => String(d.xAxis))}
            availableWidth={innerWidth}
            autoRotate
            label={xAxisLabel}
            labelProps={{
              verticalAnchor: "start",
              fontSize: "13px",
              fontWeight: "bold",
              dy: 60,
            }}
            {...xAxisProps}
          />

          {/* Grid Lines */}
          {showGrid && (
            <Grid
              width={innerWidth}
              yScale={leftScale}
              numTicks={5}
              {...gridProps}
            />
          )}

          {/* bar chart */}
          {hideChart.length && hideChart.includes(0) ? null : (
            <>
              <YAxis
                scale={leftScale}
                hideTicks={!showTicks}
                hideAxisLine={!showYAxis}
                label={yAxisLeftLabel}
                labelProps={{ fontSize: "13px", fontWeight: "bold" }}
                {...yAxisProps}
              />
              {chartData.map((d, index) => {
                const bottomLabel = d.xAxis;
                const barHeight = yMax - (leftScale(d.yAxisLeft) ?? 0);
                const barX = (xScale(bottomLabel) ?? 0) + xOffset;
                const barY = yMax - barHeight;
                const isHovered = hoveredBar === index;
                const barOpacity =
                  (hoveredChart !== null && hoveredChart !== yAxisLeftLabel) ||
                  (hoveredBar !== null && !isHovered)
                    ? REDUCED_OPACITY
                    : DEFAULT_OPACITY;

                const dynamicRadius = Math.min(
                  DEFAULT_BAR_RADIUS,
                  barWidth / 2,
                );

                return (
                  <CustomBar
                    key={`bar-${bottomLabel}`}
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={isLoading ? `url(#${shimmerGradientId})` : colors.bar}
                    opacity={barOpacity}
                    onMouseMove={handleBarMouseMove(d.yAxisLeft, index)}
                    onMouseLeave={handleBarMouseLeave}
                    pathProps={{
                      d: `
                        M ${barX},${barY + barHeight}
                        L ${barX + barWidth},${barY + barHeight}
                        L ${barX + barWidth},${barY + dynamicRadius}
                        Q ${barX + barWidth},${barY} ${barX + barWidth - dynamicRadius},${barY}
                        L ${barX + dynamicRadius},${barY}
                        Q ${barX},${barY} ${barX},${barY + dynamicRadius}
                        L ${barX},${barY + barHeight}
                        Z
                      `,
                    }}
                    {...barProps}
                  />
                );
              })}
            </>
          )}
          {/* line chart */}
          {hideChart.length && hideChart.includes(1) ? null : (
            <>
              <YAxis
                isRightYAxis
                left={innerWidth}
                scale={rightScale}
                hideTicks={!showTicks}
                hideAxisLine={!showYAxis}
                label={yAxisRightLabel}
                labelProps={{ fontSize: "13px", fontWeight: "bold" }}
                tickLabelProps={() => ({
                  fill: theme.colors.axis.label,
                  fontSize: "12px",
                  dx: ".33em",
                  dy: ".33em",
                })}
                {...yAxisProps}
              />

              {chartData.map((d, index) => (
                <circle
                  key={`circle-${index + d.yAxisRight}`}
                  r={circleRadius}
                  cx={(xScale(d.xAxis) ?? 0) + circleRadius * 2 + xOffset}
                  cy={rightScale(d.yAxisRight)}
                  fill={isLoading ? `url(#${shimmerGradientId})` : colors.line}
                  opacity={
                    hoveredChart !== null && hoveredChart !== yAxisRightLabel
                      ? REDUCED_OPACITY
                      : DEFAULT_OPACITY
                  }
                />
              ))}

              <LinePath
                curve={curveLinear}
                data={chartData}
                x={(d) => (xScale(d.xAxis) ?? 0) + circleRadius * 2 + xOffset}
                y={(d) => rightScale(d.yAxisRight)}
                strokeWidth={2}
                strokeOpacity={
                  hoveredChart !== null && hoveredChart !== yAxisRightLabel
                    ? REDUCED_OPACITY
                    : DEFAULT_OPACITY
                }
                stroke={isLoading ? `url(#${shimmerGradientId})` : colors.line}
                shapeRendering="geometricPrecision"
              />
            </>
          )}
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default BarLineChart;
