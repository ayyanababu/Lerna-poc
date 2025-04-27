/* eslint-disable max-lines */
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
let AXISX_ROTATE = false;
const AXISY_ROTATE = true;
const BASE_ADJUST_WIDTH = 5; // used to fix the check width for the overlap of xaxis
const ADD_ADJUST_WIDTH = 0; // used to check the overlap of xaxis
const BASE_ADJUST_HEIGHT = 5; // used to fix the check width for the overlap of yaxis
const ADD_ADJUST_HEIGHT = 0; // used to check the overlap of yaxis
const bottomHeightAddOnSpace = 0;
const titleHeightAddOnSpace = 0;

/* const getEstimatedYAxisWidth = (maxValue: number, averageCharWidth = 7) => {
  const formattedValue = formatNumberWithSuffix(maxValue);
  const commasCount = Math.floor(
    Math.max(0, Math.abs(maxValue).toString().length - 3) / 3,
  );
  return formattedValue.length * averageCharWidth + commasCount * 3 + 12;
};
 */
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
  const axis_left = useRef<SVGGElement | null>(null);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(
    null,
  );
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(
    null,
  );
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const [bottomHeight, setBottomHeight] = useState(0);
  const [titleHeight,setTitleHeight] = useState(0);    

  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidth;
  const innerWidth = width - axisXStart - DEFAULT_MARGIN.right;

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

  useEffect(() => {
    if (!chartSvgRef.current) return;
    const nodes = chartSvgRef.current.querySelectorAll(".visx-axis-left text");
    const widths = Array.from(nodes).map(
      (node) => (node as SVGGraphicsElement).getBBox().width,
    );
    setMaxLabelWidth(Math.max(...widths, 0));
  }, [data, width, height]);

  const filteredData = useMemo(
    () => data.filter((_, index) => !hideIndex.includes(index)),
    [data, hideIndex],
  );

  /*   const margin = useMemo(() => {
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
   */
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
    const legendHeight = bottomHeight
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
  }, [data, width, height, DEFAULT_MARGIN, innerWidth, bottomHeight, titleHeight]);

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
    if (!axis_left.current || !yScale) return;
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
        //     const truncated =
        //       label.slice(0, Math.floor(label.length * TRUNCATE_RATIO)) + "…";
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
  }, [yScale, axis_left.current]);

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
      <svg
        ref={chartSvgRef}
        width={adjustedChartWidth || width}
        height={adjustedChartHeight || height}
      >
        {isLoading && <SvgShimmer />}
        <Group top={DEFAULT_MARGIN.top} left={yAxisLabelWidth}>
          <g ref={axis_left}>
            <YAxis scale={yScale} isLoading={isLoading} {...yAxisProps} />
          </g>
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
