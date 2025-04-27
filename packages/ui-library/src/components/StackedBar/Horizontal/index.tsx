/* eslint-disable max-lines */
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { mockHorizontalStackedBarChartData } from "./mockdata";
import { HorizontalStackedBarChartProps } from "./types";

interface DynamicMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const DEFAULT_MARGIN = {
  top: 0,
  right: 0,
  bottom: 20,
  left: 60,
};

const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;
const MAX_BAR_HEIGHT = 16;
const MAX_LABEL_CHARS = 15;
const TICK_LABEL_PADDING = 8;
const TRUNCATE_RATIO = 0.75;
let AXISX_ROTATE = false;
const AXISY_ROTATE = true;
const BASE_ADJUST_WIDTH = 5; // used to fix the check width for the overlap of xaxis
const ADD_ADJUST_WIDTH = 0; // used to check the overlap of xaxis
const BASE_ADJUST_HEIGHT = 5; // used to fix the check width for the overlap of yaxis
const ADD_ADJUST_HEIGHT = 0; // used to check the overlap of yaxis
const bottomHeightAddOnSpace = 0;
const titleHeightAddOnSpace = 0;

/**
 * Helper: measure the widest label in pixels using a hidden <canvas>
 */
function getMaxLabelWidth(labels: string[], font = "10px sans-serif"): number {
  if (!labels.length) return 0;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;

  let maxWidth = 0;
  labels.forEach((label) => {
    const { width } = ctx.measureText(label);
    if (width > maxWidth) {
      maxWidth = width;
    }
  });
  return maxWidth;
}

/**
 * Truncate label to MAX_LABEL_CHARS chars (matching YAxis logic)
 */
function truncateLabel(rawLabel: string): string {
  if (rawLabel.length <= MAX_LABEL_CHARS) return rawLabel;
  return `${rawLabel.substring(0, MAX_LABEL_CHARS - 1)}…`;
}

/**
 * HorizontalStackedBar component that renders stacked bars horizontally
 * and uses dynamicMargin for the left side.
 */
