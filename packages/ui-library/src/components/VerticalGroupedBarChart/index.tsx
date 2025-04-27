/* eslint-disable max-lines */
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
import SvgShimmer from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import { mockVerticalGroupedBarChartData } from "./mockdata";
import { VerticalGroupedBarChartProps } from "./types";

const DEFAULT_MARGIN = {
  top: 20,
  right: 0,
  bottom: 20,
  left: 30,
};

const DEFAULT_BAR_RADIUS = 5;
const DEFAULT_OPACITY = 1;
const SCALE_PADDING = 1.2;
const TICK_LABEL_PADDING = 8;
const TRUNCATE_RATIO = 0.75;
const AXISX_ROTATE = false;
const AXISY_ROTATE = true;
const BASE_ADJUST_WIDTH = 0; // used to fix the check width for the overlap of xaxis
const ADD_ADJUST_WIDTH = 0; // used to check the overlap of xaxis
const BASE_ADJUST_HEIGHT = 5; // used to fix the check width for the overlap of yaxis
const ADD_ADJUST_HEIGHT = 0; // used to check the overlap of yaxis
const bottomHeightAddOnSpace = 0;
const titleHeightAddOnSpace = 0;
const truncatedLabelSuffix = "..";
const activatesizing = false;
const nodenametocheck = "";

const VerticalGroupedBarChart: React.FC<VerticalGroupedBarChartProps> = ({
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
  const axis_bottom = useRef<SVGGElement | null>(null);
  const axis_left = useRef<SVGGElement | null>(null);
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);

  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidth;
  const drawableChartWidth = width - axisXStart - DEFAULT_MARGIN.right;
  const [bottomHeight, setBottomHeight] = useState(0);
  const [titleHeight, setTitleHeight] = useState(0);

  //  const drawableChartWidth = width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right;
  const drawableChartHeight =
    height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom;

  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(
    null,
  );
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(
    null,
  );
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
    useTooltip<TooltipData[]>();

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
        domain: filteredData.map((d) => String(d.label)),
        range: [0, drawableChartWidth],
        padding: 0.4,
      }),
    [filteredData, drawableChartWidth],
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

  const valueScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue * SCALE_PADDING],
        range: [drawableChartHeight, 0],
      }),
    [drawableChartHeight, maxValue],
  );

  const groupColorScale = useMemo(
    () =>
      scaleOrdinal<string, string>({
        domain: groupKeys,
        range: colors?.length ? colors : theme.colors.charts.bar,
      }),
    [groupKeys, colors, theme.colors.charts.bar],
  );

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const labels = chartSvgRef.current.querySelectorAll(".visx-axis-left text");
    const widths = Array.from(labels).map(
      (node) => (node as SVGGraphicsElement).getBBox().width,
    );
    console.log("width", widths);
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
    const requiredWidth =
      DEFAULT_MARGIN.left + bbox.width + DEFAULT_MARGIN.right;

    setAdjustedChartHeight(Math.max(requiredHeight, height) + 5);
    setAdjustedChartWidth(Math.max(requiredWidth, width));
  }, [data, width, height, DEFAULT_MARGIN]);
