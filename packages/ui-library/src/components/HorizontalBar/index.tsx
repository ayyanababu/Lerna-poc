// HorizontalBarChart.tsx (Enhanced: X-axis label truncation, layout precision)
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
  bottom: 30,
  left: 0,
};
const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.02;
const MAX_BAR_HEIGHT = 16;
const TRUNCATE_RATIO = 0.75;
const TICK_LABEL_PADDING = 8;
let AXIS_ROTATE = false;


function getMaxLabelWidth(labels: string[], font = "10px sans-serif") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;
  return Math.max(...labels.map((label) => ctx.measureText(label).width));
}

function truncateLabel(label: string, ratio = TRUNCATE_RATIO): string {
  const limit = Math.floor(label.length * ratio);
  return label.length <= limit ? label : label.slice(0, limit) + "…";
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
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(null);
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(null);
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);
  const axis_bottom = useRef<SVGGElement | null>(null);

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

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const nodes = chartSvgRef.current.querySelectorAll(".visx-axis-left text");
    const widths = Array.from(nodes).map((node) => (node as SVGGraphicsElement).getBBox().width);
    setMaxLabelWidth(Math.max(...widths, 0));
  }, [data, width, height]);

  const yLabels = useMemo(() => filteredData.map((d) => String(d.label)), [filteredData]);
  const truncatedLabels = useMemo(() => yLabels.map((l) => truncateLabel(l)), [yLabels]);

  const maxLabelPx = useMemo(() => getMaxLabelWidth(truncatedLabels), [truncatedLabels]);

  const margin = useMemo(() => {
    const desiredLeft = Math.max(maxLabelPx + 10, DEFAULT_MARGIN.left);
    return {
      ...DEFAULT_MARGIN,
      left: Math.min(desiredLeft, width / 3),
    };
  }, [maxLabelPx, width]);

  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidth;
  const drawableChartWidth = width - axisXStart - DEFAULT_MARGIN.right;

  //  const drawableChartWidth = width - margin.left - DEFAULT_MARGIN.right;
  const drawableChartHeight = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom;

  const maxValue = useMemo(
    () => Math.max(0, ...filteredData.map((d) => Number(d.value) || 0)) * SCALE_PADDING,
    [filteredData]
  );

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const nodes = chartSvgRef.current.querySelectorAll(".visx-axis-left text");
    const widths = Array.from(nodes).map((node) => (node as SVGGraphicsElement).getBBox().width);
    setMaxLabelWidth(Math.max(...widths, 0));
  }, [data, width, height]);

  const yScale = useMemo(
    () => scaleBand({
      domain: yLabels,
      range: [0, drawableChartHeight],
      padding: 0.4,
      round: true,
    }),
    [yLabels, drawableChartHeight]
  );

  const xScale = useMemo(
    () => scaleLinear({
      domain: [0, maxValue],
      range: [0, drawableChartWidth],
      nice: true,
    }),
    [maxValue, drawableChartWidth]
  );

  const colorScale = useMemo(() => {
    const defaultColors = theme.colors.charts.bar;
    return (index: number) => (colors.length ? colors[index % colors.length] : defaultColors[index % defaultColors.length]);
  }, [colors, theme]);


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
    if (!axis_bottom.current || !xScale) return;
    if (AXIS_ROTATE) {
      return;
    }

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
        const truncated = label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
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
            const newtruncated = label.slice(0, Math.floor(truncated.length * TRUNCATE_RATIO * .1)) + "…";
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
  }, [xScale, axis_bottom.current]);

  const rotated = (rotate: boolean) => {
    let rot = rotate;
    setTimeout(() => {
      console.log("hit")
      const textNodes: SVGTextElement[] = Array.from(
        axis_bottom.current?.querySelectorAll(".visx-axis-bottom text") || []
      );

      textNodes.forEach((node) => {
        const full = node.dataset.fulltext || node.textContent || "";
        node.setAttribute("display", "block");
        node.textContent = full;
        node.dataset.fulltext = full;
      });
      AXIS_ROTATE = rotate;

      if (!rot) {
        if (!chartSvgRef.current || !width || !height) return;
        const svg = chartSvgRef.current;
        const bbox = svg.getBBox();
        const titleHeight = document.querySelector(".chart-title")?.getBoundingClientRect().height || 0;
        const legendHeight = document.querySelector(".chart-legend")?.getBoundingClientRect().height || 0;
        let updatedHeight = Math.max(DEFAULT_MARGIN.top + bbox.height + DEFAULT_MARGIN.bottom + legendHeight + titleHeight, height) + 5;
        const updatedWidth = Math.max(width, DEFAULT_MARGIN.left + innerWidth + DEFAULT_MARGIN.right);
        setAdjustedChartHeight(updatedHeight);
        setAdjustedChartWidth(updatedWidth);
      }
    }, 200)
  }


  if (!_data || _data.length === 0) return <div>No data to display.</div>;

  return (
    <ChartWrapper
      ref={parentRef}
      title={title}
      titleProps={{ className: "chart-title", ...titleProps }}
      legendsProps={{
        ...legendsProps,
        data: data.map((d) => ({ label: d.label, value: d.value })),
        colorScale: scaleOrdinal({ domain: data.map((d) => d.label), range: data.map((_, i) => colorScale(i)) }),
        hideIndex,
        setHideIndex,
        hovered: hoveredBar !== null ? data[hoveredBar]?.label : null,
        setHovered: (label) => setHoveredBar(data.findIndex((d) => d.label === label)),
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
      <svg ref={chartSvgRef} width={adjustedChartWidth || width} height={adjustedChartHeight || height}>
        {isLoading && <SvgShimmer />}
        <Group top={DEFAULT_MARGIN.top} left={DEFAULT_MARGIN.left}>
          <YAxis
            scale={yScale}
            isLoading={isLoading}
            numTicks={filteredData.length}
            showTicks={false}
            tickFormat={(val) => truncateLabel(String(val))}
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
          <g ref={axis_bottom}>
            <XAxis
              scale={xScale}
              top={drawableChartHeight}
              isLoading={isLoading}
              availableWidth={drawableChartWidth}
              tickLength={0}
              {...xAxisProps}
              rotated={rotated}
            />
          </g>
          {filteredData.map((d, index) => {
            const value = Number(d.value);
            if (Number.isNaN(value)) return null;
            const rawHeight = yScale.bandwidth();
            const h = barWidth ?? Math.min(rawHeight, MAX_BAR_HEIGHT);
            const y = (yScale(d.label) || 0) + (rawHeight - h) / 2;
            const w = xScale(value);
            const r = Math.min(DEFAULT_BAR_RADIUS, h / 2, w);
            const fill = d.color || colorScale(index);
            return (
              <CustomBar
                key={`bar-${d.label}`}
                x={0}
                y={y}
                width={w}
                height={h}
                fill={fill}
                isLoading={isLoading}
                opacity={hoveredBar !== null && hoveredBar !== index ? REDUCED_OPACITY : DEFAULT_OPACITY}
                pathProps={{
                  d: `M0,${y + h} L${w - r},${y + h} Q${w},${y + h} ${w},${y + h - r} L${w},${y + r} Q${w},${y} ${w - r},${y} L0,${y} Z`,
                }}
                onMouseMove={(e) => {
                  showTooltip({
                    tooltipData: [{ label: d.label, value, color: fill }],
                    tooltipLeft: e.clientX,
                    tooltipTop: e.clientY,
                  });
                  setHoveredBar(index);
                }}

                onMouseLeave={() => {
                  hideTooltip();
                  setHoveredBar(null);
                }}
                onClick={(e) => {
                  barProps?.onClick?.(e);
                  onClick?.(e, d, index);
                }}
                {...barProps}
              />
            );
          })}
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default HorizontalBarChart;