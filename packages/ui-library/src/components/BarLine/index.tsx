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
  top: 0,
  right: 60,
  bottom: 50,
  left: 60,
};
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;
const MAX_BAR_WIDTH = 16;
const DEFAULT_BAR_RADIUS = 4;

const fontSize = 10;
const labelPadding = 8;

function getLabelWidth(label: string) {
  return label ? label.length * fontSize * 0.6 + labelPadding : 0;
}

function getTickWidth(value: number) {
  const formatted = value.toLocaleString();
  return formatted.length * fontSize * 0.6 + labelPadding;
}

const BarLineChart: React.FC<BarLineChartProps> = ({
  data: _data,
  title,
  colors: _colors,
  titleProps,
  isLoading = false,
  barWidth,
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

  const { parentRef, width = 100, height = 100 } = useParentSize({ debounceTime: 150 });

  const data = useMemo<BarLineData>(
    () => (isLoading ? mockBarLineChartData : _data),
    [isLoading, _data]
  );

  const { xAxislabel, yAxisLeftLabel, yAxisRightLabel, chartData } = data;

  const [hideChart, setHideChart] = useState<number[]>([]);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData[]>();

  const leftMax = Math.max(...chartData.map((d) => d.yAxisLeft), 0);
  const rightMax = Math.max(...chartData.map((d) => d.yAxisRight), 0);

  const yAxisLeftTickWidth = getTickWidth(leftMax);
  const yAxisRightTickWidth = getTickWidth(rightMax);
  const yAxisLeftLabelWidth = getLabelWidth(yAxisLeftLabel);
  const yAxisRightLabelWidth = getLabelWidth(yAxisRightLabel);

  const margin = useMemo(() => ({
    ...DEFAULT_MARGIN,
    left: Math.max(DEFAULT_MARGIN.left, yAxisLeftTickWidth + yAxisLeftLabelWidth),
    right: Math.max(DEFAULT_MARGIN.right, yAxisRightTickWidth + yAxisRightLabelWidth),
  }), [DEFAULT_MARGIN, yAxisLeftTickWidth, yAxisRightTickWidth, yAxisLeftLabelWidth, yAxisRightLabelWidth]);

  const drawableWidth = width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right;
  const drawableHeight = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom;

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, drawableWidth],
        padding: 0.4,
        domain: chartData.map((d) => d.xAxis),
      }),
    [drawableWidth, chartData]
  );

  const leftScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [drawableHeight, 0],
        domain: [0, leftMax * SCALE_PADDING],
      }),
    [drawableHeight, leftMax]
  );

  const rightScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [drawableHeight, 0],
        domain: [0, rightMax * SCALE_PADDING],
      }),
    [drawableHeight, rightMax]
  );

  const legendData = useMemo(
    () => [
      { label: yAxisLeftLabel, value: 0 },
      { label: yAxisRightLabel, value: 0 },
    ],
    [yAxisLeftLabel, yAxisRightLabel]
  );

  const defaultBarWidth = xScale.bandwidth();
  const actualBarWidth =
    barWidth !== undefined
      ? barWidth
      : Math.min(defaultBarWidth, MAX_BAR_WIDTH);
  const xOffset =
    actualBarWidth < defaultBarWidth
      ? (defaultBarWidth - actualBarWidth) / 2
      : 0;

  const circleRadius = Math.min(4, actualBarWidth / 4);

  const handleBarMouseMove =
    (value: number, index: number) => (event: React.MouseEvent) => {
      if (!isLoading) {
        const { yAxisLeft, yAxisRight } = chartData[index];
        const toolTipdata = [
          { label: yAxisLeftLabel, value: yAxisLeft, color: colors.bar },
          { label: yAxisRightLabel, value: yAxisRight, color: colors.line },
        ];

        showTooltip({
          tooltipData: toolTipdata,
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
        <Group top={DEFAULT_MARGIN.top} left={DEFAULT_MARGIN.left}>
          <XAxis
            scale={xScale}
            top={drawableHeight}
            isLoading={isLoading}
            showTicks={showTicks}
            showAxisLine={showXAxis}
            labels={chartData.map((d) => String(d.xAxis))}
            availableWidth={drawableWidth}
            label={xAxislabel}
            labelProps={{
              verticalAnchor: "start",
              dy: 60,
            }}
            autoRotate
            forceFullLabels
            {...xAxisProps}
          />

          {showGrid && (
            <Grid
              width={drawableWidth}
              yScale={leftScale}
              numTicks={5}
              {...gridProps}
            />
          )}

          {!hideChart.includes(0) && (
            <>
              <YAxis
                scale={leftScale}
                hideTicks={!showTicks}
                hideAxisLine={!showYAxis}
                label={yAxisLeftLabel}
                {...yAxisProps}
              />
              {chartData.map((d, index) => {
                const barX = (xScale(d.xAxis) ?? 0) + xOffset;
                const barHeight = drawableHeight - (leftScale(d.yAxisLeft) ?? 0);
                const barY = drawableHeight - barHeight;
                const isHovered = hoveredBar === index;
                const barOpacity =
                  (hoveredChart && hoveredChart !== yAxisLeftLabel) ||
                    (hoveredBar !== null && !isHovered)
                    ? REDUCED_OPACITY
                    : DEFAULT_OPACITY;

                const radius = Math.min(DEFAULT_BAR_RADIUS, actualBarWidth / 2);

                return (
                  <CustomBar
                    key={`bar-${d.xAxis}`}
                    x={barX}
                    y={barY}
                    width={actualBarWidth}
                    height={barHeight}
                    fill={isLoading ? `url(#${shimmerGradientId})` : colors.bar}
                    opacity={barOpacity}
                    onMouseMove={handleBarMouseMove(d.yAxisLeft, index)}
                    onMouseLeave={handleBarMouseLeave}
                    pathProps={{
                      d: `
                        M ${barX},${barY + barHeight}
                        L ${barX + actualBarWidth},${barY + barHeight}
                        L ${barX + actualBarWidth},${barY + radius}
                        Q ${barX + actualBarWidth},${barY} ${barX + actualBarWidth - radius},${barY}
                        L ${barX + radius},${barY}
                        Q ${barX},${barY} ${barX},${barY + radius}
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

          {!hideChart.includes(1) && (
            <>
              <YAxis
                isRightYAxis
                left={drawableWidth}
                scale={rightScale}
                hideTicks={!showTicks}
                hideAxisLine={!showYAxis}
                label={yAxisRightLabel}
                textAnchor="start"
                tickLabelProps={() => ({
                  fill: theme.colors.axis.label,
                  dx: ".33em",
                  dy: ".33em",
                })}
                {...yAxisProps}
              />

              {chartData.map((d, index) => (
                <circle
                  key={`circle-${index}`}
                  r={circleRadius}
                  cx={(xScale(d.xAxis) ?? 0) + circleRadius * 2 + xOffset}
                  cy={rightScale(d.yAxisRight)}
                  fill={isLoading ? `url(#${shimmerGradientId})` : colors.line}
                  opacity={
                    hoveredChart && hoveredChart !== yAxisRightLabel
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
                  hoveredChart && hoveredChart !== yAxisRightLabel
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
