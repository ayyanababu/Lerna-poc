// HorizontalGroupedBarChart.tsx (Final fix: Y-axis line after labels, bars start from line, X-axis spans full width)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { stack } from "@visx/shape";
import { capitalize, cloneDeep, lowerCase } from "lodash-es";

import useTheme from "../../hooks/useTheme";
import ChartWrapper from "../ChartWrapper";
import CustomBar from "../CustomBar";
import SvgShimmer, { shimmerGradientId } from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import { mockVerticalGroupedBarChartData } from "../VerticalGroupedBarChart/mockdata";
import { HorizontalGroupedBarChartProps } from "./types";

const DEFAULT_MARGIN = { top: 0, right: 20, bottom: 30, left: 0 };
const DEFAULT_BAR_RADIUS = 5;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.0;
const TICK_LABEL_PADDING = 8;
const TRUNCATE_RATIO = .75;
const AXIS_ROTATE = false;

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
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const axis_bottom = useRef<SVGGElement | null>(null);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(null);
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(null);


  const { data, groupKeys } = useMemo(() =>
    isLoading ? mockVerticalGroupedBarChartData : { data: _data, groupKeys: _groupKeys },
    [isLoading, _data, _groupKeys]
  );

  const filteredData = useMemo(() =>
    data.map((d) => {
      const copied = cloneDeep(d);
      groupKeys.forEach((gk, i) => { if (hideIndex.includes(i)) delete copied.data?.[gk]; });
      return copied;
    }), [data, hideIndex, groupKeys]);

  const activeKeys = useMemo(() => groupKeys.filter((_, i) => !hideIndex.includes(i)), [groupKeys, hideIndex]);

  const categoryScale = useMemo(() =>
    scaleBand({
      domain: filteredData.map((d) => d.label),
      range: [0, height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom],
      padding: 0.4,
    }), [filteredData, height, DEFAULT_MARGIN]);

  const groupScale = useMemo(() =>
    scaleBand({
      domain: activeKeys,
      range: [0, categoryScale.bandwidth()],
      padding: 0.3,
    }), [activeKeys, categoryScale]);

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const nodes = chartSvgRef.current.querySelectorAll(".visx-axis-left text");
    const widths = Array.from(nodes).map((node) => (node as SVGGraphicsElement).getBBox().width);
    setMaxLabelWidth(Math.max(...widths, 0));
  }, [data, width, height]);

  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;
    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();
    const titleHeight = document.querySelector(".chart-title")?.getBoundingClientRect().height || 0;
    const legendHeight = document.querySelector(".chart-legend")?.getBoundingClientRect().height || 0;
    let updatedHeight = Math.max(DEFAULT_MARGIN.top + bbox.height + DEFAULT_MARGIN.bottom + legendHeight + titleHeight, height) + 5;
    const updatedWidth = Math.max(width, DEFAULT_MARGIN.left + innerWidth + DEFAULT_MARGIN.right);
    if (AXIS_ROTATE) {
      updatedHeight = updatedHeight - (chartSvgRef.current.querySelector('.visx-axis-bottom') as SVGGElement).getBBox().height
    }
    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [data, width, height, DEFAULT_MARGIN, innerWidth]);

  useEffect(() => {
    if (!axis_bottom.current || !categoryScale) return;
    if (AXIS_ROTATE) {
      return;
    }

    const truncationRatio = 0.5;

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
      const firstNode = textNodes[0];
      const lastNode = textNodes[textNodes.length - 1];

      const showAndTruncate = (node: SVGTextElement) => {
        const label = node.dataset.fulltext || node.textContent || "";
        const truncated = label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
        const bbox = node.getBBox();
        let pnode = node.parentNode as Element;
        let x = 0;
        if (pnode.getAttribute("transform")) {
          x = +pnode.getAttribute("transform").split("translate(")[1].split(",")[0] + bbox.x;
        } else {
          x = +bbox.x
        }
        const rect = { x1: x, x2: x + bbox.width };
        const isOverlapping = usedRects.some((r) => !(rect.x2 < r.x1 || rect.x1 > r.x2));
        if (!isOverlapping) {
          node.textContent = label;
          node.setAttribute("display", "block");
          usedRects.push(rect);
        } else {
          node.textContent = truncated;
          node.setAttribute("display", "block");
        }
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
        const rect = { x1: x - bbox.width, x2: x + bbox.width };
        const isOverlapping = usedRects.some((r) => !(rect.x2 < r.x1 || rect.x1 > r.x2));
        console.log(label)
        console.log(truncated)
        console.log(isOverlapping)
        if (!isOverlapping) {
          node.textContent = label;
          node.setAttribute("display", "block");
          usedRects.push(rect);
        } else {
          node.textContent = truncated;
          const bbox = node.getBBox();
          const x = +node.getAttribute("x")!;
          const rect = { x1: x - bbox.width / 2, x2: x + bbox.width / 2 };
          const isOverlapping = usedRects.some((r) => !(rect.x2 < r.x1 || rect.x1 > r.x2));
          if (!isOverlapping) {
            node.textContent = truncated;
            node.setAttribute("display", "block");
            usedRects.push(rect);
          } else {
            const newtruncated = label.slice(0, Math.floor(truncated.length * truncationRatio * .1)) + "…";
            node.textContent = newtruncated;
            const bbox = node.getBBox();
            const x = +node.getAttribute("x")!;
            const rect = { x1: x - bbox.width / 2, x2: x + bbox.width / 2 };
            const isOverlapping = usedRects.some((r) => !(rect.x2 < r.x1 || rect.x1 > r.x2));
            if (isOverlapping) {
              node.setAttribute("display", "none");
            }
          }
          //   node.setAttribute("display", "none");
        }
      });
    });
  }, [categoryScale, axis_bottom.current]);

  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidth;
  const drawableChartWidth = width - axisXStart - DEFAULT_MARGIN.right;

  const valueScale = scaleLinear({
    domain: [0, Math.max(1, ...filteredData.flatMap(d => activeKeys.map(k => Number(d.data[k]) || 0))) * SCALE_PADDING],
    range: [0, drawableChartWidth],
    nice: true,
  });

  const colorScale = useMemo(() =>
    scaleOrdinal({
      domain: groupKeys,
      range: colors.length ? colors : theme.colors.charts.bar,
    }), [groupKeys, colors, theme]);

  const renderGroupedBars = () =>
    filteredData.map((cat, i) => {
      const y = categoryScale(cat.label) || 0;
      return groupKeys.map((gk, idx) => {
        const val = Number(cat.data?.[gk]);
        if (Number.isNaN(val)) return null;
        return (
          <CustomBar
            key={`bar-${i}-${gk}`}
            x={0}
            y={y + (groupScale(gk) || 0)}
            width={valueScale(val)}
            height={groupScale.bandwidth()}
            fill={hideIndex.includes(idx) ? "#eee" : colorScale(gk)}
            opacity={DEFAULT_OPACITY}
            rx={DEFAULT_BAR_RADIUS}
            label={gk}
            value={val}
            onMouseMove={() => { }}
            onMouseLeave={() => { }}
          />
        );
      });
    });

  return (
    <ChartWrapper
      ref={parentRef}
      title={title}
      titleProps={titleProps}
      legendsProps={{
        data: groupKeys.map(k => ({ label: capitalize(lowerCase(k)), value: 0 })),
        colorScale,
        hideIndex,
        setHideIndex,
        hovered: null,
        setHovered: () => { },
        isLoading,
        ...legendsProps,
      }}
      tooltipProps={{ data: [], top: 0, left: 0, isVisible: false, ...tooltipProps }}
      timestampProps={{ timestamp, isLoading }}
    >
      <svg ref={chartSvgRef} width={adjustedChartWidth || width} height={adjustedChartHeight || height}>
        {isLoading && <SvgShimmer />}

        {/* Y-axis group */}
        <Group top={DEFAULT_MARGIN.top} left={DEFAULT_MARGIN.left}>
          <AxisLeft
            scale={categoryScale}
            stroke="transparent"
            tickStroke="transparent"
            tickLabelProps={{
              fill: theme.colors.axis.label,
              fontSize: '12px',
              textAnchor: 'start',
              dx: 0,
              dy: '0.33em',
              x: 0,
            }}
            hideAxisLine
            hideTicks={!showTicks}
          />
        </Group>

        {/* Axis line and chart area */}
        <Group top={DEFAULT_MARGIN.top} left={axisXStart}>
          {/* Draw Y-axis vertical line */}
          <line
            x1={0}
            x2={0}
            y1={0}
            y2={height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom}
            stroke={theme.colors.axis.line}
          />

          {/* X-axis */}
          <g ref={axis_bottom}>
            <AxisBottom
              scale={valueScale}
              top={height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom}
              stroke={theme.colors.axis.line}
              tickStroke={theme.colors.axis.line}
              tickLabelProps={{
                fill: theme.colors.axis.label,
                fontSize: '12px',
                textAnchor: 'middle',
              }}
              hideTicks={hideIndex.length === groupKeys.length || !showTicks}
              numTicks={5}
            />
          </g>

          {/* Grid lines */}
          {valueScale.ticks(5).map((tick) => (
            <line
              key={tick}
              x1={valueScale(tick)}
              x2={valueScale(tick)}
              y1={0}
              y2={height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom}
              stroke={theme.colors.axis.grid}
              strokeDasharray="2,2"
              opacity={0.3}
            />
          ))}

          {renderGroupedBars()}
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default HorizontalGroupedBarChart;
