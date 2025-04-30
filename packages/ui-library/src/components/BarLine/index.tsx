/* eslint-disable max-lines */
import React, { useEffect, useMemo, useRef, useState } from "react";
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

const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.3;
const MAX_BAR_WIDTH = 16;
const DEFAULT_BAR_RADIUS = 4;
const TRUNCATE_RATIO = 0.5;
const TICK_LABEL_PADDING = 8;
let AXISX_ROTATE = false;
const AXISY_ROTATE = true;
const AXISY1_ROTATE = true;
const BASE_ADJUST_WIDTH = 5; // used to fix the check width for the overlap of xaxis
const ADD_ADJUST_WIDTH = 0; // used to check the overlap of xaxis
const BASE_ADJUST_HEIGHT = 0; // used to fix the check width for the overlap of yaxis
const ADD_ADJUST_HEIGHT = 0; // used to check the overlap of yaxis
const bottomHeightAddOnSpace = 0;
const titleHeightAddOnSpace = 0;
const truncatedLabelSuffix = "..";
const activatesizing = true;
const nodenametocheck = "SVG";

//const fontSize = 10;
//const labelPadding = 8;

//function getLabelWidth(label: string) {
//  return label ? label.length * fontSize * 0.6 + labelPadding : 0;
//}

//function getTickWidth(value: number) {
//  const formatted = value.toLocaleString();
//  return formatted.length * fontSize * 0.6 + labelPadding;
//}

