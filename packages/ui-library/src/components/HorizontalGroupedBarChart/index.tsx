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
  left: 0,
};

const DEFAULT_BAR_RADIUS = 5;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.0;
const TICK_LABEL_PADDING = 16;
const TRUNCATE_RATIO = .75;
let AXIS_ROTATE = true;

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
  const {
    parentRef,
    width = 0,
    height = 0,
  } = useParentSize({ debounceTime: 150 });

  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const axis_bottom = useRef<SVGGElement | null>(null);
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);
  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(
    null,
  );
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(
    null,
  );


  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData[]>();

  const { data, groupKeys } = useMemo(
    () =>
      isLoading
        ? mockVerticalGroupedBarChartData
        : { data: _data, groupKeys: _groupKeys },
    [isLoading, _data, _groupKeys],
  );

  const filteredData = useMemo(
    () =>
      data.map((categoryData) => {
        const d = cloneDeep(categoryData);
        groupKeys.forEach((groupKey, index) => {
          if (hideIndex.includes(index)) delete d.data?.[groupKey];
        });
        return d;
      }),
    [data, hideIndex, groupKeys],
  );

  const legendData = useMemo(
    () =>
      groupKeys.map((key) => ({
        label: capitalize(lowerCase(key)),
        value: data.reduce((total, d) => total + Number(d.data[key] || 0), 0),
      })),
    [groupKeys, data],
  );

  const activeKeys = useMemo(
    () => groupKeys.filter((_, i) => !hideIndex.includes(i)),
    [groupKeys, hideIndex],
  );

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
          activeKeys.reduce((sum, key) => sum + Number(d.data[key] || 0), 0),
        ),
      );
    }
    return Math.max(
      0,
      ...filteredData.flatMap((d) =>
        activeKeys.map((key) => Number(d.data[key]) || 0),
      ),
    );
  }, [filteredData, activeKeys, type]);

  const categoryScale = useMemo(
    () =>
      scaleBand<string>({
        domain: filteredData.map((d) => d.label),
        range: [0, height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom],
        padding: 0.4,
      }),
    [filteredData, height, DEFAULT_MARGIN.top, DEFAULT_MARGIN.bottom],
  );

  const groupScale = useMemo(
    () =>
      scaleBand<string>({
        domain: activeKeys,
        range: [0, categoryScale.bandwidth()],
        padding: 0.3,
      }),
    [activeKeys, categoryScale],
  );

  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidth;
  const drawableChartWidth = width - axisXStart - DEFAULT_MARGIN.right;

  const valueScale = scaleLinear<number>({
    domain: [0, maxValue * SCALE_PADDING],
    range: [0, Math.max(0, drawableChartWidth)],
    nice: true,
  });

  const groupColorScale = useMemo(
    () =>
      scaleOrdinal<string, string>({
        domain: groupKeys,
        range: colors.length ? colors : theme.colors.charts.bar,
      }),
    [groupKeys, colors, theme.colors.charts.bar],
  );

  const renderBar = (props: any) => <CustomBar {...props} />;

  const handleMouseMove =
    (groupKey: string, value: number) => (e: React.MouseEvent) => {
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
        const barOpacity =
          hoveredGroupKey && !isHovered ? REDUCED_OPACITY : DEFAULT_OPACITY;
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
    const widths = Array.from(labels).map(
      (node) => (node as SVGGraphicsElement).getBBox().width,
    );
    setMaxLabelWidth(Math.max(...widths, 0));
  }, [data, width, height]);

  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;
    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();

    const titleEl = document.querySelector(
      ".chart-title",
    ) as HTMLElement | null;
    const legendEl = document.querySelector(
      ".chart-legend",
    ) as HTMLElement | null;

    const titleHeight = titleEl?.getBoundingClientRect().height || 0;
    const legendHeight = legendEl?.getBoundingClientRect().height || 0;

    const totalTop = DEFAULT_MARGIN.top + titleHeight;
    const totalBottom = DEFAULT_MARGIN.bottom + legendHeight;
    const requiredHeight = totalTop + bbox.height + totalBottom;

    setAdjustedChartHeight(Math.max(requiredHeight, height) + 5);
    setAdjustedChartWidth(width);
  }, [data, width, height, DEFAULT_MARGIN]);

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
  }, [categoryScale, axis_bottom.current]);


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
        <Group top={DEFAULT_MARGIN.top} left={DEFAULT_MARGIN.left + yAxisLabelWidth}>
          <g transform={`translate(${(-1 * yAxisLabelWidth)},0)`}>
            <AxisLeft
              scale={categoryScale}
              stroke={theme.colors.axis.line}
              tickStroke={theme.colors.axis.line}
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
          </g>
          <g ref={axis_bottom}>
            <AxisBottom
              scale={valueScale}
              top={height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom}
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
          </g>
          <g>
            {valueScale.ticks(5).map((tick) => (
              <line
                key={tick}
                y1={0}
                y2={height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom}
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
    </ChartWrapper >
  );
};

export default HorizontalGroupedBarChart;
