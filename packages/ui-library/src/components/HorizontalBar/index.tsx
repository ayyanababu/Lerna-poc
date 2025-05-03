 
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import ErrorBoundary from "../ErrorBoundary";

const DEFAULT_MARGIN = {
  top: 0,
  right: 20,
  bottom: 30,
  left: 0,
};
const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.02;
const DEFAULT_MAX_BAR_HEIGHT = 16;
const TICK_LABEL_PADDING = 16;
const TRUNCATE_RATIO = 0.75;
let AXISX_ROTATE = true;
const AXISY_ROTATE = false;
const BASE_ADJUST_WIDTH = 5; // used to fix the check width for the overlap of xaxis
const ADD_ADJUST_WIDTH = 0; // used to check the overlap of xaxis
const BASE_ADJUST_HEIGHT = 0; // used to fix the check width for the overlap of yaxis
const ADD_ADJUST_HEIGHT = 0; // used to check the overlap of yaxis
const bottomHeightAddOnSpace = 0;
const titleHeightAddOnSpace = 0;
const truncatedLabelSuffix = "..";
const activatesizing = false;
const nodenametocheck = "SVG";

function getMaxLabelWidth(labels: string[], font = "10px sans-serif") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;
  return Math.max(...labels.map((label) => ctx.measureText(label).width));
}

