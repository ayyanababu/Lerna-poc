 
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";
import { capitalize, cloneDeep, lowerCase } from "lodash-es";

import useTheme from "../../hooks/useTheme";
import ChartWrapper from "../ChartWrapper";
import CustomBar from "../CustomBar";
import SvgShimmer, { shimmerGradientId } from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import { mockVerticalGroupedBarChartData } from "../VerticalGroupedBarChart/mockdata";
import { HorizontalGroupedBarChartProps } from "./types";
import ErrorBoundary from "../ErrorBoundary";

const DEFAULT_MARGIN = {
  top: 0,
  right: 40,
  bottom: 20,
  left: 0,
};

const DEFAULT_BAR_RADIUS = 5;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.0;
const TICK_LABEL_PADDING = 16;
const TRUNCATE_RATIO = 0.75;
const AXISX_ROTATE = false;
const AXISY_ROTATE = false;
const BASE_ADJUST_WIDTH = 0; // used to fix the check width for the overlap of xaxis
const ADD_ADJUST_WIDTH = 0; // used to check the overlap of xaxis
const BASE_ADJUST_HEIGHT = 5; // used to fix the check width for the overlap of yaxis
const ADD_ADJUST_HEIGHT = 5; // used to check the overlap of yaxis
const bottomHeightAddOnSpace = 0;
const titleHeightAddOnSpace = 0;
const truncatedLabelSuffix = "..";
const activatesizing = false;
const nodenametocheck = "";

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
  const axis_left = useRef<SVGGElement | null>(null);
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);
  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(
    null,
  );
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(
    null,
  );
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

  /*   const stackedData = useMemo(() => {
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
   */
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
    range: [0, Math.max(0, adjustedChartWidth)],
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

  const renderBar = (props: object) => <CustomBar {...props} />;

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
    const requiredWidth =
      DEFAULT_MARGIN.left + drawableChartWidth + DEFAULT_MARGIN.right;

    const updatedHeight = Math.max(requiredHeight, height);
    const updatedWidth = Math.max(requiredWidth, width);

    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [
    data,
    width,
    height,
    DEFAULT_MARGIN,
    drawableChartWidth,
    bottomHeight,
    titleHeight,
  ]);

  /*   const rotated = (rotate: boolean) => {
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
   */

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
        console.log(label);
        console.log("usa", us);
        console.log("rects", usedRects);
        console.log("overlp", isOverlapping);
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
          console.log("overlp1", isOverlapping);
          console.log(truncated);
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
          (r: { y1: number; y2: number }, i: number) => i === index + 1,
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
    if (!axis_bottom.current || !valueScale) return;
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
        if (
          i !== 0 &&
          i !== textNodes.length - 1 &&
          node &&
          node.parentNode.nodeName.toUpperCase() !== nodenametocheck
        ) {
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
        if (
          node &&
          node.parentNode.nodeName.toUpperCase() !== nodenametocheck
        ) {
          const label = node.dataset.fulltext || node.textContent || "";
          let truncated = label;
          if (label.length > 3) {
            truncated =
              label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) +
              truncatedLabelSuffix;
          }
          const bbox = node.getBoundingClientRect();
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
          const us = usedRects.filter(
            (r: { x1: number; x2: number }, i: number) => i !== index,
          );
          const isOverlapping = us.some(
            (r: { x1: number; x2: number }) =>
              rect.x1 >= r.x1 && rect.x1 <= r.x2,
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
      truncateXAxis(textNodes, usedRects, axisadded, false);
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
        truncateXAxis(ntextnodes, usedRects, axisadded, true);
      }
    }, 500);
  }, [valueScale, axis_bottom.current, AXISX_ROTATE]);

  useEffect(() => {
    if (!axis_left.current || !categoryScale) return;
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
  }, [categoryScale, axis_left.current]);

  /*   const rotated = (rotate: boolean) => {
    AXISX_ROTATE = rotate;
    console.log("rotating");
    if (rotate && chartSvgRef.current) {
      setTimeout(() => {
        const svg = chartSvgRef.current;
        const bbox = svg.getBBox();
        const legendHeight = bottomHeight;
        const bottomaxisheight = axis_bottom.current.getBBox().height;
        const hgt =
          height -
          DEFAULT_MARGIN.top -
          DEFAULT_MARGIN.bottom -
          bottomaxisheight;
        //    setdrawableChartHeight(hgt);
      }, 200);
    }
  }; */

  const noData = !isLoading && (!_data || _data.length === 0 || (!_groupKeys || _groupKeys.length === 0));

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
      timestampProps={{ timestamp, isLoading }}
    >
      {noData ? null : (
        
      <svg
        ref={chartSvgRef}
        width={adjustedChartWidth || width}
        height={adjustedChartHeight || height}
      >
        {isLoading && <SvgShimmer />}
        <Group
          top={DEFAULT_MARGIN.top}
          left={DEFAULT_MARGIN.left + yAxisLabelWidth}
        >
          <g ref={axis_left} transform={`translate(${-1 * yAxisLabelWidth},0)`}>
            <AxisLeft
              scale={categoryScale}
              stroke={theme.colors.axis.line}
              tickStroke={theme.colors.axis.line}
              tickLabelProps={{
                fill: theme.colors.axis.label,
                fontSize: "12px",
                textAnchor: "start",
                dx: 0,
                dy: "0.33em",
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
      )}
    </ChartWrapper>
  );
};

const HorizontalGroupedBarChartComponent = (props: HorizontalGroupedBarChartProps) => {
  return (
    <ErrorBoundary>
      <HorizontalGroupedBarChart {...props} />
    </ErrorBoundary>
  );
};

export default HorizontalGroupedBarChartComponent;
