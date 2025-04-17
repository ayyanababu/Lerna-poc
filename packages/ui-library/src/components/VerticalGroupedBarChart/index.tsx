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
  right: -20,
  bottom: 30,
  left: 0,
};

const DEFAULT_BAR_RADIUS = 5;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;
const TICK_LABEL_PADDING = 8;

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

  //  const drawableChartWidth = width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right;
  const drawableChartHeight = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom;

  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(null);
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(null);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const axis_bottom = useRef<SVGGElement | null>(null);
  const tickRefs = useRef<Record<string, SVGTextElement | null>>({});
  const tickTextMap = useRef<Record<string, string>>({});
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData[]>();


  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidth;
  const drawableChartWidth = width - axisXStart - DEFAULT_MARGIN.right;
  //  const drawableChartWidth = width - margin.left - DEFAULT_MARGIN.right;

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

  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;
    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();
    const titleHeight = document.querySelector(".chart-title")?.getBoundingClientRect().height || 0;
    const legendHeight = document.querySelector(".chart-legend")?.getBoundingClientRect().height || 0;
    const updatedHeight = Math.max(DEFAULT_MARGIN.top + bbox.height + DEFAULT_MARGIN.bottom + legendHeight + titleHeight, height) + 5;
    const updatedWidth = Math.max(width, DEFAULT_MARGIN.left + drawableChartWidth + DEFAULT_MARGIN.right);
    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [data, width, height, DEFAULT_MARGIN, drawableChartWidth]);

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const nodes = chartSvgRef.current.querySelectorAll(".visx-axis-left text");
    const widths = Array.from(nodes).map((node) => (node as SVGGraphicsElement).getBBox().width);
    setMaxLabelWidth(Math.max(...widths, 0));
  }, [data, width, height]);

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
    if (!axis_bottom.current || !categoryScale) return;

    const truncationRatio = 0.35;

    requestAnimationFrame(() => {
      const textNodes: SVGTextElement[] = Array.from(
        axis_bottom.current?.querySelectorAll(".visx-axis-bottom text") || []
      );

      if (!textNodes.length) return;

      const usedRects: { x1: number; x2: number }[] = [];

      // Set all full first
      textNodes.forEach((node) => {
        const full = node.dataset.fulltext || node.textContent || "";
        node.setAttribute("display", "block");
        node.textContent = full;
        node.dataset.fulltext = full;
      });
      console.log(textNodes)
      const firstNode = textNodes[0];
      const lastNode = textNodes[textNodes.length - 1];

      const showAndTruncate = (node: SVGTextElement) => {
        const label = node.dataset.fulltext || node.textContent || "";
        const truncated = label.slice(0, Math.floor(label.length * truncationRatio)) + "…";
        node.textContent = truncated;
        const bbox = node.getBBox();
        const x = +node.getAttribute("x")!;
        const rect = { x1: x - bbox.width / 2, x2: x + bbox.width / 2 };
        usedRects.push(rect);
        node.textContent = truncated;
        node.setAttribute("display", "block");
      };

      // Always show first and last
      if (firstNode) showAndTruncate(firstNode);
      if (lastNode && lastNode !== firstNode) showAndTruncate(lastNode);

      // Hide overlapping others
      textNodes.slice(1, -1).forEach((node) => {
        const label = node.dataset.fulltext || node.textContent || "";
        const truncated = label.slice(0, Math.floor(label.length * truncationRatio)) + "…";
        const original = node.textContent;
        node.textContent = truncated;
        const bbox = node.getBBox();
        node.textContent = original;

        const x = +node.getAttribute("x")!;
        const rect = { x1: x - bbox.width / 2, x2: x + bbox.width / 2 };
        const isOverlapping = usedRects.some((r) => !(rect.x2 < r.x1 || rect.x1 > r.x2));

        if (!isOverlapping) {
          node.textContent = truncated;
          node.setAttribute("display", "block");
          usedRects.push(rect);
        } else {
          node.setAttribute("display", "none");
        }
      });
    });
  }, [categoryScale, axis_bottom.current]);




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
          <g ref={axis_bottom}>
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
              tickComponent={({ formattedValue, ...tickProps }) => (
                <text
                  {...tickProps}
                  text-anchor="start"
                  data-fulltext={formattedValue}
                  x={(categoryScale(formattedValue) ?? 0) + categoryScale.bandwidth() / 2}
                >
                  {formattedValue}
                </text>
              )}
            />
          </g>
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
            ) : filteredData.map((categoryData) => {
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
