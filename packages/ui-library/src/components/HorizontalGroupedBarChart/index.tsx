import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { mockVerticalGroupedBarChartData } from "../VerticalGroupedBarChart/mockdata";
import { HorizontalGroupedBarChartProps } from "./types";

const DEFAULT_MARGIN = {
  top: 0,
  right: 20,
  bottom: 30,
  left: 20,
};

const DEFAULT_BAR_RADIUS = 5;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.0;
const TICK_LABEL_PADDING = 16;

const HorizontalGroupedBarChart: React.FC<HorizontalGroupedBarChartProps> = ({
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

  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);
  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(null);
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(null);
  const margin = DEFAULT_MARGIN;

  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
    useTooltip<TooltipData[]>();

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
      domain: filteredData.map((d) => d.label),
      range: [0, height - margin.top - margin.bottom],
      padding: 0.4,
    }), [filteredData, height, margin.top, margin.bottom]);

  const groupScale = useMemo(() =>
    scaleBand<string>({
      domain: activeKeys,
      range: [0, categoryScale.bandwidth()],
      padding: 0.3,
    }), [activeKeys, categoryScale]);

  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const drawableChartWidth = width - margin.left - margin.right - yAxisLabelWidth;

  const valueScale = scaleLinear<number>({
    domain: [0, maxValue * SCALE_PADDING],
    range: [0, Math.max(0, drawableChartWidth)],
    nice: true,
  });

  const groupColorScale = useMemo(() =>
    scaleOrdinal<string, string>({
      domain: groupKeys,
      range: colors.length ? colors : theme.colors.charts.bar,
    }), [groupKeys, colors, theme.colors.charts.bar]);

  const renderBar = (props: any) => <CustomBar {...props} />;

  const handleMouseMove = (groupKey: string, value: number) => (e: React.MouseEvent) => {
    if (!isLoading) {
      showTooltip({
        tooltipData: [{ label: capitalize(lowerCase(groupKey)), value }],
        tooltipLeft: e.clientX,
        tooltipTop: e.clientY,
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

  const renderGroupedBars = () =>
    filteredData.map((categoryData) => {
      const category = categoryData.label;
      const categoryY = categoryScale(category) || 0;
      return groupKeys.map((groupKey, index) => {
        const value = Number(categoryData.data?.[groupKey]);
        if (Number.isNaN(value)) return null;

        const barY = categoryY + (groupScale(groupKey) || 0);
        const barHeight = groupScale.bandwidth();
        const barWidth = valueScale(value);
        const barX = 0;

        const isHovered = hoveredGroupKey === groupKey;
        const barOpacity = hoveredGroupKey && !isHovered ? REDUCED_OPACITY : DEFAULT_OPACITY;
        const fill = isLoading
          ? `url(#${shimmerGradientId})`
          : hideIndex.includes(index)
            ? "#eee"
            : groupColorScale(groupKey);

        return renderBar({
          key: `grouped-${category}-${groupKey}`,
          x: barX,
          y: barY,
          width: barWidth,
          height: barHeight,
          fill,
          opacity: barOpacity,
          rx: DEFAULT_BAR_RADIUS,
          value,
          label: groupKey,
          onMouseMove: handleMouseMove(groupKey, value),
          onMouseLeave: handleMouseLeave,
        });
      });
    });

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const labels = chartSvgRef.current.querySelectorAll(".visx-axis-left text");
    const widths = Array.from(labels).map((node) =>
      (node as SVGGraphicsElement).getBBox().width
    );
    setMaxLabelWidth(Math.max(...widths, 0));
  }, [data, width, height]);

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

    setAdjustedChartHeight(Math.max(requiredHeight, height) + 5);
    setAdjustedChartWidth(width);
  }, [data, width, height, margin]);

  if (!_data || _data.length === 0) return <div>No data to display.</div>;

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
      <svg ref={chartSvgRef} width={adjustedChartWidth || width} height={adjustedChartHeight || height}>
        {isLoading && <SvgShimmer />}
        <Group top={margin.top} left={margin.left + yAxisLabelWidth}>
          <AxisLeft
            scale={categoryScale}
            stroke={theme.colors.axis.line}
            tickStroke={theme.colors.axis.line}
            tickLabelProps={{
              fill: theme.colors.axis.label,
              fontSize: "12px",
              textAnchor: "end",
              dy: "0.33em",
              dx: -8,
            }}
            hideAxisLine
            hideTicks={!showTicks}
          />
          <AxisBottom
            scale={valueScale}
            top={height - margin.top - margin.bottom}
            stroke={theme.colors.axis.line}
            tickStroke={theme.colors.axis.line}
            tickLabelProps={{
              fill: theme.colors.axis.label,
              fontSize: "12px",
              textAnchor: "middle",
            }}
            hideTicks={hideIndex.length === groupKeys.length || !showTicks}
            numTicks={5}
          />
          <g>
            {valueScale.ticks(5).map((tick) => (
              <line
                key={tick}
                y1={0}
                y2={height - margin.top - margin.bottom}
                x1={valueScale(tick)}
                x2={valueScale(tick)}
                stroke={theme.colors.axis.grid}
                strokeDasharray="2,2"
                opacity={0.3}
              />
            ))}
          </g>
          {renderGroupedBars()}
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default HorizontalGroupedBarChart;