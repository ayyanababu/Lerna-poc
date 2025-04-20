import React, { useMemo, useState, useRef, useEffect } from "react";
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
  right: 30,
  bottom: 50,
  left: 60,
};
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;
const MAX_BAR_WIDTH = 16;
const DEFAULT_BAR_RADIUS = 4;
const TRUNCATE_RATIO = 0.75;
const TICK_LABEL_PADDING = 8;
let AXIS_ROTATE = true

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
  const [maxLabelWidthLeft, setMaxLabelWidthLeft] = useState<number>(60);
  const [maxLabelWidthRight, setMaxLabelWidthRight] = useState<number>(60);
  const axis_bottom = useRef<SVGGElement | null>(null);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(null);
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(null);
  const [drawableChartWidth, setdrawableChartWidth] = useState(0);
  const [drawableChartHeight, setdrawableChartHeight] = useState(0);
  const sideY = useRef<SVGSVGElement | null>(null);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

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

  //  const drawableWidth = width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right;
  //  const drawableHeight = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom;

  useEffect(() => {
    const yAxisLabelWidthLeft = maxLabelWidthLeft + TICK_LABEL_PADDING;
    const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidthLeft;
    const yAxisLabelWidthRight = maxLabelWidthRight + TICK_LABEL_PADDING;
    const axisXEnd = DEFAULT_MARGIN.left + yAxisLabelWidthRight;
    setdrawableChartWidth(width - axisXStart - DEFAULT_MARGIN.right + 20);
    let hgt = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom;
    setdrawableChartHeight(hgt)
    if (sideY.current) {
      sideY.current.setAttribute("transform", `translate(${- DEFAULT_MARGIN.right - 30},0)`);
    }
  }, [chartSvgRef, width, height, data, sideY.current])


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

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, drawableChartWidth],
        padding: 0.4,
        domain: chartData.map((d) => d.xAxis),
      }),
    [drawableChartWidth, chartData]
  );

  const leftScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [drawableChartHeight, 0],
        domain: [0, leftMax * SCALE_PADDING],
      }),
    [drawableChartHeight, leftMax]
  );

  const rightScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [drawableChartHeight, 0],
        domain: [0, rightMax * SCALE_PADDING],
      }),
    [drawableChartHeight, rightMax]
  );

  const legendData = useMemo(
    () => [
      { label: yAxisLeftLabel, value: 0 },
      { label: yAxisRightLabel, value: 0 },
    ],
    [yAxisLeftLabel, yAxisRightLabel]
  );

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const nodesleft = chartSvgRef.current.querySelectorAll(".visx-axis-left");
    const widthsleft = Array.from(nodesleft).map((node) => (node as SVGGraphicsElement).getBBox().width);
    setMaxLabelWidthLeft(Math.max(...widthsleft, 0));
    const nodesright = chartSvgRef.current.querySelectorAll(".visx-axis-right");
    console.log("noderight", nodesright)
    const widthsright = Array.from(nodesright).map((node) => (node as SVGGraphicsElement).getBBox().width);
    setMaxLabelWidthRight(Math.max(...widthsright, 0));
  }, [data, width, height]);


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

  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;

    const titleHeight = document.querySelector(".chart-title")?.getBoundingClientRect().height || 0;
    const legendHeight = document.querySelector(".chart-legend")?.getBoundingClientRect().height || 0;

    // Measure right Y-axis tick label widths
    const rightAxisTicks = chartSvgRef.current.querySelectorAll(".visx-axis-right text");
    const rightTickWidths = Array.from(rightAxisTicks).map(
      (node) => (node as SVGGraphicsElement).getBBox().width
    );
    const maxRightTickWidth = Math.max(...rightTickWidths, 0);

    // Measure right Y-axis main label
    const rightAxisLabel = chartSvgRef.current.querySelector(".visx-axis-right-label");
    const rightLabelWidth = rightAxisLabel ? (rightAxisLabel as SVGGraphicsElement).getBBox().width : 0;

    // Calculate extended right margin
    const newRightMargin = Math.max(DEFAULT_MARGIN.right, maxRightTickWidth + rightLabelWidth + 10) + DEFAULT_MARGIN.left;

    // Calculate total width including right margin
    const updatedWidth = Math.max(
      width,
      margin.left + drawableChartWidth + newRightMargin
    );

    // Calculate height based on chart, title and legend
    let updatedHeight = Math.max(
      DEFAULT_MARGIN.top + drawableChartHeight + DEFAULT_MARGIN.bottom + legendHeight + titleHeight,
      height
    ) + 5;

    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [data, width, height, drawableChartWidth]);

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
      return
    }

    requestAnimationFrame(() => {
      const textNodes: SVGTextElement[] = Array.from(
        axis_bottom.current?.querySelectorAll(".visx-axis-bottom text") || []
      );

      if (!textNodes.length) return;

      let usedRects: { x1: number; x2: number }[] = [];

      // Set all full first
      textNodes.forEach((node) => {
        const full = node.dataset.fulltext || node.textContent || "";
        node.setAttribute("display", "block");
        node.textContent = full;
        node.dataset.fulltext = full;
      });
      textNodes.forEach((node, i) => {
        if (i !== 0 && i !== textNodes.length - 1) {
          const bbox = node.getBBox();
          let pnode = node.parentNode as Element;
          let x = 0;
          if (pnode.getAttribute("transform")) {
            x = +pnode.getAttribute("transform").split("translate(")[1].split(",")[0] + bbox.x;
          } else {
            x = +bbox.x
          }
          const rect = { x1: x - 5, x2: x + bbox.width + 5 };
          usedRects.push(rect);
        }
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
        const rect = { x1: x - 5, x2: x + bbox.width + 5 };
        const isOverlapping = usedRects.some((r) => !(rect.x2 < r.x1 || rect.x1 > r.x2));
        if (!isOverlapping) {
          node.textContent = label;
          node.setAttribute("display", "block");
        } else {
          node.textContent = truncated;
          node.setAttribute("display", "block");
        }
      };

      // Always show first and last
      if (firstNode) showAndTruncate(firstNode);
      if (lastNode) showAndTruncate(lastNode);

      usedRects = [];
      textNodes.forEach((node) => {
        const bbox = node.getBBox();
        let pnode = node.parentNode as Element;
        let x = 0;
        if (pnode.getAttribute("transform")) {
          x = +pnode.getAttribute("transform").split("translate(")[1].split(",")[0] + bbox.x;
        } else {
          x = +bbox.x
        }
        const rect = { x1: x, x2: x + bbox.width };
        usedRects.push(rect);
      });

      // Hide overlapping others
      textNodes.slice(1, -1).forEach((node, index) => {
        const label = node.dataset.fulltext || node.textContent || "";
        const truncated = label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
        const original = node.textContent;
        // node.textContent = truncated;
        const bbox = node.getBBox();
        node.textContent = original;
        let x = 0;
        let pnode = node.parentNode as Element;
        if (pnode.getAttribute("transform")) {
          x = +pnode.getAttribute("transform").split("translate(")[1].split(",")[0] + bbox.x;
        } else {
          x = +bbox.x
        }
        const rect = { x1: x, x2: x + bbox.width };
        let us = usedRects.filter((r, i) => i !== index + 1)
        const isOverlapping = us.some((r) => !(rect.x2 < r.x1 || rect.x1 > r.x2));
        if (!isOverlapping) {
          node.textContent = label;
          node.setAttribute("display", "block");
        } else {
          node.textContent = truncated;
          const bbox = node.getBBox();
          let x = 0;
          let pnode = node.parentNode as Element;
          if (pnode.getAttribute("transform")) {
            x = +pnode.getAttribute("transform").split("translate(")[1].split(",")[0] + bbox.x;
          } else {
            x = +bbox.x
          }
          const rect = { x1: x - 5, x2: x + bbox.width + 5 };
          const isOverlapping = usedRects.some((r) => !(rect.x2 < r.x1 || rect.x1 > r.x2));
          if (!isOverlapping) {
            node.textContent = truncated;
            node.setAttribute("display", "block");
          } else {
            const newtruncated = truncated.slice(0, Math.floor(truncated.length * TRUNCATE_RATIO * .1)) + "…";
            node.textContent = newtruncated;
            let x = 0;
            let pnode = node.parentNode as Element;
            if (pnode.getAttribute("transform")) {
              x = +pnode.getAttribute("transform").split("translate(")[1].split(",")[0] + bbox.x;
            } else {
              x = +bbox.x
            }
            const rect = { x1: x - 5, x2: x + bbox.width + 5 };
            const isOverlapping = usedRects.some((r) => !(rect.x2 < r.x1 || rect.x1 > r.x2));
            if (isOverlapping) {
              node.setAttribute("display", "none");
            }
          }
        }
      });
    });
  }, [xScale, axis_bottom.current]);


  const rotated = (rotate: boolean) => {
    let rot = rotate;
    setTimeout(() => {
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
        setAdjustedChartHeight(updatedHeight - 10);
        setAdjustedChartWidth(updatedWidth);
      }
    }, 200)
  }

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
      <svg ref={chartSvgRef} width={adjustedChartWidth || width} height={adjustedChartHeight || height}>
        {isLoading && <SvgShimmer />}
        <Group top={DEFAULT_MARGIN.top} left={DEFAULT_MARGIN.left}>
          <g ref={axis_bottom}>
            <XAxis
              scale={xScale}
              top={drawableChartHeight - (AXIS_ROTATE ? 10 : 0)}
              isLoading={isLoading}
              showTicks={showTicks}
              showAxisLine={showXAxis}
              labels={chartData.map((d) => String(d.xAxis))}
              availableWidth={drawableChartWidth}
              label={xAxislabel}
              labelProps={{
                verticalAnchor: "start",
                dy: 60,
              }}
              autoRotate
              forceFullLabels
              {...xAxisProps}
              rotated={rotated}
            />
          </g>
          {showGrid && (
            <Grid
              width={drawableChartWidth}
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
                const barHeight = drawableChartHeight - (leftScale(d.yAxisLeft) ?? 0);
                const barY = drawableChartHeight - barHeight;
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
                left={drawableChartWidth}
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
