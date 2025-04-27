/* eslint-disable max-lines */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  right: -50,
  bottom: 45,
  left: 20,
};

const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;
const DEFAULT_MAX_BAR_WIDTH = 16;
const TICK_LABEL_PADDING = 8;
const TRUNCATE_RATIO = 0.75;
let AXISX_ROTATE = true;
const AXISY_ROTATE = true;
const BASE_ADJUST_WIDTH = 0; // used to fix the check width for the overlap of xaxis
const ADD_ADJUST_WIDTH = 0; // used to check the overlap of xaxis
const BASE_ADJUST_HEIGHT = 5; // used to fix the check width for the overlap of yaxis
const ADD_ADJUST_HEIGHT = 0; // used to check the overlap of yaxis
const bottomHeightAddOnSpace = 0;
const titleHeightAddOnSpace = 0;
const truncatedLabelSuffix = "..";
const activatesizing = false;
const nodenametocheck = "SVG";

function VerticalStackedBar({
  data: _data,
  groupKeys: _groupKeys,
  //  margin = DEFAULT_MARGIN,
  title,
  timestamp,
  colors = [],
  isLoading,
  maxBarWidth = DEFAULT_MAX_BAR_WIDTH,
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
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(
    null,
  );
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(
    null,
  );
  const [bottomHeight, setBottomHeight] = useState(0);
  const [titleHeight, setTitleHeight] = useState(0);

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
    const widths = Array.from(nodes).map(
      (node) => (node as SVGGraphicsElement).getBBox().width,
    );
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
        return d;
      }),
    [data, hideIndex, groupKeys],
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
    [filteredData, innerWidth],
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue * SCALE_PADDING],
        range: [innerHeight, 0],
      }),
    [innerHeight, maxValue],
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
    //   const titleHeight =
    //     document.querySelector(".chart-title")?.getBoundingClientRect().height ||
    //     0;
    const legendHeight = bottomHeight;
    //      document.querySelector(".chart-legend")?.getBoundingClientRect().height ||
    //      0;
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
  }, [xScale, axis_bottom.current, AXISX_ROTATE]);

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
        //    const svg = chartSvgRef.current;
        //    const bbox = svg.getBBox();
        //    const legendHeight = bottomHeight;
        //    const bottomaxisheight = axis_bottom.current.getBBox().height;
        //    const hgt =
        //      height -
        //      DEFAULT_MARGIN.top -
        //      DEFAULT_MARGIN.bottom -
        //      bottomaxisheight;
        //    setdrawableChartHeight(hgt);
      }, 200);
    }
  };

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
    >
      <svg
        ref={chartSvgRef}
        width={adjustedChartWidth || width}
        height={adjustedChartHeight || height}
      >
        {isLoading && <SvgShimmer />}

        <Group top={DEFAULT_MARGIN.top} left={yAxisLabelWidth}>
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
              // autoRotate
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
            const actualBarWidth = Math.min(calculatedBarWidth, maxBarWidth);

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
                                Q ${barX + actualBarWidth},${barY} ${
                                  barX + actualBarWidth - dynamicRadius
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
    </ChartWrapper>
  );
}

export default VerticalStackedBar;
