import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { stack } from "@visx/shape";
import { useTooltip } from "@visx/tooltip";
import { capitalize, cloneDeep, lowerCase } from "lodash-es";

import useTheme from "../../../hooks/useTheme";
import { ChartWrapper } from "../../ChartWrapper";
import CustomBar from "../../CustomBar";
import Grid from "../../Grid";
import SvgShimmer, { shimmerGradientId } from "../../Shimmer/SvgShimmer";
import { TooltipData } from "../../Tooltip/types";
import XAxis from "../../XAxis";
import YAxis from "../../YAxis";
import { mockVerticalStackedBarChartData } from "./mockdata";
import { VerticalStackedBarChartProps } from "./types";

const DEFAULT_MARGIN = {
  top: 20,
  right: -60,
  bottom: 45,
  left: 20,
};


const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;
const MAX_BAR_WIDTH = 16;
const TICK_LABEL_PADDING = 8;
const TRUNCATE_RATIO = 0.75;
let AXISX_ROTATE = false;
let AXISY_ROTATE = false;

function VerticalStackedBar({
  data: _data,
  groupKeys: _groupKeys,
  margin = DEFAULT_MARGIN,
  title,
  timestamp,
  colors = [],
  isLoading,
  barWidth,
  titleProps,
  legendsProps,
  tooltipProps,
  showTicks = false,
  yAxisProps,
  xAxisProps,
  gridProps,
  barProps,
  timestampProps,
  showYAxis = true,
  showXAxis = true,
  onClick,
}: VerticalStackedBarChartProps) {
  const { theme } = useTheme();
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  //const innerWidth = width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right;
  const innerHeight = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom;
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);
  const axis_bottom = useRef<SVGGElement | null>(null);
  const axis_left = useRef<SVGGElement | null>(null);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(null);
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(null);

  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidth;
  const innerWidth = width - axisXStart - DEFAULT_MARGIN.right;


  const getStrokeWidth = (width: number, height: number) => {
    const size = Math.min(width, height);
    // Scale between 0.3 and 1 based on size
    return Math.max(0.3, Math.min(1, size / 500));
  };
  const strokeWidth = getStrokeWidth(width, height);

  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [legendHoveredGroupKey, setLegendHoveredGroupKey] = useState<
    string | null
  >(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
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
        ? mockVerticalStackedBarChartData
        : { data: _data, groupKeys: _groupKeys },
    [isLoading, _data, _groupKeys, mockVerticalStackedBarChartData],
  );

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const nodes = chartSvgRef.current.querySelectorAll(".visx-axis-left text");
    const widths = Array.from(nodes).map((node) => (node as SVGGraphicsElement).getBBox().width);
    setMaxLabelWidth(Math.max(...widths, 0));
  }, [data, width, height]);

  const filteredData = useMemo(
    () =>
      data.map((categoryData) => {
        const d = cloneDeep(categoryData);
        if (hideIndex.length > 0) {
          groupKeys.forEach((groupKey, index) => {
            if (hideIndex.includes(index) && d.data) {
              delete d.data[groupKey];
            }
          });
        }
        if (legendHoveredGroupKey) {
          const groupKey = legendHoveredGroupKey;
          d.data = {
            [groupKey]: d.data[groupKey],
          };
        }
        return d;
      }),
    [data, hideIndex, groupKeys, legendHoveredGroupKey],
  );

  const legendData = useMemo(
    () =>
      groupKeys.map((key) => ({
        label: capitalize(lowerCase(key)),
        value: data.reduce(
          (total, categoryData) => total + Number(categoryData.data[key] || 0),
          0,
        ),
      })),
    [groupKeys, data],
  );

  const activeKeys = useMemo(
    () => groupKeys.filter((_, index) => !hideIndex.includes(index)),
    [groupKeys, hideIndex],
  );

  const stackedData = useMemo(() => {
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
    } catch (error) {
      console.error("Error generating stack data:", error);
      return [];
    }
  }, [activeKeys, filteredData]);

  const maxValue = useMemo(
    () =>
      Math.max(
        0,
        ...filteredData.map((d) =>
          Object.entries(d.data)
            .filter(([key]) => activeKeys.includes(key))
            .reduce((sum, [, value]) => sum + Number(value || 0), 0),
        ),
      ),
    [filteredData, activeKeys],
  );

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: filteredData.map((d) => String(d.label)),
        range: [0, innerWidth],
        padding: 0.4,
      }),
    [filteredData, innerWidth]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue * SCALE_PADDING],
        range: [innerHeight, 0],
      }),
    [innerHeight, maxValue]
  );

  const colorScale = useMemo(
    () =>
      scaleOrdinal<string, string>({
        domain: groupKeys,
        range: colors?.length ? colors : theme.colors.charts.stackedBar,
      }),
    [groupKeys, colors, theme.colors.charts.stackedBar],
  );

  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;
    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();
    const titleHeight = document.querySelector(".chart-title")?.getBoundingClientRect().height || 0;
    const legendHeight = document.querySelector(".chart-legend")?.getBoundingClientRect().height || 0;
    let updatedHeight = Math.max(DEFAULT_MARGIN.top + bbox.height + DEFAULT_MARGIN.bottom + legendHeight + titleHeight, height) + 5;
    const updatedWidth = Math.max(width, DEFAULT_MARGIN.left + innerWidth + DEFAULT_MARGIN.right);
    if (AXISX_ROTATE) {
      updatedHeight = updatedHeight - (chartSvgRef.current.querySelector('.visx-axis-bottom') as SVGGElement).getBBox().height
    }
    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [data, width, height, DEFAULT_MARGIN, innerWidth]);

  const truncateXAxis = (textNodes: any, usedRects: any, axisadded: any, centeronly: boolean) => {
    textNodes.slice(1, -1).forEach((node: any, index: number) => {
      const label = node.dataset.fulltext || node.textContent || "";
      let truncated = label;
      if (label.length > 3) {
        truncated = label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
      }
      console.log("tr", truncated);
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
        axisadded[index + 1] = true;
      } else {
        axisadded[index + 1] = false;
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
          axisadded[index + 1] = true;
        } else {
          axisadded[index + 1] = false;
          let newtruncated = truncated
          if (truncated.length > 3) {
            newtruncated = truncated.slice(0, Math.floor(truncated.length * TRUNCATE_RATIO * .5)) + "…";
          }
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
            axisadded[index + 1] = false;
            if (!centeronly) {
              node.setAttribute("display", "none");
            }
          } else {
            axisadded[index + 1] = true;
          }
        }
      }
    });
  }


  const truncateYAxis = (textNodes: any, usedRects: any, axisadded: any) => {
    textNodes.slice(1, -1).forEach((node: any, index: number) => {
      const label = node.dataset.fulltext || node.textContent || "";
      const truncated = label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
      const original = node.textContent;
      // node.textContent = truncated;
      const bbox = node.getBBox();
      node.textContent = original;
      let y = 0;
      let pnode = node.parentNode as Element;
      if (pnode.getAttribute("transform")) {
        y = +pnode.getAttribute("transform").split("translate(")[1].split(",")[1] + bbox.y;
      } else {
        y = +bbox.y
      }
      const rect = { y1: y, y2: y + bbox.height };
      let us = usedRects.filter((r, i: number) => i !== index + 1)
      const isOverlapping = us.some((r) => !(rect.y2 < r.y1 || rect.y1 > r.y2));
      if (!isOverlapping) {
        node.textContent = label;
        node.setAttribute("display", "block");
        axisadded[index + 1] = true;
      } else {
        axisadded[index + 1] = false;
        node.setAttribute("display", "none");
      }
    });
  }


  useEffect(() => {
    if (!axis_bottom.current || !xScale) return;
    if (AXISX_ROTATE) {
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
      let axisadded = {};
      const firstNode = textNodes[0];
      const lastNode = textNodes[textNodes.length - 1];
      const showAndTruncate = (node: SVGTextElement, index: number) => {
        const label = node.dataset.fulltext || node.textContent || "";
        let truncated = label;
        if (label.length > 3) {
          truncated = label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
        }
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
          axisadded[index] = true;
          node.textContent = label;
          node.setAttribute("display", "block");
        } else {
          node.textContent = truncated;
          axisadded[index] = true;
          node.setAttribute("display", "block");
        }
      };

      // Always show first and last
      if (firstNode) showAndTruncate(firstNode, 0);
      if (lastNode) showAndTruncate(lastNode, textNodes.length - 1);

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
      truncateXAxis(textNodes, usedRects, axisadded, false);
      console.log(axisadded);
      const trueCount = Object.values(axisadded).filter(value => value === true).length;
      console.log(trueCount);
      if (trueCount < 3) {
        let ntextnodes = [];
        let midcount = Math.round((textNodes.length - 1) / 2);
        textNodes.forEach((node, index) => {
          if (index === 0 || index === midcount || index === textNodes.length - 1) {
            const full = node.dataset.fulltext || node.textContent || "";
            node.setAttribute("display", "block");
            node.textContent = full;
            node.dataset.fulltext = full;
            ntextnodes.push(node)
          }
        });
        if (firstNode) showAndTruncate(ntextnodes[0], 0);
        if (lastNode) showAndTruncate(ntextnodes[ntextnodes.length - 1], textNodes.length - 1);
        truncateXAxis(ntextnodes, usedRects, axisadded, true);
      }
    });
  }, [xScale, axis_bottom.current]);


  useEffect(() => {
    if (!axis_left.current || !yScale) return;
    if (AXISY_ROTATE) {
      return
    }

    requestAnimationFrame(() => {
      const textNodes: SVGTextElement[] = Array.from(
        axis_bottom.current?.querySelectorAll(".visx-axis-left text") || []
      );

      if (!textNodes.length) return;

      let usedRects: { y1: number; y2: number }[] = [];

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
          let y = 0;
          if (pnode.getAttribute("transform")) {
            y = +pnode.getAttribute("transform").split("translate(")[1].split(",")[1] + bbox.y;
          } else {
            y = +bbox.y
          }
          const rect = { y1: y - 5, y2: y + bbox.height + 5 };
          usedRects.push(rect);
        }
      });
      let axisadded = {};
      const firstNode = textNodes[0];
      const lastNode = textNodes[textNodes.length - 1];
      const showAndTruncate = (node: SVGTextElement, index: number) => {
        const label = node.dataset.fulltext || node.textContent || "";
        const truncated = label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
        const bbox = node.getBBox();
        let pnode = node.parentNode as Element;
        let y = 0;
        if (pnode.getAttribute("transform")) {
          y = +pnode.getAttribute("transform").split("translate(")[1].split(",")[1] + bbox.y;
        } else {
          y = +bbox.y
        }
        const rect = { y1: y - 5, y2: y + bbox.height + 5 };
        const isOverlapping = usedRects.some((r) => !(rect.y2 < r.y1 || rect.y1 > r.y2));
        if (!isOverlapping) {
          axisadded[index] = true;
          node.textContent = label;
          node.setAttribute("display", "block");
        } else {
          axisadded[index] = true;
          node.textContent = label;
          node.setAttribute("display", "block");
        }
      };

      // Always show first and last
      if (firstNode) showAndTruncate(firstNode, 0);
      if (lastNode) showAndTruncate(lastNode, textNodes.length - 1);

      usedRects = [];
      textNodes.forEach((node) => {
        const bbox = node.getBBox();
        let pnode = node.parentNode as Element;
        let y = 0;
        if (pnode.getAttribute("transform")) {
          y = +pnode.getAttribute("transform").split("translate(")[1].split(",")[1] + bbox.y;
        } else {
          y = +bbox.y;
        }
        const rect = { y1: y, y2: y + bbox.height };
        usedRects.push(rect);
      });
      truncateYAxis(textNodes, usedRects, axisadded);
      const trueCount = Object.values(axisadded).filter(value => value === true).length;
      console.log(trueCount);
      if (trueCount < 3) {
        let ntextnodes = [];
        let midcount = Math.round((textNodes.length - 1) / 2);
        textNodes.forEach((node, index) => {
          if (index === 0 || index === midcount || index === textNodes.length - 1) {
            const full = node.dataset.fulltext || node.textContent || "";
            node.setAttribute("display", "block");
            node.textContent = full;
            node.dataset.fulltext = full;
            ntextnodes.push(node);
          }
        });
        if (firstNode) showAndTruncate(ntextnodes[0], 0);
        if (lastNode) showAndTruncate(ntextnodes[ntextnodes.length - 1], textNodes.length - 1);
        truncateYAxis(ntextnodes, usedRects, axisadded);
      }
    });
  }, [yScale, axis_left.current]);


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
      AXISX_ROTATE = rotate;

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

  const handleMouseMove = useCallback(
    (groupKey: string, value: number) => (event: React.MouseEvent) => {
      if (!isLoading) {
        showTooltip({
          tooltipData: [
            {
              label: capitalize(lowerCase(groupKey)),
              value,
              color: colorScale(groupKey),
            },
          ],
          tooltipLeft: event.clientX,
          tooltipTop: event.clientY,
        });
        setHoveredGroupKey(groupKey);
      }
    },
    [isLoading, showTooltip, setHoveredGroupKey],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isLoading) {
      hideTooltip();
      setHoveredGroupKey(null);
    }
  }, [isLoading, hideTooltip, setHoveredGroupKey]);

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
        colorScale,
        hideIndex,
        setHideIndex,
        hovered: legendHoveredGroupKey,
        setHovered: setLegendHoveredGroupKey,
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
      timestampProps={{ timestamp, isLoading, ...timestampProps }}
    >
      <svg ref={chartSvgRef} width={adjustedChartWidth || width} height={adjustedChartHeight || height}>
        {isLoading && <SvgShimmer />}

        <Group top={DEFAULT_MARGIN.top} left={DEFAULT_MARGIN.left}>
          <g ref={axis_left}>
            <YAxis
              scale={yScale}
              isLoading={isLoading}
              showTicks={showTicks}
              showAxisLine={showYAxis}
              {...yAxisProps}
            />
          </g>

          <Grid
            width={innerWidth}
            yScale={yScale}
            numTicks={5}
            isLoading={isLoading}
            {...gridProps}
          />
          <g ref={axis_bottom}>
            <XAxis
              scale={xScale}
              top={innerHeight}
              isLoading={isLoading}
              showTicks={showTicks}
              showAxisLine={showXAxis}
              labels={filteredData.map((d) => String(d.label))}
              availableWidth={innerWidth}
              autoRotate
              forceFullLabels
              {...xAxisProps}
              rotated={rotated}
            />
          </g>

          {filteredData.map((categoryData, index) => {
            const category = String(categoryData.label);
            // Calculate bar width with maximum limit
            const calculatedBarWidth = xScale.bandwidth();
            // Use custom barWidth if provided, otherwise use default with maximum limit
            const actualBarWidth =
              barWidth !== undefined
                ? barWidth
                : Math.min(calculatedBarWidth, MAX_BAR_WIDTH);

            // If the bar width is limited, center it
            const barX =
              actualBarWidth < calculatedBarWidth
                ? (xScale(category) || 0) +
                (calculatedBarWidth - actualBarWidth) / 2
                : xScale(category) || 0;

            // Calculate dynamic radius based on bar width
            const dynamicRadius = Math.min(
              DEFAULT_BAR_RADIUS,
              actualBarWidth / 2,
            );

            return activeKeys.map((groupKey, groupIndex) => {
              const seriesData = stackedData.find((s) => s.key === groupKey);
              if (!seriesData) return null;

              const categoryIndex = filteredData.findIndex(
                (d) => d.label === categoryData.label,
              );
              if (categoryIndex === -1) return null;

              const [y0, y1] = seriesData[categoryIndex];
              const barHeight = yScale(y0) - yScale(y1);
              const barY = yScale(y1);
              const value = y1 - y0;

              if (!value) return null;

              const isHoveredGroup = hoveredGroupKey === groupKey;
              const barOpacity =
                hoveredGroupKey && !isHoveredGroup
                  ? REDUCED_OPACITY
                  : DEFAULT_OPACITY;

              // Determine if this is the top bar in the stack
              const isTopBar =
                seriesData.key ===
                stackedData.reduce((topKey, current) => {
                  const currentY1 = current[categoryIndex]?.[1] || 0;
                  const topY1 =
                    stackedData.find((s) => s.key === topKey)?.[
                    categoryIndex
                    ]?.[1] || 0;
                  return currentY1 > topY1 ? current.key : topKey;
                }, activeKeys[0]);

              return (
                <React.Fragment key={`stacked-${category}-${groupKey}`}>
                  <CustomBar
                    key={`stacked-${category}-${groupKey}`}
                    x={barX}
                    y={barY}
                    width={actualBarWidth}
                    height={barHeight}
                    fill={
                      isLoading
                        ? `url(#${shimmerGradientId})`
                        : colorScale(groupKey)
                    }
                    opacity={barOpacity}
                    pathProps={
                      isTopBar
                        ? {
                          d: `
                                M ${barX},${barY + barHeight}
                                L ${barX + actualBarWidth},${barY + barHeight}
                                L ${barX + actualBarWidth},${barY + dynamicRadius}
                                Q ${barX + actualBarWidth},${barY} ${barX + actualBarWidth - dynamicRadius
                            },${barY}
                                L ${barX + dynamicRadius},${barY}
                                Q ${barX},${barY} ${barX},${barY + dynamicRadius}
                                L ${barX},${barY + barHeight}
                                Z
                            `,
                        }
                        : undefined
                    }
                    rx={0}
                    onMouseMove={handleMouseMove(groupKey, value)}
                    onMouseLeave={handleMouseLeave}
                    {...barProps}
                    onClick={(event) => {
                      if (barProps?.onClick) {
                        barProps.onClick(event);
                      }
                      if (onClick) {
                        onClick(event, filteredData[index], [
                          index,
                          groupIndex,
                        ]);
                      }
                    }}
                  />

                  {!isTopBar && (
                    <line
                      x1={barX}
                      y1={barY}
                      x2={barX + actualBarWidth}
                      y2={barY}
                      stroke={theme.colors.common.stroke}
                      strokeWidth={strokeWidth}
                      pointerEvents="none"
                    />
                  )}
                </React.Fragment>
              );
            });
          })}
        </Group>
      </svg>
    </ChartWrapper >
  );
}

export default VerticalStackedBar;
