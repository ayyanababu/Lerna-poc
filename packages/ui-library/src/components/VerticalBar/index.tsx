// VerticalBarChart.tsx (Final: Layout-aware truncation + axis sync)
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";

import useTheme from "../../hooks/useTheme";
import { ChartWrapper } from "../ChartWrapper";
import CustomBar from "../CustomBar";
import SvgShimmer from "../Shimmer/SvgShimmer";
import mockVerticalBarChartData from "./mockdata";
import { DataPoint, VerticalBarChartProps } from "./types";

const DEFAULT_MARGIN = { top: 20, right: 20, bottom: 30, left: 30 };
const DEFAULT_MAX_BAR_WIDTH = 16;
const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const SCALE_PADDING = 1.2;
const TRUNCATE_RATIO = 0.5;

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data: _data,
  title,
  colors = [],
  isLoading = false,
  titleProps,
  legendsProps,
  xAxisProps,
  yAxisProps,
  timestampProps,
  barProps,
  onClick,
  maxBarWidth = DEFAULT_MAX_BAR_WIDTH,
}) => {
  const { theme } = useTheme();
  const { parentRef, width = 0, height = 0 } = useParentSize({ debounceTime: 150 });
  const [adjustedLabels, setAdjustedLabels] = useState<Record<string, string>>({});
  const axis_bottom = useRef<SVGGElement | null>(null);

  const data = useMemo<DataPoint[]>(() => (isLoading ? mockVerticalBarChartData : _data), [isLoading, _data]);
  const maxValue = useMemo(() => Math.max(0, ...data.map((d) => Number(d.value) || 0)) * SCALE_PADDING, [data]);

  const margin = DEFAULT_MARGIN;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xLabels = useMemo(() => data.map((d) => String(d.label)), [data]);

  const xScale = useMemo(() =>
    scaleBand({
      domain: xLabels,
      range: [0, innerWidth],
      padding: 0.6,
      round: true,
    }), [xLabels, innerWidth]);

  const yScale = useMemo(() =>
    scaleLinear({
      domain: [0, maxValue],
      range: [innerHeight, 0],
      nice: true,
    }), [innerHeight, maxValue]);

  const colorScale = useMemo(() => {
    const defaultColors = theme.colors.charts.bar;
    return (index: number) => (colors.length ? colors[index % colors.length] : defaultColors[index % defaultColors.length]);
  }, [colors, theme]);

  const getOptimalBarWidth = (bandWidth: number) => Math.min(bandWidth, maxBarWidth);

  useEffect(() => {
    if (!axis_bottom.current || !xScale) return;

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
  }, [xScale, axis_bottom.current]);


  if (!_data || _data.length === 0) return <div>No data to display.</div>;

  return (
    <ChartWrapper
      ref={parentRef}
      title={title}
      titleProps={titleProps}
      legendsProps={{
        data: data.map((d) => ({ label: d.label, value: d.value })),
        colorScale: scaleOrdinal({ domain: data.map((d) => d.label), range: data.map((_, i) => colorScale(i)) }),
        hideIndex: [],
        setHideIndex: () => { },
        hovered: null,
        setHovered: () => { },
        isLoading,
        ...legendsProps,
      }}
      tooltipProps={{
        data: [],
        top: 0,
        left: 0,
        isVisible: false,
      }}
      timestampProps={{ isLoading, ...timestampProps }}
    >
      <svg width={width} height={height}>
        {isLoading && <SvgShimmer />}
        <Group top={margin.top} left={margin.left}>
          <AxisLeft
            scale={yScale}
            stroke={theme.colors.axis.line}
            tickStroke={theme.colors.axis.line}
            tickLabelProps={{
              fill: theme.colors.axis.label,
              fontSize: "12px",
              textAnchor: "end",
              dy: "0.33em",
            }}
            {...yAxisProps}
          />
          <g ref={axis_bottom}>
            <AxisBottom
              scale={xScale}
              top={innerHeight}
              stroke={theme.colors.axis.line}
              tickStroke={theme.colors.axis.line}
              tickLabelProps={{
                fill: theme.colors.axis.label,
                fontSize: "12px",
                textAnchor: "middle",
                dy: "0.33em",
              }}
              tickComponent={({ formattedValue, ...tickProps }) => (
                <text
                  {...tickProps}
                  anchor-text="start"
                  data-fulltext={formattedValue}
                  x={(xScale(formattedValue) ?? 0) + xScale.bandwidth() / 2}
                >
                  {adjustedLabels[formattedValue] ?? ""}
                </text>
              )}
              {...xAxisProps}
            />
          </g>
          {data.map((d, index) => {
            const value = Number(d.value);
            if (Number.isNaN(value)) return null;

            const fullBarWidth = xScale.bandwidth();
            const barWidth = getOptimalBarWidth(fullBarWidth);
            const barX = (xScale(d.label) ?? 0) + (fullBarWidth - barWidth) / 2;
            const barY = yScale(value);
            const barHeight = innerHeight - barY;
            const fill = d.color || colorScale(index);

            return (
              <CustomBar
                key={`bar-${d.label}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={fill}
                isLoading={isLoading}
                opacity={DEFAULT_OPACITY}
                pathProps={{
                  d: `M ${barX},${barY + barHeight} L ${barX + barWidth},${barY + barHeight} L ${barX + barWidth},${barY + DEFAULT_BAR_RADIUS} Q ${barX + barWidth},${barY} ${barX + barWidth - DEFAULT_BAR_RADIUS},${barY} L ${barX + DEFAULT_BAR_RADIUS},${barY} Q ${barX},${barY} ${barX},${barY + DEFAULT_BAR_RADIUS} Z`,
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

export default VerticalBarChart;