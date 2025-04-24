import React, { useEffect, useMemo, useRef, useState } from "react";
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
  right: -40,
  bottom: 25,
  left: 25,
};

const DEFAULT_MAX_BAR_WIDTH = 16;
const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.02;
const TRUNCATE_RATIO = 0.5;
const TICK_LABEL_PADDING = 8;
let AXIS_ROTATE = false;

const getEstimatedYAxisWidth = (maxValue: number, averageCharWidth = 7) => {
  const formattedValue = formatNumberWithSuffix(maxValue);
  const commasCount = Math.floor(
    Math.max(0, Math.abs(maxValue).toString().length - 3) / 3,
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
  const {
    parentRef,
    width = 0,
    height = 0,
  } = useParentSize({ debounceTime: 150 });

  const data = useMemo<DataPoint[]>(
    () => (isLoading ? mockVerticalBarChartData : _data),
    [isLoading, _data],
  );

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const axis_bottom = useRef<SVGGElement | null>(null);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(null);
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(null);
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidth;
  const innerWidth = width - axisXStart - DEFAULT_MARGIN.right;

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const nodes = chartSvgRef.current.querySelectorAll(".visx-axis-left text");
    const widths = Array.from(nodes).map((node) => (node as SVGGraphicsElement).getBBox().width);
    setMaxLabelWidth(Math.max(...widths, 0));
  }, [data, width, height]);


  const filteredData = useMemo(
    () => data.filter((_, index) => !hideIndex.includes(index)),
    [data, hideIndex],
  );

  const margin = useMemo(() => {
    if (!width) return DEFAULT_MARGIN;

    const maxValue = Math.max(
      0,
      ...filteredData.map((d) => Number(d.value) || 0),
    );
    const averageCharWidth = 7;
    const yAxisWidth = getEstimatedYAxisWidth(maxValue, averageCharWidth);

    const xLabels = filteredData.map((d) => String(d.label));
    const totalLabelWidth = xLabels.join("").length * averageCharWidth;
    const needsRotation = xLabels.length > 5 || totalLabelWidth >= width;
    const maxXLabelLength = Math.max(
      ...xLabels.map((label) => label.length),
      0,
    );

    const rotationAdjustment = needsRotation
      ? Math.min(
        5 + (maxXLabelLength > 10 ? (maxXLabelLength - 10) * 1.5 : 0),
        35,
      )
      : 0;

    return {
      top: DEFAULT_MARGIN.top,
      right: DEFAULT_MARGIN.right,
      bottom: DEFAULT_MARGIN.bottom + rotationAdjustment,
      left: Math.max(DEFAULT_MARGIN.left, yAxisWidth),
    };
  }, [DEFAULT_MARGIN, width, filteredData]);

  //  const innerWidth = width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right;
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
      Math.max(0, ...filteredData.map((d) => Number(d.value) || 0)) *
      SCALE_PADDING,
    [filteredData],
  );

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: filteredData.map((d) => String(d.label)),
        range: [0, innerWidth],
        padding: 0.6,
        round: true,
      }),
    [filteredData, innerWidth],
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue],
        range: [innerHeight, 0],
        nice: true,
      }),
    [innerHeight, maxValue],
  );

  const legendData = useMemo(
    () => data.map((d) => ({ label: d.label, value: d.value })),
    [data],
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
        const rect = { x1: x - 5, x2: x + bbox.width + 5 };
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
        const rect = { x1: x - 5, x2: x + bbox.width + 5 };
        let us = usedRects.filter((r, i) => i !== index + 1)
        const isOverlapping = us.some((r) => !(rect.x2 < r.x1 || rect.x1 > r.x2));
        if (!isOverlapping) {
          node.textContent = label;
          node.setAttribute("display", "block");
          usedRects.push(rect);
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
          //   const x = +node.getAttribute("x")!;
          //    const rect = { x1: x - bbox.width, x2: x + bbox.width };
          const isOverlapping = usedRects.some((r) => !(rect.x2 < r.x1 || rect.x1 > r.x2));
          if (!isOverlapping) {
            node.textContent = truncated;
            node.setAttribute("display", "block");
            usedRects.push(rect);
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
        setAdjustedChartHeight(updatedHeight);
        setAdjustedChartWidth(updatedWidth);
      }
    }, 200)
  }

  if (!isLoading && (!_data || _data.length === 0)) {
    return <div>No data to display.</div>;
  }

  return (
    <ChartWrapper
      ref={parentRef}
      isLoading={isLoading}
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
      <svg ref={chartSvgRef} width={adjustedChartWidth || width} height={adjustedChartHeight || height}>
        {isLoading && <SvgShimmer />}
        <Group top={DEFAULT_MARGIN.top} left={yAxisLabelWidth}>
          <YAxis scale={yScale} isLoading={isLoading} {...yAxisProps} />
          <Grid
            width={innerWidth}
            yScale={yScale}
            isLoading={isLoading}
            showHorizontal
            {...gridProps}
          />
          <g ref={axis_bottom}>
            <XAxis
              scale={xScale}
              top={innerHeight}
              isLoading={isLoading}
              availableWidth={innerWidth}
              forceFullLabels
              {...xAxisProps}
              rotated={rotated}
            />
          </g>
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
              barHeight > 0 ? barHeight : 0,
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
