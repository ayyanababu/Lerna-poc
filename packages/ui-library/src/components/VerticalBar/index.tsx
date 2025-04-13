import React, { useMemo, useState } from "react";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";

import useTheme from "../../hooks/useTheme";
import { formatNumberWithSuffix } from "../../utils/number";
import { ChartWrapper } from "../ChartWrapper";
import CustomBar from "../CustomBar";
import Grid from "../Grid";
import SvgShimmer from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import XAxis from "../XAxis";
import YAxis from "../YAxis";
import mockVerticalBarChartData from "./mockdata";
import { DataPoint, VerticalBarChartProps } from "./types";

const DEFAULT_MARGIN = {
  top: 5,
  right: 0,
  bottom: 25,
  left: 25,
};

const DEFAULT_MAX_BAR_WIDTH = 16;
const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.02;

const getEstimatedYAxisWidth = (maxValue: number, averageCharWidth = 7) => {
  const formattedValue = formatNumberWithSuffix(maxValue);
  const commasCount = Math.floor(
    Math.max(0, Math.abs(maxValue).toString().length - 3) / 3
  );
  return formattedValue.length * averageCharWidth + commasCount * 3 + 12;
};

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data: _data,
  title,
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
  onClick,
  maxBarWidth = DEFAULT_MAX_BAR_WIDTH,
}) => {
  const { theme } = useTheme();
  const { parentRef, width = 0, height = 0 } = useParentSize({ debounceTime: 150 });

  const data = useMemo<DataPoint[]>(
    () => (isLoading ? mockVerticalBarChartData : _data),
    [isLoading, _data]
  );

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);

  const filteredData = useMemo(
    () => data.filter((_, index) => !hideIndex.includes(index)),
    [data, hideIndex]
  );

  const margin = useMemo(() => {
    if (!width) return DEFAULT_MARGIN;

    const maxValue = Math.max(0, ...filteredData.map((d) => Number(d.value) || 0));
    const averageCharWidth = 7;
    const yAxisWidth = getEstimatedYAxisWidth(maxValue, averageCharWidth);

    const xLabels = filteredData.map((d) => String(d.label));
    const totalLabelWidth = xLabels.join("").length * averageCharWidth;
    const needsRotation = xLabels.length > 5 || totalLabelWidth >= width;
    const maxXLabelLength = Math.max(...xLabels.map((label) => label.length), 0);

    const rotationAdjustment = needsRotation
      ? Math.min(5 + (maxXLabelLength > 10 ? (maxXLabelLength - 10) * 1.5 : 0), 35)
      : 0;

    return {
      top: DEFAULT_MARGIN.top,
      right: DEFAULT_MARGIN.right,
      bottom: DEFAULT_MARGIN.bottom + rotationAdjustment,
      left: Math.max(DEFAULT_MARGIN.left, yAxisWidth),
    };
  }, [DEFAULT_MARGIN, width, filteredData]);

  const innerWidth = width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right;
  const innerHeight = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom;

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData[]>();

  const maxValue = useMemo(
    () =>
      Math.max(0, ...filteredData.map((d) => Number(d.value) || 0)) * SCALE_PADDING,
    [filteredData]
  );

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: filteredData.map((d) => String(d.label)),
        range: [0, innerWidth],
        padding: 0.6,
        round: true,
      }),
    [filteredData, innerWidth]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue],
        range: [innerHeight, 0],
        nice: true,
      }),
    [innerHeight, maxValue]
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

  const getOptimalBarWidth = (calculatedWidth: number) =>
    Math.min(calculatedWidth, maxBarWidth);

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
          range: filteredData.map((_, i) => colorScale(i)),
        }),
        hideIndex,
        setHideIndex,
        hovered: hoveredBar !== null ? legendData[hoveredBar]?.label : null,
        setHovered: (label) =>
          setHoveredBar(legendData.findIndex((item) => item.label === label)),
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
        <Group top={DEFAULT_MARGIN.top} left={DEFAULT_MARGIN.left}>
          <YAxis scale={yScale} isLoading={isLoading} {...yAxisProps} />
          <Grid
            width={innerWidth}
            yScale={yScale}
            isLoading={isLoading}
            {...gridProps}
          />
          <XAxis
            scale={xScale}
            top={innerHeight}
            isLoading={isLoading}
            availableWidth={innerWidth}
            forceFullLabels
            {...xAxisProps}
          />
          {filteredData.map((d, index) => {
            const value = Number(d.value);
            if (Number.isNaN(value)) return null;

            const calculatedBarWidth = xScale.bandwidth();
            const barWidth = getOptimalBarWidth(calculatedBarWidth);
            const barX =
              barWidth < calculatedBarWidth
                ? (xScale(d.label) || 0) + (calculatedBarWidth - barWidth) / 2
                : xScale(d.label) || 0;

            const barHeight = innerHeight - yScale(value);
            const barY = yScale(value);
            const isHovered = hoveredBar === index;
            const barOpacity =
              hoveredBar !== null && !isHovered
                ? REDUCED_OPACITY
                : DEFAULT_OPACITY;
            const radius = Math.min(
              DEFAULT_BAR_RADIUS,
              barWidth / 2,
              barHeight > 0 ? barHeight : 0
            );
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
                pathProps={{
                  d: `
                    M ${barX},${barY + barHeight}
                    L ${barX + barWidth},${barY + barHeight}
                    L ${barX + barWidth},${barY + radius}
                    Q ${barX + barWidth},${barY} ${barX + barWidth - radius},${barY}
                    L ${barX + radius},${barY}
                    Q ${barX},${barY} ${barX},${barY + radius}
                    L ${barX},${barY + barHeight}
                    Z
                  `,
                }}
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

export default VerticalBarChart;