*/

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

    //    const titleHeight = titleEl?.getBoundingClientRect().height || 0;
    const legendHeight = bottomHeight; //legendEl?.getBoundingClientRect().height || 0;

    const totalTop = DEFAULT_MARGIN.top + titleHeight;
    const totalBottom = DEFAULT_MARGIN.bottom + legendHeight;
    const requiredHeight = totalTop + bbox.height + totalBottom;

    setAdjustedChartHeight(Math.max(requiredHeight, height) + 5);
    setAdjustedChartWidth(width);
  }, [data, width, height, DEFAULT_MARGIN, bottomHeight, titleHeight]);
  /*
  useEffect(() => {
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
    if (AXISX_ROTATE) {
      updatedHeight =
        updatedHeight -
        (
          chartSvgRef.current.querySelector(".visx-axis-bottom") as SVGGElement
        ).getBBox().height;
    }
    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [data, width, height, DEFAULT_MARGIN, innerWidth]); */

  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;
    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();
    //    const titleHeight =
    //      document.querySelector(".chart-title")?.getBoundingClientRect().height ||
    //      0;
    const legendHeight = bottomHeight;
    //      document.querySelector(".chart-legend")?.getBoundingClientRect().height ||
    //      0;
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
          const us = usedRects.filter(
            (r: { x1: number; x2: number }, i: number) => i === index + 1,
          );
          const isOverlapping = us.some(
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
            const us = usedRects.filter(
              (r: { x1: number; x2: number }, i: number) => i === index + 1,
            );
            const isOverlapping = us.some(
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
      console.log("axisadd", axisadded);
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

  //const rotated = (rotate: boolean) => {
  //      AXISX_ROTATE = rotate;
  //      console.log("rotating")
  //     if (rotate && chartSvgRef.current) {
  //       setTimeout(() =>{
  //         const svg = chartSvgRef.current;
  //         const bbox = svg.getBBox();
  //         const legendHeight = bottomHeight
  //         let bottomaxisheight = axis_bottom.current.getBBox().height;
  //        const hgt = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom - bottomaxisheight;
  //    setdrawableChartHeight(hgt);
  //      },200);
  //    }
  // };

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
      timestampProps={{ timestamp, isLoading }}
    >
      <svg
        ref={chartSvgRef}
        width={adjustedChartWidth || width}
        height={adjustedChartHeight || height}
      >
        {isLoading && <SvgShimmer />}
        <Group top={DEFAULT_MARGIN.top}>
          <g ref={axis_left} transform={`translate(${yAxisLabelWidth},0)`}>
            <AxisLeft
              scale={valueScale}
              stroke={theme.colors.axis.line}
              tickStroke={theme.colors.axis.line}
              tickLabelProps={{
                fill: theme.colors.axis.label,
                fontSize: "12px",
                textAnchor: "end",
                dy: "0.33em",
              }}
              hideTicks={!showTicks}
            />
          </g>
          <g ref={axis_bottom} transform={`translate(${yAxisLabelWidth},0)`}>
            <AxisBottom
              scale={categoryScale}
              top={drawableChartHeight}
              stroke={theme.colors.axis.line}
              tickStroke={theme.colors.axis.line}
              tickLabelProps={{
                fill: theme.colors.axis.label,
                fontSize: "12px",
                textAnchor: "middle",
                dy: "0.33em",
              }}
              hideTicks={hideIndex.length === groupKeys.length || !showTicks}
            />
          </g>
          <g>
            {valueScale.ticks(5).map((tick) => (
              <line
                key={tick}
                x1={yAxisLabelWidth}
                x2={drawableChartWidth}
                y1={valueScale(tick)}
                y2={valueScale(tick)}
                stroke={theme.colors.axis.grid}
                strokeDasharray="2,2"
                opacity={0.3}
              />
            ))}
          </g>
          {type === "stacked" && stackedData
            ? stackedData.map((series) =>
                series.map((bar, i) => {
                  const category = String(filteredData[i].label);
                  const barX = categoryScale(category) || 0;
                  const barWidth = categoryScale.bandwidth();
                  const barY = valueScale(bar[1]);
                  const barHeight = valueScale(bar[0]) - valueScale(bar[1]);
                  return (
                    <CustomBar
                      key={`stacked-${series.key}-${category}`}
                      x={yAxisLabelWidth + barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={groupColorScale(series.key)}
                      opacity={DEFAULT_OPACITY}
                      onMouseMove={() => {}}
                      onMouseLeave={() => {}}
                    />
                  );
                }),
              )
            : filteredData.map((categoryData) => {
                const category = String(categoryData.label);
                const categoryX = categoryScale(category) || 0;
                return groupKeys.map((groupKey) => {
                  const value = Number(categoryData.data?.[groupKey]);
                  if (Number.isNaN(value)) return null;
                  const barX = categoryX + (groupScale(groupKey) || 0);
                  const barWidth = groupScale.bandwidth();
                  const barHeight = drawableChartHeight - valueScale(value);
                  const barY = valueScale(value);
                  return (
                    <CustomBar
                      key={`grouped-${category}-${groupKey}`}
                      x={yAxisLabelWidth + barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={groupColorScale(groupKey)}
                      opacity={DEFAULT_OPACITY}
                      rx={DEFAULT_BAR_RADIUS}
                      onMouseMove={() => {}}
                      onMouseLeave={() => {}}
                    />
                  );
                });
              })}
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default VerticalGroupedBarChart;
