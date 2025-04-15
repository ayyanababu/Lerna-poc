import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";   
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { stack } from "@visx/shape";
import { useTooltip } from "@visx/tooltip";
import { capitalize, cloneDeep, lowerCase } from "lodash-es";

import useTheme from "../../hooks/useTheme";
import ChartWrapper from "../ChartWrapper";
import CustomBar from "../CustomBar";
import { shimmerClassName } from "../Shimmer/Shimmer";
import SvgShimmer, { shimmerGradientId } from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import { mockVerticalGroupedBarChartData } from "./mockdata";
import { DataPoint, VerticalGroupedBarChartProps } from "./types";

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

const VerticalGroupedBarChart: React.FC<VerticalGroupedBarChartProps> = ({
  data: _data,
  groupKeys: _groupKeys,
  type = "grouped",
  title,
  timestamp,
  colors = [],
  isLoading,
  titleProps,
  legendsProps,
  tooltipProps,
  showTicks = false,
}) => {
  const { theme } = useTheme();
  const { parentRef, width = 0, height = 0 } = useParentSize({ debounceTime: 150 });

  const drawableChartWidth = width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right;
  const drawableChartHeight = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom;

  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
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

  const { data, groupKeys } = useMemo(() =>
    isLoading ? mockVerticalGroupedBarChartData : { data: _data, groupKeys: _groupKeys },
    [isLoading, _data, _groupKeys]
  );

  const filteredData = useMemo(() =>
    data.map((categoryData) => {
      const d = cloneDeep(categoryData);
      groupKeys.forEach((groupKey, index) => {
        if (hideIndex.includes(index)) delete d.data?.[groupKey];
      });
      return d;
    }), [data, hideIndex, groupKeys]);

  const legendData = useMemo(() =>
    groupKeys.map((key) => ({
      label: capitalize(lowerCase(key)),
      value: data.reduce((total, d) => total + Number(d.data[key] || 0), 0),
    })), [groupKeys, data]);

  const activeKeys = useMemo(() => groupKeys.filter((_, i) => !hideIndex.includes(i)), [groupKeys, hideIndex]);

  const stackedData = useMemo(() => {
    if (type !== "stacked") return null;
    try {
      const prepared = filteredData.map((item) => {
        const result: Record<string, number | string> = { label: item.label };
        activeKeys.forEach((key) => {
          result[key] = Number(item.data[key]) || 0;
        });
        return result;
      });
      const stackGenerator = stack({ keys: activeKeys });
      return stackGenerator(prepared);
    } catch (e) {
      console.error("Stack error:", e);
      return [];
    }
  }, [type, activeKeys, filteredData]);

  const maxValue = useMemo(() => {
    if (type === "stacked") {
      return Math.max(
        0,
        ...filteredData.map((d) =>
          activeKeys.reduce((sum, key) => sum + Number(d.data[key] || 0), 0)
        )
      );
    }
    return Math.max(
      0,
      ...filteredData.flatMap((d) =>
        activeKeys.map((key) => Number(d.data[key]) || 0)
      )
    );
  }, [filteredData, activeKeys, type]);

  const categoryScale = useMemo(() =>
    scaleBand<string>({
      domain: filteredData.map((d) => String(d.label)),
      range: [0, drawableChartWidth],
      padding: 0.4,
    }), [filteredData, drawableChartWidth]);

  const groupScale = useMemo(() =>
    scaleBand<string>({
      domain: activeKeys,
      range: [0, categoryScale.bandwidth()],
      padding: 0.3,
    }), [activeKeys, categoryScale]);

  const valueScale = useMemo(() =>
    scaleLinear<number>({
      domain: [0, maxValue * SCALE_PADDING],
      range: [drawableChartHeight, 0],
    }), [drawableChartHeight, maxValue]);

  const groupColorScale = useMemo(() =>
    scaleOrdinal<string, string>({
      domain: groupKeys,
      range: colors?.length ? colors : theme.colors.charts.bar,
    }), [groupKeys, colors, theme.colors.charts.bar]);

  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;

    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();

    const titleEl = document.querySelector(".chart-title") as HTMLElement | null;
    const legendEl = document.querySelector(".chart-legend") as HTMLElement | null;

    const titleHeight = titleEl?.getBoundingClientRect().height || 0;
    const legendHeight = legendEl?.getBoundingClientRect().height || 0;

    const totalTop = DEFAULT_MARGIN.top + titleHeight;
    const totalBottom = DEFAULT_MARGIN.bottom + legendHeight;
    const requiredHeight = totalTop + bbox.height + totalBottom;
    const requiredWidth = DEFAULT_MARGIN.left + bbox.width + DEFAULT_MARGIN.right;

    setAdjustedChartHeight(Math.max(requiredHeight, height) + 5);
    setAdjustedChartWidth(Math.max(requiredWidth, width));
  }, [data, width, height, DEFAULT_MARGIN]);

  // Hide axis labels when loading
  const renderAxisLabel = (
    formattedValue: string,
    tickProps: React.SVGProps<SVGTextElement>,
  ) => (
    <text
      {...tickProps}
      className={`${isLoading ? shimmerClassName : ""}`}
      fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
      style={{
        fontSize: "12px",
      }}
    >
      {isLoading ? "" : formattedValue}
    </text>
  );

  if (!isLoading && (!_data || _data.length === 0)) {
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
      timestampProps={{ timestamp, isLoading }}
    >
      <svg
        ref={chartSvgRef}
        width={adjustedChartWidth || width}
        height={adjustedChartHeight || height}
      >
        {isLoading && <SvgShimmer />}
        <Group top={DEFAULT_MARGIN.top} left={DEFAULT_MARGIN.left}>
          <AxisLeft
            scale={valueScale}
            stroke={theme.colors.axis.line}
            tickStroke={theme.colors.axis.line}
            tickLabelProps={{
              fill: theme.colors.axis.label,
              fontSize: "12px",
              textAnchor: "end",
              dy: "0.33em",
            }}
            hideTicks={!showTicks}
          />
          <AxisBottom
            scale={categoryScale}
            top={drawableChartHeight}
            stroke={theme.colors.axis.line}
            tickStroke={theme.colors.axis.line}
            tickLabelProps={{
              fill: theme.colors.axis.label,
              fontSize: "12px",
              textAnchor: "middle",
              dy: "0.33em",
            }}
            hideTicks={hideIndex.length === groupKeys.length || !showTicks}
          />
          <g>
            {valueScale.ticks(5).map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={drawableChartWidth}
                y1={valueScale(tick)}
                y2={valueScale(tick)}
                stroke={theme.colors.axis.grid}
                strokeDasharray="2,2"
                opacity={0.3}
              />
            ))}
          </g>
          {type === "stacked" && stackedData
            ? stackedData.map((series) =>
              series.map((bar, i) => {
                const category = String(filteredData[i].label);
                const barX = categoryScale(category) || 0;
                const barWidth = categoryScale.bandwidth();
                const barY = valueScale(bar[1]);
                const barHeight = valueScale(bar[0]) - valueScale(bar[1]);
                return (
                  <CustomBar
                    key={`stacked-${series.key}-${category}`}
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={groupColorScale(series.key)}
                    opacity={DEFAULT_OPACITY}
                    value={bar[1] - bar[0]}
                    label={series.key}
                    onMouseMove={() => { }}
                    onMouseLeave={() => { }}
                  />
                );
              })
            )
            : filteredData.map((categoryData) => {
              const category = String(categoryData.label);
              const categoryX = categoryScale(category) || 0;
              return groupKeys.map((groupKey, index) => {
                const value = Number(categoryData.data?.[groupKey]);
                if (Number.isNaN(value)) return null;
                const barX = categoryX + (groupScale(groupKey) || 0);
                const barWidth = groupScale.bandwidth();
                const barHeight = drawableChartHeight - valueScale(value);
                const barY = valueScale(value);
                return (
                  <CustomBar
                    key={`grouped-${category}-${groupKey}`}
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={groupColorScale(groupKey)}
                    opacity={DEFAULT_OPACITY}
                    rx={DEFAULT_BAR_RADIUS}
                    value={value}
                    label={groupKey}
                    onMouseMove={() => { }}
                    onMouseLeave={() => { }}
                  />
                );
              });
            })}
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default VerticalGroupedBarChart;