const BarLineChart: React.FC<BarLineChartProps> = ({
  data: _data,
  title,
  colors: _colors,
  titleProps,
  isLoading = false,
  maxBarWidth = MAX_BAR_WIDTH,
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
  const DEFAULT_MARGIN = useMemo(
    () => ({
      top: 0,
      right: isLoading ? 0 : 30,
      bottom: isLoading ? 0 : 10,
      left: isLoading ? 0 : 60,
    }),
    [isLoading],
  );
  const {
    parentRef,
    width = 100,
    height = 100,
  } = useParentSize({ debounceTime: 150 });
  const [maxLabelWidthLeft, setMaxLabelWidthLeft] = useState<number>(60);
  //  const [maxLabelWidthRight, setMaxLabelWidthRight] = useState<number>(60);
  const axis_bottom = useRef<SVGGElement | null>(null);
  const axis_left = useRef<SVGGElement | null>(null);
  const axis_right = useRef<SVGGElement | null>(null);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(
    null,
  );
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(
    null,
  );
  const [drawableChartWidth, setdrawableChartWidth] = useState(0);
  const [drawableChartHeight, setdrawableChartHeight] = useState(0);
  const sideY = useRef<SVGSVGElement | null>(null);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  const data = useMemo<BarLineData>(
    () => (isLoading ? mockBarLineChartData : _data),
    [isLoading, _data],
  );

  const { xAxislabel, yAxisLeftLabel, yAxisRightLabel, chartData } = data;

  const [hideChart, setHideChart] = useState<number[]>([]);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);
  const [bottomHeight, setBottomHeight] = useState(0);
  const [titleHeight, setTitleHeight] = useState(0);
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
  const [Wrapped, setWrapped] = useState(false);

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

  //  const yAxisLeftTickWidth = getTickWidth(leftMax);
  //  const yAxisRightTickWidth = getTickWidth(rightMax);
  //  const yAxisLeftLabelWidth = getLabelWidth(yAxisLeftLabel);
  //  const yAxisRightLabelWidth = getLabelWidth(yAxisRightLabel);

  /*   const margin = useMemo(
    () => ({
      ...DEFAULT_MARGIN,
      left: Math.max(
        DEFAULT_MARGIN.left,
        yAxisLeftTickWidth + yAxisLeftLabelWidth,
      ),
      right: Math.max(
        DEFAULT_MARGIN.right,
        yAxisRightTickWidth + yAxisRightLabelWidth,
      ),
    }),
    [
      DEFAULT_MARGIN,
      isLoading,
      yAxisLeftTickWidth,
      yAxisRightTickWidth,
      yAxisLeftLabelWidth,
      yAxisRightLabelWidth,
    ],
  );
 */
  //  const drawableWidth = width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right;
  //  const drawableHeight = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom;

  useEffect(() => {
    const yAxisLabelWidthLeft = maxLabelWidthLeft + TICK_LABEL_PADDING;
    const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidthLeft;
    //    const yAxisLabelWidthRight = maxLabelWidthRight + TICK_LABEL_PADDING;
    // const axisXEnd = DEFAULT_MARGIN.left + yAxisLabelWidthRight;
    setdrawableChartWidth(width - axisXStart - DEFAULT_MARGIN.right + 20);
    const hgt =
      height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom - bottomHeight;
    setdrawableChartHeight(hgt);
    if (sideY.current) {
      sideY.current.setAttribute(
        "transform",
        `translate(${-DEFAULT_MARGIN.right - 30},0)`,
      );
    }
  }, [
    chartSvgRef,
    width,
    height,
    data,
    sideY.current,
    DEFAULT_MARGIN,
    isLoading,
    bottomHeight,
  ]);

  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;
    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();
    const legendHeight = bottomHeight;
    let updatedHeight =
      Math.max(
        DEFAULT_MARGIN.top +
          bbox.height +
          DEFAULT_MARGIN.bottom +
          legendHeight +
          titleHeight,
        height,
      ) + 5;
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

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, drawableChartWidth],
        padding: 0.4,
        domain: chartData.map((d) => d.xAxis),
      }),
    [drawableChartWidth, chartData],
  );

  const leftScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [drawableChartHeight, 0],
        domain: [0, leftMax * SCALE_PADDING],
      }),
    [drawableChartHeight, leftMax],
  );

  const rightScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [drawableChartHeight, 0],
        domain: [0, rightMax * SCALE_PADDING],
      }),
    [drawableChartHeight, rightMax],
  );

  const legendData = useMemo(
    () => [
      { label: yAxisLeftLabel, value: 0 },
      { label: yAxisRightLabel, value: 0 },
    ],
    [yAxisLeftLabel, yAxisRightLabel],
  );

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const nodesleft = chartSvgRef.current.querySelectorAll(".visx-axis-left");
    const widthsleft = Array.from(nodesleft).map(
      (node) => (node as SVGGraphicsElement).getBBox().width,
    );
    setMaxLabelWidthLeft(Math.max(...widthsleft, 0));
    //  const nodesright = chartSvgRef.current.querySelectorAll(".visx-axis-right");
    //    const widthsright = Array.from(nodesright).map(
    //      (node) => (node as SVGGraphicsElement).getBBox().width,
    //    );
    //    setMaxLabelWidthRight(Math.max(...widthsright, 0));
  }, [data, width, height]);

  const defaultBarWidth = xScale.bandwidth();
  const actualBarWidth = Math.min(defaultBarWidth, maxBarWidth);
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

  /*   useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;

    const titleHeight =
      document.querySelector(".chart-title")?.getBoundingClientRect().height ||
      0;
    const legendHeight =
      document.querySelector(".chart-legend")?.getBoundingClientRect().height ||
      0;

    // Measure right Y-axis tick label widths
    const rightAxisTicks = chartSvgRef.current.querySelectorAll(
      ".visx-axis-right text",
    );
    const rightTickWidths = Array.from(rightAxisTicks).map(
      (node) => (node as SVGGraphicsElement).getBBox().width,
    );
    const maxRightTickWidth = Math.max(...rightTickWidths, 0);

    // Measure right Y-axis main label
    const rightAxisLabel = chartSvgRef.current.querySelector(
      ".visx-axis-right-label",
    );
    const rightLabelWidth = rightAxisLabel
      ? (rightAxisLabel as SVGGraphicsElement).getBBox().width
      : 0;

    // Calculate extended right margin
    const newRightMargin =
      Math.max(DEFAULT_MARGIN.right, maxRightTickWidth + rightLabelWidth + 10) +
      DEFAULT_MARGIN.left;

    // Calculate total width including right margin
    const updatedWidth = Math.max(
      width,
      margin.left + drawableChartWidth + newRightMargin,
    );

    // Calculate height based on chart, title and legend
    const updatedHeight =
      Math.max(
        DEFAULT_MARGIN.top +
          drawableChartHeight +
          DEFAULT_MARGIN.bottom +
          legendHeight +
          titleHeight,
        height,
      ) + 5;

    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [data, width, height, drawableChartWidth, DEFAULT_MARGIN]);
 */
  /*   useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;
    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();
    const titleHeight =
      document.querySelector(".chart-title")?.getBoundingClientRect().height ||
      0;
    const legendHeight =
      document.querySelector(".chart-legend")?.getBoundingClientRect().height ||
      0;
    let updatedHeight =
      Math.max(
        DEFAULT_MARGIN.top +
          bbox.height +
          DEFAULT_MARGIN.bottom +
          legendHeight +
          titleHeight,
        height,
      ) + 5;
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
  }, [data, width, height, DEFAULT_MARGIN, isLoading, innerWidth]);
 */
  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;
    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();
    const legendHeight = bottomHeight;
    let updatedHeight =
      Math.max(
        DEFAULT_MARGIN.top +
          bbox.height +
          DEFAULT_MARGIN.bottom +
          legendHeight +
          titleHeight,
        height,
      ) + 5;
    const updatedWidth = Math.max(
      width,
      DEFAULT_MARGIN.left + innerWidth + DEFAULT_MARGIN.right,
    );
    if (AXISX_ROTATE) {
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
          (r: { x1: number; x2: number }, i: number) => i === index + 2,
        );
        console.log(usedRects);
        console.log(rect);
        console.log("nusa", us);
        const isOverlapping = us.some(
          (r: { x1: number; x2: number }) => rect.x2 >= r.x1 && rect.x2 <= r.x2,
        );
        console.log("barus", us);
        console.log("barrect", usedRects);
        console.log("barrett", rect);
        console.log(label);
        console.log("over", isOverlapping);
        if (!isOverlapping) {
          node.textContent = label;
          node.setAttribute("display", "block");
          axisadded[index + 1] = true;
        } else {
          axisadded[index + 1] = false;
          node.textContent = truncated;
          const bbox = node.getBBox();
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
              rect.x2 >= r.x1 && rect.x2 <= r.x2,
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
                rect.x2 >= r.x1 && rect.x2 <= r.x2,
            );
            if (isOverlapping) {
              axisadded[index + 1] = false;
              if (!centeronly) {
                // node.setAttribute("display", "none");
              }
            } else {
              axisadded[index + 1] = true;
            }
          }
        }
      }
    });
    const tnodelast = textNodes[textNodes.length - 1];
    let tnodalastminsone = null;
    if (textNodes[textNodes.length - 2]) {
      tnodalastminsone = textNodes[textNodes.length - 2];
    }
    if (tnodalastminsone) {
      console.log("doing this");
      const bbox1 = tnodelast.getBBox();
      let x1 = 0;
      const pnode1 = tnodelast.parentNode as Element;
      if (pnode1.getAttribute("transform")) {
        x1 =
          +pnode1
            .getAttribute("transform")
            .split("translate(")[1]
            .split(",")[0] + bbox1.x;
      } else {
        x1 = +bbox1.x;
      }
      const rect1 = {
        x1: x1 - ADD_ADJUST_WIDTH,
        x2: x1 + bbox1.width + ADD_ADJUST_WIDTH,
      };
      const bbox2 = tnodalastminsone.getBBox();
      let x2 = 0;
      const pnode2 = tnodalastminsone.parentNode as Element;
      if (pnode2.getAttribute("transform")) {
        x2 =
          +pnode1
            .getAttribute("transform")
            .split("translate(")[1]
            .split(",")[0] + bbox1.x;
      } else {
        x2 = +bbox2.x;
      }
      const rect2 = {
        x1: x2 - ADD_ADJUST_WIDTH,
        x2: x2 + bbox1.width + ADD_ADJUST_WIDTH,
      };
      if (rect1.x1 >= rect2.x1 && rect1.x1 <= rect2.x1) {
        console.log("overlappi");
        const truncated =
          tnodelast.textContent.slice(
            0,
            Math.floor(tnodelast.textContent.length * TRUNCATE_RATIO),
          ) + truncatedLabelSuffix;
        tnodelast.textContent = truncated;
      }
    }
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
          (r: { y1: number; y2: number }, i: number) => i !== index + 1,
        );
        const isOverlapping = us.some(
          (r: { y1: number; y2: number }) => rect.y1 >= r.y1 && rect.y1 <= r.y2, //!(rect.y2 < r.y1 || rect.y1 > r.y2),
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

  const truncateY1Axis = (
    textNodes: SVGTextElement[],
    usedRects: { y1: number; y2: number }[],
    axisadded: { [key: number]: boolean },
    centeronly: boolean,
  ) => {
    textNodes.slice(1, -1).forEach((node: SVGTextElement, index: number) => {
      if (node && node.parentNode.nodeName.toUpperCase() !== nodenametocheck) {
        const label = node.dataset.fulltext || node.textContent || "";
        //    const truncated =
        //      label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
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
          (r: { y1: number; y2: number }, i: number) => i !== index + 1,
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
  }, [xScale, axis_bottom.current, AXISX_ROTATE]);

  useEffect(() => {
    if (!axis_left.current || !leftScale) return;
    if (AXISY_ROTATE) {
      return;
    }

    setTimeout(() => {
      const textNodes: SVGTextElement[] = Array.from(
        axis_left.current?.querySelectorAll(".visx-axis-left visx-axis-tick") ||
          [],
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
          i > 0 &&
          i < textNodes.length - 1 &&
          node &&
          node.parentNode.nodeName.toUpperCase() !== nodenametocheck
        ) {
          const bbox = node.getBBox();
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
        if (
          node &&
          node.parentNode.nodeName.toUpperCase() !== nodenametocheck
        ) {
          const label = node.dataset.fulltext || node.textContent || "";
          //      const truncated =
          //        label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
          const bbox = node.getBBox();
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
            (r) => rect.y1 >= r.y1 && rect.y1 <= r.y2,
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
        if (
          node &&
          node.parentNode.nodeName.toUpperCase() !== nodenametocheck
        ) {
          const bbox = node.getBBox();
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
      if (trueCount < 3) {
        const ntextnodes = [];
        const midcount = Math.round((textNodes.length - 1) / 2);
        textNodes.forEach((node, index) => {
          if (
            node &&
            node.parentNode.nodeName.toUpperCase() !== nodenametocheck &&
            (index === 0 ||
              index === midcount ||
              index === textNodes.length - 1)
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
    }, 500);
  }, [leftScale, axis_left.current]);

  useEffect(() => {
    if (!axis_left.current || !rightScale) return;
    if (AXISY1_ROTATE) {
      return;
    }

    setTimeout(() => {
      const textNodes: SVGTextElement[] = Array.from(
        axis_right.current?.querySelectorAll(".visx-axis-right text") || [],
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
          const bbox = node.getBBox();
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
        if (
          node &&
          node.parentNode.nodeName.toUpperCase() !== nodenametocheck
        ) {
          const label = node.dataset.fulltext || node.textContent || "";
          //  const truncated =
          //    label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
          const bbox = node.getBBox();
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
            (r) => rect.y1 >= r.y1 && rect.y1 <= r.y2,
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
        if (
          node &&
          node.parentNode.nodeName.toUpperCase() !== nodenametocheck
        ) {
          const bbox = node.getBBox();
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
      truncateY1Axis(textNodes, usedRects, axisadded, false);
      const trueCount = Object.values(axisadded).filter(
        (value) => value === true,
      ).length;
      if (trueCount < 3) {
        const ntextnodes = [];
        const midcount = Math.round((textNodes.length - 1) / 2);
        textNodes.forEach((node, index) => {
          if (
            node &&
            node.parentNode.nodeName.toUpperCase() !== nodenametocheck &&
            (index === 0 ||
              index === midcount ||
              index === textNodes.length - 1)
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
        truncateY1Axis(ntextnodes, usedRects, axisadded, true);
      }
    }, 500);
  }, [rightScale, axis_left.current]);

  const rotated = (rotate: boolean) => {
    AXISX_ROTATE = rotate;
    if (rotate && chartSvgRef.current && axis_bottom.current) {
      setTimeout(() => {
        const bottomaxisheight = axis_bottom.current.getBBox().height;
        const hgt =
          height -
          DEFAULT_MARGIN.top -
          DEFAULT_MARGIN.bottom -
          bottomaxisheight;
        setdrawableChartHeight(hgt - 50);
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
        console.log("wrap", wrapped);
        setdrawableChartHeight(hgt + 10);
      }
    }, 300);
  };

  if (chartData.length === 0) return <div>No data to display.</div>;

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
      <svg
        ref={chartSvgRef}
        width={adjustedChartWidth || width}
        height={adjustedChartHeight || height}
      >
        {isLoading && <SvgShimmer />}
        <Group top={DEFAULT_MARGIN.top} left={DEFAULT_MARGIN.left}>
          <g ref={axis_bottom}>
            <XAxis
              scale={xScale}
              top={drawableChartHeight - (AXISX_ROTATE ? 10 : 0)}
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
              forceFullLabels
              {...xAxisProps}
              addGap={BASE_ADJUST_WIDTH}
              rotated={rotated}
              wrapped={wrapped}
              barWidth={actualBarWidth + 10}
            />
          </g>
          {showGrid && (
            <Grid
              width={drawableChartWidth}
              yScale={leftScale}
              numTicks={5}
              isLoading={isLoading}
              {...gridProps}
            />
          )}

          {!hideChart.includes(0) && (
            <>
              <g ref={axis_left}>
                <YAxis
                  scale={leftScale}
                  hideTicks={!showTicks}
                  hideAxisLine={!showYAxis}
                  label={yAxisLeftLabel}
                  isLoading={isLoading}
                  {...yAxisProps}
                />
              </g>
              <g id="bars">
                {chartData.map((d, index) => {
                  let barX = (xScale(d.xAxis) ?? 0) + xOffset;
                  if (index === 0 || index === chartData.length - 1) {
                    if (index === 0) {
                      barX = barX - BASE_ADJUST_WIDTH;
                    } else {
                      barX = barX + BASE_ADJUST_WIDTH * 1.5;
                    }
                  } else {
                    barX = barX + BASE_ADJUST_WIDTH / 2;
                  }
                  const barHeight =
                    drawableChartHeight - (leftScale(d.yAxisLeft) ?? 0);
                  const barY = drawableChartHeight - barHeight;
                  const isHovered = hoveredBar === index;
                  const barOpacity =
                    (hoveredChart && hoveredChart !== yAxisLeftLabel) ||
                    (hoveredBar !== null && !isHovered)
                      ? REDUCED_OPACITY
                      : DEFAULT_OPACITY;

                  const radius = Math.min(
                    DEFAULT_BAR_RADIUS,
                    actualBarWidth / 2,
                  );

                  return (
                    <CustomBar
                      key={`bar-${d.xAxis}`}
                      x={barX}
                      y={barY}
                      width={actualBarWidth}
                      height={barHeight}
                      fill={
                        isLoading
                          ? `url(#${shimmerGradientId})`
                          : d?.barColor
                            ? d?.barColor
                            : colors.bar
                      }
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
              </g>
            </>
          )}

          {!hideChart.includes(1) && (
            <>
              <g ref={axis_right}>
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
                  isLoading={isLoading}
                  {...yAxisProps}
                />
              </g>
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