const HorizontalStackedBar: React.FC<HorizontalStackedBarChartProps> = ({
  data: _data,
  groupKeys: _groupKeys,
  title,
  timestamp,
  colors = [],
  isLoading,
  maxBarHeight = MAX_BAR_HEIGHT,
  showTicks = false,
  titleProps,
  legendsProps,
  showXAxis = false,
  tooltipProps,
  timestampProps,
  xAxisProps,
  yAxisProps,
  gridProps,
  barProps,
  onClick,
  removeBothAxis = false,
}) => {
  const { theme } = useTheme();
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const axis_bottom = useRef<SVGGElement | null>(null);
  const axis_left = useRef<SVGGElement | null>(null);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(
    null,
  );
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(
    null,
  );
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);

  const getStrokeWidth = (width: number, height: number) => {
    const size = Math.min(width, height);
    // Scale between 0.3 and 1 based on size
    return Math.max(0.3, Math.min(1, size / 500));
  };
  const strokeWidth = getStrokeWidth(width, height);

  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const [bottomHeight, setBottomHeight] = useState(0);
  const [titleHeight,setTitleHeight] = useState(0);  

  // Tooltip
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData[]>();

  useEffect(()=>{
    if (parentRef.current){
        setTimeout(()=>{
           let legendbox = parentRef.current.parentNode.querySelectorAll('div')[0];
           const spans = parentRef.current?.parentNode?.parentNode?.querySelectorAll<HTMLSpanElement>('span');
           const lastSpan = spans ? spans[spans.length - 1] : null;
           setBottomHeight(legendbox.offsetHeight+lastSpan.offsetHeight + bottomHeightAddOnSpace)
           setTitleHeight(parentRef.current?.parentNode?.parentNode.querySelector<HTMLSpanElement>('.MuiTypography-h6').offsetHeight+titleHeightAddOnSpace)
        },7500)   
    }    
  },[parentRef.current])     

  // Decide whether to use real data or mock data
  const { data, groupKeys } = useMemo(() => {
    if (isLoading) {
      return mockHorizontalStackedBarChartData;
    }
    return { data: _data, groupKeys: _groupKeys };
  }, [isLoading, _data, _groupKeys]);

  // Filter out hidden groups
  const filteredData = useMemo(
    () =>
      data.map((categoryData) => {
        const d = cloneDeep(categoryData);
        if (hideIndex.length) {
          groupKeys.forEach((key, idx) => {
            if (hideIndex.includes(idx) && d.data) {
              delete d.data[key];
            }
          });
        }

        return d;
      }),
    [data, hideIndex, groupKeys],
  );

  const labels = useMemo(
    () => filteredData.map((item) => String(item.label)),
    [filteredData],
  );
  const truncatedLabels = useMemo(() => labels.map(truncateLabel), [labels]);

  // Measure the widest truncated label
  const maxLabelPx = useMemo(() => {
    if (!truncatedLabels.length) return 0;
    return getMaxLabelWidth(truncatedLabels, "10px sans-serif");
  }, [truncatedLabels]);

  // Dynamic margin: expand or shrink left margin
  const dynamicMargin = useMemo<DynamicMargin>(() => {
    if (removeBothAxis) {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    if (!width) return DEFAULT_MARGIN;

    let desiredLeft = maxLabelPx + 10;
    if (desiredLeft > width / 2) {
      desiredLeft = width / 2;
    }
    desiredLeft = Math.max(desiredLeft, DEFAULT_MARGIN.left);
    const showingXAxis = xAxisProps?.isVisible !== false;

    const bottomMargin = showingXAxis
      ? DEFAULT_MARGIN.bottom
      : Math.max(DEFAULT_MARGIN.bottom - 10, 10);

    return {
      ...DEFAULT_MARGIN,
      left: desiredLeft,

      bottom: bottomMargin,
    };
  }, [
    DEFAULT_MARGIN,
    maxLabelPx,
    width,
    xAxisProps?.isVisible,
    removeBothAxis,
  ]);

  // Inner chart dimensions
  const innerWidth = width - dynamicMargin.left - dynamicMargin.right;
  const innerHeight = height - dynamicMargin.top - dynamicMargin.bottom;

  // Legend data
  const legendData = useMemo(
    () =>
      groupKeys.map((key) => ({
        label: capitalize(lowerCase(key)),
        value: data.reduce(
          (sum, category) => sum + Number(category.data[key] || 0),
          0,
        ),
      })),
    [groupKeys, data],
  );

  // Active (not hidden) keys
  const activeKeys = useMemo(
    () => groupKeys.filter((_, idx) => !hideIndex.includes(idx)),
    [groupKeys, hideIndex],
  );

  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidth;
  const drawableChartWidth = width - axisXStart - DEFAULT_MARGIN.right;

  // Convert data to stacked
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
    } catch (err) {
      console.error("Error generating stack data:", err);
      return [];
    }
  }, [filteredData, activeKeys]);

  // Max total for x-scale
  const maxValue = useMemo(
    () =>
      Math.max(
        0,
        ...filteredData.map((d) =>
          Object.entries(d.data)
            .filter(([k]) => activeKeys.includes(k))
            .reduce((sum, [, val]) => sum + Number(val || 0), 0),
        ),
      ),
    [filteredData, activeKeys],
  );

  // categoryScale => for band dimension (bar height)
  const categoryScale = useMemo(
    () =>
      scaleBand<string>({
        domain: filteredData.map((d) => String(d.label)),
        range: [0, innerHeight],
        padding: 0.4,
      }),
    [filteredData, innerHeight],
  );

  // xScale => for linear dimension (bar length)
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue * SCALE_PADDING],
        range: [0, removeBothAxis ? width : drawableChartWidth],
        nice: true,
      }),
    [innerWidth, maxValue, removeBothAxis, width, drawableChartWidth],
  );

  // Color scale
  const groupColorScale = useMemo(
    () =>
      scaleOrdinal<string, string>({
        domain: groupKeys,
        range: colors?.length ? colors : theme.colors.charts.stackedBar,
      }),
    [groupKeys, colors, theme.colors.charts.stackedBar],
  );

  // Tooltip handlers
  const handleMouseMove =
    (groupKey: string, value: number) => (evt: React.MouseEvent) => {
      if (!isLoading) {
        showTooltip({
          tooltipData: [
            {
              label: capitalize(lowerCase(groupKey)),
              value,
              color: groupColorScale(groupKey),
            },
          ],
          tooltipLeft: evt.clientX,
          tooltipTop: evt.clientY,
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

  const calculatedNumTicks = useMemo(() => {
    const tickHeight = 20;
    return Math.max(2, Math.floor(innerHeight / tickHeight));
  }, [innerHeight]);

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const nodes = chartSvgRef.current.querySelectorAll(".visx-axis-left text");
    const widths = Array.from(nodes).map(
      (node) => (node as SVGGraphicsElement).getBBox().width,
    );
    setMaxLabelWidth(Math.max(...widths, 0));
  }, [data, width, height]);

  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;
    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();
  //  const titleHeight =
  //    document.querySelector(".chart-title")?.getBoundingClientRect().height ||
  //    0;
    const legendHeight = bottomHeight;
  //    document.querySelector(".chart-legend")?.getBoundingClientRect().height ||
  //    0;
    const updatedHeight =
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
    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [data, width, height, DEFAULT_MARGIN, innerWidth, bottomHeight, titleHeight]);


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

    const totalTop = DEFAULT_MARGIN.top + titleHeight;
    const totalBottom = DEFAULT_MARGIN.bottom + legendHeight;
    const requiredHeight = totalTop + bbox.height + totalBottom;
    const requiredWidth = DEFAULT_MARGIN.left + drawableChartWidth + DEFAULT_MARGIN.right;

    const updatedHeight = Math.max(requiredHeight, height);
    const updatedWidth = Math.max(requiredWidth, width);

    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [data, width, height, DEFAULT_MARGIN, drawableChartWidth,bottomHeight, titleHeight]); 



  const truncateXAxis = (
    textNodes: SVGTextElement[],
    usedRects: { x1: number; x2: number }[],
    axisadded: { [key: number]: boolean },
    centeronly: boolean,
  ) => {
    textNodes.slice(1, -1).forEach((node: SVGTextElement, index: number) => {
      const label = node.dataset.fulltext || node.textContent || "";
      let truncated = label;
      if (label.length > 3) {
        truncated =
          label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
      }
      console.log("tr", truncated);
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
        (r: { x1: number; x2: number }, i: number) => i !== index + 1,
      );
      const isOverlapping = us.some(
        (r: { x1: number; x2: number }) => !(rect.x2 < r.x1 || rect.x1 > r.x2),
      );
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
            !(rect.x2 < r.x1 || rect.x1 > r.x2),
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
              ) + "…";
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
              !(rect.x2 < r.x1 || rect.x1 > r.x2),
          );
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
  };

  const truncateYAxis = (
    textNodes: SVGTextElement[],
    usedRects: { y1: number; y2: number }[],
    axisadded: { [key: number]: boolean },
    centeronly: boolean,
  ) => {
    textNodes.slice(1, -1).forEach((node: SVGTextElement, index: number) => {
      const label = node.dataset.fulltext || node.textContent || "";
      //  const truncated =
      //    label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
      const original = node.textContent;
      // node.textContent = truncated;
      const bbox = node.getBBox();
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
        (r: { y1: number; y2: number }) => !(rect.y2 < r.y1 || rect.y1 > r.y2),
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
    });
  };

  useEffect(() => {
    if (!axis_bottom.current || !xScale) return;
    if (AXISX_ROTATE) {
      return;
    }

    setTimeout(() => {
      const textNodes: SVGTextElement[] = Array.from(
        axis_bottom.current?.querySelectorAll(".visx-axis-bottom text") || [],
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
          const pnode = node.parentNode as Element;
          let x = 0;
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
            x1: x - BASE_ADJUST_WIDTH,
            x2: x + bbox.width + BASE_ADJUST_WIDTH,
          };
          usedRects.push(rect);
        }
      });
      const axisadded = {};
      const firstNode = textNodes[0];
      const lastNode = textNodes[textNodes.length - 1];
      const showAndTruncate = (node: SVGTextElement, index: number) => {
        const label = node.dataset.fulltext || node.textContent || "";
        let truncated = label;
        if (label.length > 3) {
          truncated =
            label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
        }
        const bbox = node.getBBox();
        const pnode = node.parentNode as Element;
        let x = 0;
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
            !(rect.x2 < r.x1 || rect.x1 > r.x2),
        );
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
        const pnode = node.parentNode as Element;
        let x = 0;
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
          x1: x - BASE_ADJUST_WIDTH,
          x2: x + bbox.width + BASE_ADJUST_WIDTH,
        };
        usedRects.push(rect);
      });
      truncateXAxis(textNodes, usedRects, axisadded, false);
      const trueCount = Object.values(axisadded).filter(
        (value) => value === true,
      ).length;
      if (trueCount < 3) {
        const ntextnodes = [];
        const midcount = Math.round((textNodes.length - 1) / 2);
        textNodes.forEach((node, index) => {
          if (
            index === 0 ||
            index === midcount ||
            index === textNodes.length - 1
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
        truncateXAxis(ntextnodes, usedRects, axisadded, true);
      }
    }, 500);
  }, [xScale, axis_bottom.current]);

  useEffect(() => {
    if (!axis_left.current || !categoryScale) return;
    if (AXISY_ROTATE) {
      return;
    }
    setTimeout(() => {
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
        if (i !== 0 && i !== textNodes.length - 1) {
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
        const label = node.dataset.fulltext || node.textContent || "";
        //    const truncated =
        //      label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
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
          (r: { y1: number; y2: number }) =>
            !(rect.y2 < r.y1 || rect.y1 > r.y2),
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
      };

      // Always show first and last
      if (firstNode) showAndTruncate(firstNode, 0);
      if (lastNode) showAndTruncate(lastNode, textNodes.length - 1);

      usedRects = [];
      textNodes.forEach((node) => {
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
            index === 0 ||
            index === midcount ||
            index === textNodes.length - 1
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
  }, [categoryScale, axis_left.current]);

  const rotated = (rotate: boolean) => {
    const rot = rotate;
    setTimeout(() => {
      const textNodes: SVGTextElement[] = Array.from(
        axis_bottom.current?.querySelectorAll(".visx-axis-bottom text") || [],
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
        const titleHeight =
          document.querySelector(".chart-title")?.getBoundingClientRect()
            .height || 0;
        const legendHeight =
          document.querySelector(".chart-legend")?.getBoundingClientRect()
            .height || 0;
        const updatedHeight =
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
        setAdjustedChartHeight(updatedHeight);
        setAdjustedChartWidth(updatedWidth);
      }
    }, 200);
  };

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
      timestampProps={{ timestamp, isLoading, ...timestampProps }}
      minRenderHeight={removeBothAxis ? 0 : 200}
    >
      <svg
        ref={chartSvgRef}
        width={adjustedChartWidth || width}
        height={adjustedChartHeight || height}
      >
        {isLoading && <SvgShimmer />}

        {/* Use the dynamicMargin for top/left */}
        <Group top={dynamicMargin.top} left={dynamicMargin.left}>
          <g ref={axis_left}>
            <YAxis
              scale={categoryScale}
              tickStroke={theme.colors.axis.line}
              hideAxisLine
              numTicks={calculatedNumTicks}
              showTicks={showTicks}
              isLoading={isLoading}
              isVisible={!removeBothAxis}
              {...yAxisProps}
            />
          </g>
          <g ref={axis_bottom}>
            <XAxis
              scale={xScale}
              top={innerHeight}
              showTicks={hideIndex.length === groupKeys.length || showTicks}
              numTicks={5}
              isLoading={isLoading}
              availableWidth={innerWidth}
              showAxisLine={showXAxis}
              tickLength={0}
              isVisible={!removeBothAxis}
              {...xAxisProps}
              rotated={rotated}
            />
          </g>
          <Grid
            height={innerHeight}
            xScale={xScale}
            showHorizontal={false}
            showVertical
            numTicks={5}
            isLoading={isLoading}
            {...gridProps}
          />

          {filteredData.map((catData, categoryIndex) => {
            const category = String(catData.label);
            // bar thickness with clamp
            const rawBarHeight = categoryScale.bandwidth();
            // Use custom barWidth if provided, otherwise use default with maximum limit
            const actualBarHeight = Math.min(rawBarHeight, maxBarHeight);
            // center if clamped
            const bandY = categoryScale(category) || 0;
            const barY = bandY + (rawBarHeight - actualBarHeight) / 2;

            return activeKeys.map((groupKey, groupIndex) => {
              const seriesData = stackedData.find((s) => s.key === groupKey);
              if (!seriesData) return null;

              const [x0, x1] = seriesData[categoryIndex];
              const barWidth = xScale(x1) - xScale(x0);
              const barX = xScale(x0);
              const value = x1 - x0;
              if (!value) return null;

              const isHoveredGroup = hoveredGroupKey === groupKey;
              const barOpacity =
                hoveredGroupKey && !isHoveredGroup
                  ? REDUCED_OPACITY
                  : DEFAULT_OPACITY;

              // figure out if it's the rightmost bar
              let rightmostKey = activeKeys[0];
              let maxX1 = 0;
              stackedData.forEach((s) => {
                const x1Val = s[categoryIndex]?.[1] || 0;
                if (x1Val > maxX1) {
                  maxX1 = x1Val;
                  rightmostKey = s.key;
                }
              });

              // figure out if it's the leftmost bar
              let leftmostKey = activeKeys[0];
              let minX0 = Infinity;
              stackedData.forEach((s) => {
                const x0Val = s[categoryIndex]?.[0] || 0;
                if (x0Val < minX0) {
                  minX0 = x0Val;
                  leftmostKey = s.key;
                }
              });

              const isRightmostBar = seriesData.key === rightmostKey;
              const isLeftmostBar = seriesData.key === leftmostKey;

              const dynamicRadius = Math.min(
                DEFAULT_BAR_RADIUS,
                actualBarHeight / 2,
              );
              // if rightmost => round corners
              const pathProps = isRightmostBar
                ? {
                    d: `
                M ${barX},${barY + actualBarHeight}
                L ${barX},${barY}
                L ${barX + barWidth - dynamicRadius},${barY}
                Q ${barX + barWidth},${barY} ${barX + barWidth},${barY + dynamicRadius}
                L ${barX + barWidth},${barY + actualBarHeight - dynamicRadius}
                Q ${barX + barWidth},${barY + actualBarHeight} ${barX + barWidth - dynamicRadius},${
                  barY + actualBarHeight
                }
                Z
              `,
                  }
                : isLeftmostBar
                  ? {
                      d: `
              M ${barX + dynamicRadius},${barY + actualBarHeight}
              Q ${barX},${barY + actualBarHeight} ${barX},${barY + actualBarHeight - dynamicRadius}
              L ${barX},${barY + dynamicRadius}
              Q ${barX},${barY} ${barX + dynamicRadius},${barY}
              L ${barX + barWidth},${barY}
              L ${barX + barWidth},${barY + actualBarHeight}
              Z
              `,
                    }
                  : undefined;

              return (
                <React.Fragment key={`stacked-${category}-${groupKey}`}>
                  <CustomBar
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={actualBarHeight}
                    fill={
                      isLoading
                        ? `url(#${shimmerGradientId})`
                        : groupColorScale(groupKey)
                    }
                    opacity={barOpacity}
                    pathProps={pathProps}
                    onMouseMove={handleMouseMove(groupKey, value)}
                    onMouseLeave={handleMouseLeave}
                    {...barProps}
                    onClick={(event) => {
                      if (barProps?.onClick) {
                        barProps.onClick(event);
                      }
                      if (onClick) {
                        onClick(event, filteredData[categoryIndex], [
                          categoryIndex,
                          groupIndex,
                        ]);
                      }
                    }}
                  />

                  {barX > xScale(0) && (
                    <line
                      x1={barX}
                      y1={barY}
                      x2={barX}
                      y2={barY + actualBarHeight}
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
    </ChartWrapper>
  );
};

export default HorizontalStackedBar;
