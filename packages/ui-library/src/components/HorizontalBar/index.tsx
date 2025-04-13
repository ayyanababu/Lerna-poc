import React, { useMemo, useState, useRef, useEffect } from "react";
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
  right: 20,
  bottom: 0,
  left: 10,
};
const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.02;
const MAX_BAR_HEIGHT = 16;

function getMaxLabelWidth(labels: string[], font = "10px sans-serif") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;
  return Math.max(...labels.map((label) => ctx.measureText(label).width));
}

function truncateLabel(rawLabel: string, maxChars = 15) {
  return rawLabel.length <= maxChars
    ? rawLabel
    : `${rawLabel.substring(0, maxChars)}…`;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data: _data,
  title,
  colors = [],
  isLoading = false,
  barWidth,
  titleProps,
  legendsProps,
  tooltipProps,
  xAxisProps,
  yAxisProps,
  gridProps,
  timestampProps,
  barProps,
  onClick,
}) => {
  const { theme } = useTheme();
  const { parentRef, width = 0, height = 0 } = useParentSize({ debounceTime: 150 });

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(null);
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(null);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData[]>();

  const data = useMemo<DataPoint[]>(
    () => (isLoading ? mockHorizontalBarChartData : _data),
    [isLoading, _data]
  );

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
    return getMaxLabelWidth(truncatedLabels, "10px sans-serif");
  }, [truncatedLabels]);

  const margin = useMemo(() => {
    if (!width) return DEFAULT_MARGIN;
    let desiredLeft = maxLabelPx + 20;
    if (desiredLeft > width / 3) desiredLeft = width / 3;
    desiredLeft = Math.max(desiredLeft, DEFAULT_MARGIN.left);
    const showingXAxis = xAxisProps?.isVisible !== false;
    const bottomMargin = showingXAxis
      ? DEFAULT_MARGIN.bottom
      : Math.max(DEFAULT_MARGIN.bottom - 10, 10);
    const rightMargin = Math.min(DEFAULT_MARGIN.right, 20);
    return {
      ...DEFAULT_MARGIN,
      left: desiredLeft,
      bottom: bottomMargin,
      right: rightMargin,
    };
  }, [maxLabelPx, width, xAxisProps]);

  const drawableChartWidth = width - margin.left - margin.right;
  const drawableChartHeight = height - margin.top - margin.bottom;

  const maxValue = useMemo(
    () =>
      Math.max(0, ...filteredData.map((d) => Number(d.value) || 0)) *
      SCALE_PADDING,
    [filteredData]
  );

  const yScale = useMemo(
    () =>
      scaleBand<string>({
        domain: filteredData.map((d) => String(d.label)),
        range: [0, drawableChartHeight],
        padding: 0.4,
        round: true,
      }),
    [filteredData, drawableChartHeight]
  );

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue],
        range: [0, drawableChartWidth],
        nice: true,
      }),
    [maxValue, drawableChartWidth]
  );

  const legendData = useMemo(
    () => data.map((d) => ({ label: d.label, value: d.value })),
    [data]
  );

  const colorScale = useMemo(() => {
    if (colors?.length) {
      return (index: number) => colors[index % colors.length];
    }
    return (index: number) =>
      theme.colors.charts.bar[index % theme.colors.charts.bar.length];
  }, [colors, theme.colors.charts.bar]);

  const handleBarMouseMove =
    (value: number, color: string, index: number) =>
      (event: React.MouseEvent) => {
        if (!isLoading) {
          showTooltip({
            tooltipData: [
              {
                label: filteredData[index].label,
                value,
                color,
              },
            ],
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

  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;

    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();

    const titleEl = document.querySelector(".chart-title") as HTMLElement | null;
    const legendEl = document.querySelector(".chart-legend") as HTMLElement | null;

    const titleHeight = titleEl?.getBoundingClientRect().height || 0;
    const legendHeight = legendEl?.getBoundingClientRect().height || 0;

    const totalTop = margin.top + titleHeight;
    const totalBottom = margin.bottom + legendHeight;
    const requiredHeight = totalTop + bbox.height + totalBottom;
    const requiredWidth = margin.left + drawableChartWidth + margin.right;

    const updatedHeight = Math.max(requiredHeight, height) + 5;
    const updatedWidth = Math.max(requiredWidth, width);

    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [data, width, height, margin, drawableChartWidth]);

  if (!_data || _data.length === 0) {
    return <div>No data to display.</div>;
  }

  return (
    <ChartWrapper
      ref={parentRef}
      title={title}
      titleProps={{ className: "chart-title", ...titleProps }}
      legendsProps={{
        ...legendsProps,
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
      <svg
        ref={chartSvgRef}
        width={adjustedChartWidth || width}
        height={adjustedChartHeight || height}
      >
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
            height={drawableChartHeight}
            xScale={xScale}
            showHorizontal={false}
            showVertical
            isLoading={isLoading}
            {...gridProps}
          />
          <XAxis
            scale={xScale}
            top={drawableChartHeight}
            isLoading={isLoading}
            availableWidth={drawableChartWidth}
            tickLength={0}
            {...xAxisProps}
          />
          {filteredData.map((d, index) => {
            const value = Number(d.value);
            if (Number.isNaN(value)) return null;
            const rawBarHeight = yScale.bandwidth();
            const actualBarHeight =
              barWidth !== undefined
                ? barWidth
                : Math.min(rawBarHeight, MAX_BAR_HEIGHT);
            const bandY = yScale(d.label) || 0;
            const barY = bandY + (rawBarHeight - actualBarHeight) / 2;
            const barLength = xScale(value);
            const barX = 0;
            const isHovered = hoveredBar === index;
            const barOpacity =
              hoveredBar !== null && !isHovered
                ? REDUCED_OPACITY
                : DEFAULT_OPACITY;
            const radius = Math.min(
              DEFAULT_BAR_RADIUS,
              actualBarHeight / 2,
              barLength
            );
            const pathD = `
              M ${barX},${barY + actualBarHeight}
              L ${barX + barLength - radius},${barY + actualBarHeight}
              Q ${barX + barLength},${barY + actualBarHeight} ${barX + barLength},${barY + actualBarHeight - radius}
              L ${barX + barLength},${barY + radius}
              Q ${barX + barLength},${barY} ${barX + barLength - radius},${barY}
              L ${barX},${barY}
              Z
            `;
            const barColor = d.color || colorScale(index);
            return (
              <CustomBar
                key={`bar-${d.label}`}
                x={barX}
                y={barY}
                width={barLength}
                height={actualBarHeight}
                fill={barColor}
                isLoading={isLoading}
                opacity={barOpacity}
                pathProps={{ d: pathD }}
                onMouseMove={handleBarMouseMove(value, barColor, index)}
                onMouseLeave={handleBarMouseLeave}
                {...barProps}
                onClick={(event) => {
                  if (barProps?.onClick) barProps.onClick(event);
                  if (onClick) onClick(event, d, index);
                }}
              />
            );
          })}
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default HorizontalBarChart;