function truncateLabel(rawLabel: string, maxChars = 15) {
  return rawLabel.length <= maxChars
    ? rawLabel
    : `${rawLabel.substring(0, maxChars)}…`;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data: _data,
  title,
  colors = [],
  isLoading = false,
  maxBarHeight = DEFAULT_MAX_BAR_HEIGHT,
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

  const {
    parentRef,
    width = 0,
    height = 0,
  } = useParentSize({ debounceTime: 150 });

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(
    null,
  );
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(
    null,
  );
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const axis_bottom = useRef<SVGGElement | null>(null);
  const axis_left = useRef<SVGGElement | null>(null);
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);
  const [bottomHeight, setBottomHeight] = useState(0);
  const [titleHeight, setTitleHeight] = useState(0);
  const [Wrapped, setWrapped] = useState(false);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData[]>();

  useEffect(() => {
    if (parentRef.current && activatesizing) {
      setTimeout(() => {
        const legendboxtimer = setInterval(() => {
          if (
            parentRef.current.parentNode &&
            parentRef.current.parentNode.querySelectorAll("div")[0]
          ) {
            const legendbox =
              parentRef.current.parentNode.querySelectorAll("div")[0];
            const spans =
              parentRef.current?.parentNode?.parentNode?.querySelectorAll<HTMLSpanElement>(
                "span",
              );
            const lastSpan = spans ? spans[spans.length - 1] : null;
            setBottomHeight(
              legendbox.offsetHeight +
                lastSpan.offsetHeight +
                bottomHeightAddOnSpace,
            );
            clearInterval(legendboxtimer);
          }
        }, 10);
        const titleboxtimer = setInterval(() => {
          const titlebox =
            parentRef.current?.parentNode?.parentNode.querySelector<HTMLSpanElement>(
              ".MuiTypography-h6",
            );
          if (titlebox) {
            setTitleHeight(titlebox.offsetHeight + titleHeightAddOnSpace);
            clearInterval(titleboxtimer);
          }
        }, 10);
      }, 100);
    }
  }, [parentRef.current]);

  const data = useMemo<DataPoint[]>(
    () => (isLoading ? mockHorizontalBarChartData : _data),
    [isLoading, _data],
  );

  console.log("data", data);

  const filteredData = useMemo(
    () => data.filter((_, index) => !hideIndex.includes(index)),
    [data, hideIndex],
  );

  const truncatedLabels = useMemo(
    () => filteredData.map((d) => truncateLabel(String(d.label), 15)),
    [filteredData],
  );

  const maxLabelPx = useMemo(() => {
    if (!truncatedLabels.length) return 0;
    return getMaxLabelWidth(truncatedLabels, "10px sans-serif");
  }, [truncatedLabels]);

  const margin = useMemo(() => {
    if (!width) return DEFAULT_MARGIN;
    let desiredLeft = maxLabelPx + 20;
    if (desiredLeft > width / 3) desiredLeft = width / 3;
    desiredLeft = Math.max(desiredLeft, DEFAULT_MARGIN.left);
    const showingXAxis = xAxisProps?.isVisible !== false;
    const bottomMargin = showingXAxis
      ? DEFAULT_MARGIN.bottom
      : Math.max(DEFAULT_MARGIN.bottom - 10, 10);
    const rightMargin = Math.min(DEFAULT_MARGIN.right, 20);
    return {
      ...DEFAULT_MARGIN,
      left: desiredLeft,
      bottom: bottomMargin,
      right: rightMargin,
    };
  }, [maxLabelPx, width, xAxisProps]);

  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidth;
  const drawableChartWidth = width - axisXStart - DEFAULT_MARGIN.right;
  // const drawableChartWidth = width - margin.left - margin.right;
  let drawableChartHeight = height - margin.top - margin.bottom;

  const maxValue = useMemo(
    () =>
      Math.max(0, ...filteredData.map((d) => Number(d.value) || 0)) *
      SCALE_PADDING,
    [filteredData],
  );

  const yScale = useMemo(
    () =>
      scaleBand<string>({
        domain: filteredData.map((d) => String(d.label)),
        range: [0, drawableChartHeight],
        padding: 0.4,
        round: true,
      }),
    [filteredData, drawableChartHeight],
  );

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue],
        range: [0, drawableChartWidth],
        nice: true,
      }),
    [maxValue, drawableChartWidth],
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

  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;

    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();

    //   const titleEl = document.querySelector(
    //     ".chart-title",
    //   ) as HTMLElement | null;
    //   const legendEl = document.querySelector(
    //     ".chart-legend",
    //   ) as HTMLElement | null;

    //const titleHeight = titleEl?.getBoundingClientRect().height || 0;
    const legendHeight = bottomHeight; //legendEl?.getBoundingClientRect().height || 0;

    const totalTop = margin.top + titleHeight;
    const totalBottom = margin.bottom + legendHeight;
    const requiredHeight = totalTop + bbox.height + totalBottom;
    const requiredWidth = margin.left + drawableChartWidth + margin.right;

    const updatedHeight = Math.max(requiredHeight, height);
    const updatedWidth = Math.max(requiredWidth, width);

    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [
    data,
    width,
    height,
    margin,
    drawableChartWidth,
    bottomHeight,
    titleHeight,
  ]);

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const labels = chartSvgRef.current.querySelectorAll(".visx-axis-left text");
    const widths = Array.from(labels).map(
      (node) => (node as SVGGraphicsElement).getBBox().width,
    );
    setMaxLabelWidth(Math.max(...widths, 0));
  }, [data, width, height]);

  /*   useEffect(() => {
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
 */
  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;
    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();
    const legendHeight = bottomHeight;
    let updatedHeight = Math.max(
      DEFAULT_MARGIN.top +
        bbox.height +
        DEFAULT_MARGIN.bottom +
        legendHeight +
        titleHeight,
      height,
    );
    const updatedWidth = Math.max(
      width,
      DEFAULT_MARGIN.left + innerWidth + DEFAULT_MARGIN.right,
    );
    if (AXISY_ROTATE) {
      updatedHeight =
        updatedHeight -
        (
          chartSvgRef.current.querySelector(".visx-axis-bottom") as SVGGElement
        ).getBBox().height;
    }
    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [
    data,
    width,
    height,
    DEFAULT_MARGIN,
    isLoading,
    innerWidth,
    bottomHeight,
    titleHeight,
  ]);

  const truncateXAxis = (
    textNodes: SVGTextElement[],
    usedRects: { x1: number; x2: number }[],
    axisadded: { [key: number]: boolean },
    centeronly: boolean,
  ) => {
    textNodes.slice(1, -1).forEach((node: SVGTextElement, index: number) => {
      if (node && node.parentNode.nodeName.toUpperCase() !== nodenametocheck) {
        const label = node.dataset.fulltext || node.textContent || "";
        let truncated = label;
        if (label.length > 3) {
          truncated =
            label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) +
            truncatedLabelSuffix;
        }
        const original = node.textContent;
        // node.textContent = truncated;
        const bbox = node.getBBox();
        node.textContent = original;
        let x = 0;
        const pnode = node.parentNode as Element;
        if (pnode.getAttribute("transform")) {
          x =
            +pnode
              .getAttribute("transform")
              .split("translate(")[1]
              .split(",")[0] + bbox.x;
        } else {
          x = +bbox.x;
        }
        const rect = {
          x1: x - ADD_ADJUST_WIDTH,
          x2: x + bbox.width + ADD_ADJUST_WIDTH,
        };
        const us = usedRects.filter(
          (r: { x1: number; x2: number }, i: number) => i === index + 1,
        );
        const isOverlapping = us.some(
          (r: { x1: number; x2: number }) => rect.x1 >= r.x1 && rect.x1 <= r.x2,
        );
        if (!isOverlapping) {
          node.textContent = label;
          node.setAttribute("display", "block");
          axisadded[index + 1] = true;
        } else {
          axisadded[index + 1] = false;
          node.textContent = truncated;
          const bbox = node.getBoundingClientRect();
          let x = 0;
          const pnode = node.parentNode as Element;
          if (pnode.getAttribute("transform")) {
            x =
              +pnode
                .getAttribute("transform")
                .split("translate(")[1]
                .split(",")[0] + bbox.x;
          } else {
            x = +bbox.x;
          }
          const rect = {
            x1: x - ADD_ADJUST_WIDTH,
            x2: x + bbox.width + ADD_ADJUST_WIDTH,
          };
          const isOverlapping = usedRects.some(
            (r: { x1: number; x2: number }) =>
              rect.x1 >= r.x1 && rect.x1 <= r.x2,
          );
          if (!isOverlapping) {
            node.textContent = truncated;
            node.setAttribute("display", "block");
            axisadded[index + 1] = true;
          } else {
            axisadded[index + 1] = false;
            let newtruncated = truncated;
            if (truncated.length > 3) {
              newtruncated =
                truncated.slice(
                  0,
                  Math.floor(truncated.length * TRUNCATE_RATIO * 0.5),
                ) + truncatedLabelSuffix;
            }
            node.textContent = newtruncated;
            let x = 0;
            const pnode = node.parentNode as Element;
            if (pnode.getAttribute("transform")) {
              x =
                +pnode
                  .getAttribute("transform")
                  .split("translate(")[1]
                  .split(",")[0] + bbox.x;
            } else {
              x = +bbox.x;
            }
            const rect = {
              x1: x - ADD_ADJUST_WIDTH,
              x2: x + bbox.width + ADD_ADJUST_WIDTH,
            };
            const isOverlapping = usedRects.some(
              (r: { x1: number; x2: number }) =>
                rect.x1 >= r.x1 && rect.x1 <= r.x2,
            );
            if (isOverlapping) {
              axisadded[index + 1] = false;
              if (!centeronly) {
                //   node.setAttribute("display", "none");
              }
            } else {
              axisadded[index + 1] = true;
            }
          }
        }
      }
    });
  };

  const truncateYAxis = (
    textNodes: SVGTextElement[],
    usedRects: { y1: number; y2: number }[],
    axisadded: { [key: number]: boolean },
    centeronly: boolean,
  ) => {
    textNodes.slice(1, -1).forEach((node: SVGTextElement, index: number) => {
      if (node && node.parentNode.nodeName.toUpperCase() !== nodenametocheck) {
        const label = node.dataset.fulltext || node.textContent || "";
        //  const truncated =
        //    label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
        const original = node.textContent;
        // node.textContent = truncated;
        const bbox = node.getBoundingClientRect();
        node.textContent = original;
        let y = 0;
        const pnode = node.parentNode as Element;
        if (pnode.getAttribute("transform")) {
          y =
            +pnode
              .getAttribute("transform")
              .split("translate(")[1]
              .split(")")[0]
              .split(",")[1] + bbox.y;
        } else {
          y = +bbox.y;
        }
        const rect = {
          y1: y - ADD_ADJUST_HEIGHT,
          y2: y + bbox.height + ADD_ADJUST_HEIGHT,
        };
        const us = usedRects.filter(
          (r: { y1: number; y2: number }, i: number) => i === index + 2,
        );
        const isOverlapping = us.some(
          (r: { y1: number; y2: number }) => rect.y1 >= r.y1 && rect.y1 <= r.y2,
        );
        if (!isOverlapping) {
          node.textContent = label;
          node.setAttribute("display", "block");
          axisadded[index + 1] = true;
        } else {
          axisadded[index + 1] = false;
          if (!centeronly) {
            node.setAttribute("display", "none");
          }
        }
      }
    });
  };

  useEffect(() => {
    return;
  }, [xScale, axis_bottom.current, AXISX_ROTATE, hoveredBar]);

  useEffect(() => {
    if (!axis_left.current || !yScale) return;
    if (AXISY_ROTATE) {
      return;
    }
    const textNodes: SVGTextElement[] = Array.from(
      axis_left.current?.querySelectorAll(".visx-axis-left text") || [],
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
      if (
        i !== 0 &&
        i !== textNodes.length - 1 &&
        node &&
        node.parentNode.nodeName.toUpperCase() !== nodenametocheck
      ) {
        const bbox = node.getBoundingClientRect();
        const pnode = node.parentNode as Element;
        let y = 0;
        if (pnode.getAttribute("transform")) {
          y =
            +pnode
              .getAttribute("transform")
              .split("translate(")[1]
              .split(")")[0]
              .split(",")[1] + bbox.y;
        } else {
          y = +bbox.y;
        }
        const rect = {
          y1: y - BASE_ADJUST_HEIGHT,
          y2: y + bbox.height + BASE_ADJUST_HEIGHT,
        };
        usedRects.push(rect);
      }
    });
    const axisadded = {};
    const firstNode = textNodes[0];
    const lastNode = textNodes[textNodes.length - 1];
    const showAndTruncate = (node: SVGTextElement, index: number) => {
      if (node && node.parentNode.nodeName.toUpperCase() !== nodenametocheck) {
        const label = node.dataset.fulltext || node.textContent || "";
        //     const truncated =
        //       label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
        const bbox = node.getBoundingClientRect();
        const pnode = node.parentNode as Element;
        let y = 0;
        if (pnode.getAttribute("transform")) {
          y =
            +pnode
              .getAttribute("transform")
              .split("translate(")[1]
              .split(")")[0]
              .split(",")[1] + bbox.y;
        } else {
          y = +bbox.y;
        }
        const rect = {
          y1: y - ADD_ADJUST_HEIGHT,
          y2: y + bbox.height + ADD_ADJUST_HEIGHT,
        };
        const isOverlapping = usedRects.some(
          (r: { y1: number; y2: number }) => rect.y1 >= r.y1 && rect.y1 <= r.y2,
        );
        if (!isOverlapping) {
          axisadded[index] = true;
          node.textContent = label;
          node.setAttribute("display", "block");
        } else {
          axisadded[index] = true;
          node.textContent = label;
          node.setAttribute("display", "block");
        }
      }
    };

    // Always show first and last
    if (firstNode) showAndTruncate(firstNode, 0);
    if (lastNode) showAndTruncate(lastNode, textNodes.length - 1);

    usedRects = [];
    textNodes.forEach((node) => {
      if (node && node.parentNode.nodeName.toUpperCase() !== nodenametocheck) {
        const bbox = node.getBoundingClientRect();
        const pnode = node.parentNode as Element;
        let y = 0;
        if (pnode.getAttribute("transform")) {
          y =
            +pnode
              .getAttribute("transform")
              .split("translate(")[1]
              .split(")")[0]
              .split(",")[1] + bbox.y;
        } else {
          y = +bbox.y;
        }
        const rect = {
          y1: y - BASE_ADJUST_HEIGHT,
          y2: y + bbox.height + BASE_ADJUST_HEIGHT,
        };
        usedRects.push(rect);
      }
    });
    truncateYAxis(textNodes, usedRects, axisadded, false);
    const trueCount = Object.values(axisadded).filter(
      (value) => value === true,
    ).length;
    console.log("trued", trueCount);
    if (trueCount < 3) {
      const ntextnodes = [];
      const midcount = Math.round((textNodes.length - 1) / 2);
      textNodes.forEach((node, index) => {
        if (
          node &&
          node.parentNode.nodeName.toUpperCase() !== nodenametocheck &&
          (index === 0 || index === midcount || index === textNodes.length - 1)
        ) {
          const full = node.dataset.fulltext || node.textContent || "";
          node.setAttribute("display", "block");
          node.textContent = full;
          node.dataset.fulltext = full;
          ntextnodes.push(node);
        }
      });
      if (firstNode) showAndTruncate(ntextnodes[0], 0);
      if (lastNode)
        showAndTruncate(
          ntextnodes[ntextnodes.length - 1],
          textNodes.length - 1,
        );
      truncateYAxis(ntextnodes, usedRects, axisadded, true);
    }
  }, [yScale, axis_left.current]);

  const rotated = (rotate: boolean) => {
    AXISX_ROTATE = rotate;
    console.log("rotating");
    if (rotate && chartSvgRef.current) {
      setTimeout(() => {
        //  const svg = chartSvgRef.current;
        //    const bbox = svg.getBBox();
        //    const legendHeight = bottomHeight;
        //     const bottomaxisheight = axis_bottom.current.getBBox().height;
        //     const hgt =
        //      height -
        //     DEFAULT_MARGIN.top -
        //     DEFAULT_MARGIN.bottom -
        //     bottomaxisheight;
        //    setdrawableChartHeight(hgt);
      }, 200);
    }
  };

  const wrapped = (wrapped: boolean) => {
    setTimeout(() => {
      if (wrapped && chartSvgRef.current && axis_bottom.current) {
        setWrapped(wrapped);
        const bottomaxisheight = axis_bottom.current.getBBox().height;
        const hgt =
          height -
          DEFAULT_MARGIN.top -
          DEFAULT_MARGIN.bottom -
          bottomaxisheight -
          bottomHeight;
        drawableChartHeight = hgt - 10;
      }
    }, 300);
  };

  const noData = !isLoading && (!data || data.length === 0);

  return (
    <ChartWrapper
      ref={parentRef}
      isLoading={isLoading}
      title={title}
      titleProps={{ className: "chart-title", ...titleProps }}
      legendsProps={{
        ...legendsProps,
        data: legendData,
        colorScale: scaleOrdinal({
          domain: legendData.map((d) => d.label),
          range: filteredData.map((_, i) => colorScale(i)),
        }),
        hideIndex,
        setHideIndex,
        hovered: hoveredBar !== null ? legendData[hoveredBar]?.label : null,
        setHovered: (label) => {
          const hoveredIndex = legendData?.findIndex(
            (item) => item.label === label,
          );
          setHoveredBar(hoveredIndex !== -1 ? hoveredIndex : null);
        },
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
      {noData ? null : (
      <svg
        ref={chartSvgRef}
        width={adjustedChartWidth || width}
        height={adjustedChartHeight || height}
      >
        {isLoading && <SvgShimmer />}
        <Group top={margin.top} left={margin.left}>
          <g ref={axis_left}>
            <YAxis
              scale={yScale}
              isLoading={isLoading}
              numTicks={filteredData.length}
              showTicks={false}
              {...yAxisProps}
            />
          </g>
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
              //autoRotate
              {...xAxisProps}
              rotated={rotated}
              addGap={BASE_ADJUST_WIDTH}
              wrapped={wrapped}
              barWidth={30}
            />
          </g>
          {filteredData.map((d, index) => {
            const value = Number(d.value);
            if (Number.isNaN(value)) return null;
            const rawBarHeight = yScale.bandwidth();
            const actualBarHeight = Math.min(rawBarHeight, maxBarHeight);
            const bandY = yScale(d.label) || 0;
            const barY = bandY + (rawBarHeight - actualBarHeight) / 2;
            const barLength = xScale(value);
            const barX = 0;
            const isHovered = hoveredBar === index;
            const barOpacity =
              hoveredBar !== null && !isHovered
                ? REDUCED_OPACITY
                : DEFAULT_OPACITY;
            const radius = Math.min(
              DEFAULT_BAR_RADIUS,
              actualBarHeight / 2,
              barLength,
            );
            const pathD = `
              M ${barX},${barY + actualBarHeight}
              L ${barX + barLength - radius},${barY + actualBarHeight}
              Q ${barX + barLength},${barY + actualBarHeight} ${barX + barLength},${barY + actualBarHeight - radius}
              L ${barX + barLength},${barY + radius}
              Q ${barX + barLength},${barY} ${barX + barLength - radius},${barY}
              L ${barX},${barY}
              Z
            `;
            const barColor = d.color || colorScale(index);
            return (
              <CustomBar
                key={`bar-${d.label}`}
                x={barX}
                y={barY}
                width={barLength}
                height={actualBarHeight}
                fill={barColor}
                isLoading={isLoading}
                opacity={barOpacity}
                pathProps={{ d: pathD }}
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
      )}
    </ChartWrapper>
  );
};

const HorizontalBarChartComponent = (props: HorizontalBarChartProps) => {
  return (
    <ErrorBoundary>
      <HorizontalBarChart {...props} />
    </ErrorBoundary>
  );
};

export default HorizontalBarChartComponent;
