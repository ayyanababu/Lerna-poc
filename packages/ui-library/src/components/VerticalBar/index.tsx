 
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
import ErrorBoundary from "../ErrorBoundary";

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
const truncatedLabelSuffix = "..";
const activatesizing = true;
const nodenametocheck = "SVG";

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
  let {
    parentRef,
    width = 100,
    height = 100,
  } = useParentSize({ debounceTime: 150 });

  width = width > 0 ? width : 100;
  height = height > 0 ? height : 300;

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
  const [titleHeight, setTitleHeight] = useState(0);

  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const axisXStart = DEFAULT_MARGIN.left + yAxisLabelWidth;
  const innerWidth = width - axisXStart - DEFAULT_MARGIN.right;
  const [drawableChartHeight, setdrawableChartHeight] = useState(0);
  const [innerHeight, setinnerHeight] = useState(
    height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom,
  );
  const [Wrapped, setWrapped] = useState(false);
  const [recalculate,setRecalculate] = useState(true);

  let rotateincrease = 0;
  let barwidth = 0;

  useEffect(() => {
    if (parentRef.current && activatesizing) {
      setTimeout(() => {
        const legendboxtimer = setInterval(() => {
          if (
            parentRef.current.parentNode &&
            parentRef.current.parentNode.querySelectorAll("div")[0]
          ) {
            console.log("parent",parentRef.current )
            const legendbox =
              parentRef.current.parentNode.querySelectorAll("div")[0];
            const lb = legendbox.querySelectorAll("div");
            if (lb.length === 0){
              clearInterval(legendboxtimer);
            }
            const lheight = lb[lb.length - 1].offsetTop  - lb[0].offsetTop;
            const spans =
              parentRef.current?.parentNode?.parentNode?.querySelectorAll<HTMLSpanElement>(
                "span",
              );
            const lastSpan = spans ? spans[spans.length - 1] : null;
            setBottomHeight(
                lheight +
                lastSpan.offsetHeight +
                bottomHeightAddOnSpace,
            );
            clearInterval(legendboxtimer);
          }
        }, 2000);
        const titleboxtimer = setInterval(() => {
          const titlebox =
            parentRef.current?.parentNode?.parentNode.querySelector<HTMLSpanElement>(
              ".MuiTypography-h6",
            );
          if (titlebox) {
            setTitleHeight(titlebox.offsetHeight + titleHeightAddOnSpace);
            clearInterval(titleboxtimer);
          }
        }, 2000);
      }, 1000);
    }
  }, [parentRef.current,recalculate]);

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
  //  const innerHeight = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom;

  useEffect(() => {
    console.log("inner", innerHeight);
    setdrawableChartHeight(innerHeight);
  }, [innerHeight]);

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

  const calculatedBarWidth = xScale.bandwidth();
  barwidth = getOptimalBarWidth(calculatedBarWidth);

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
    setAdjustedChartHeight(updatedHeight + rotateincrease);
    setAdjustedChartWidth(updatedWidth);
  }, [
    data,
    width,
    height,
    DEFAULT_MARGIN,
    innerWidth,
    bottomHeight,
    titleHeight,
    AXISX_ROTATE,
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
    if (rotate) {
      rotateincrease = 70;
    }
    console.log("rotating");
    if (rotate && chartSvgRef.current) {
      setTimeout(() => {
        const legendHeight = bottomHeight;
        const bottomaxisheight = axis_bottom.current.getBBox().height - 30;
        const hgt =
          height -
          DEFAULT_MARGIN.top -
          DEFAULT_MARGIN.bottom -
          bottomaxisheight;
        setinnerHeight(hgt);
        //     const svg = chartSvgRef.current;
        //     const bbox = svg.getBBox();
        //     const legendHeight = bottomHeight;
        //     const bottomaxisheight = axis_bottom.current.getBBox().height;
        //     const hgt =
        //       height -
        //       DEFAULT_MARGIN.top -
        //       DEFAULT_MARGIN.bottom -
        //       bottomaxisheight;
        //    setdrawableChartHeight(hgt);
        //        innerHeight = hgt;
      }, 200);
    }
  };

  const wrapped = (wrapped: boolean) => {
    setTimeout(() => {
      if (wrapped && chartSvgRef.current && axis_bottom.current) {
        setWrapped(wrapped);
        setRecalculate(true);
        const bottomaxisheight = axis_bottom.current.getBBox().height;
        const hgt =
          height -
          DEFAULT_MARGIN.top -
          DEFAULT_MARGIN.bottom -
          bottomaxisheight
          -bottomHeight
        console.log("bottom",bottomHeight);
        console.log("hgt",hgt)
        setinnerHeight(hgt);
      }
    }, 300);
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
              top={drawableChartHeight}
              isLoading={isLoading}
              availableWidth={innerWidth}
              forceFullLabels
              {...xAxisProps}
              addGap={BASE_ADJUST_WIDTH}
              rotated={rotated}
              wrapped={wrapped}
              barWidth={barwidth}
            />
          </g>
          {filteredData.map((d, index) => {
            const value = Number(d.value);
            if (Number.isNaN(value)) return null;

            const calculatedBarWidth = xScale.bandwidth();
            barwidth = getOptimalBarWidth(calculatedBarWidth);
            let barX =
              barwidth < calculatedBarWidth
                ? (xScale(d.label) || 0) + (calculatedBarWidth - barwidth) / 2
                : xScale(d.label) || 0;
            if (index === 0 || index === filteredData.length - 1) {
                if (index === 0) {
                    barX = barX - BASE_ADJUST_WIDTH;
                } else {
                    barX = barX + BASE_ADJUST_WIDTH * 1.5;
                }
            } else {
                barX = barX + BASE_ADJUST_WIDTH / 2;
            }                               
            const barHeight = drawableChartHeight - yScale(value);
            const barY = yScale(value);
            const isHovered = hoveredBar === index;
            const barOpacity =
              hoveredBar !== null && !isHovered
                ? REDUCED_OPACITY
                : DEFAULT_OPACITY;
            const radius = Math.min(
              DEFAULT_BAR_RADIUS,
              barwidth / 2,
              barHeight > 0 ? barHeight : 0,
            );
            const barColor = d.color || colorScale(index);

            return (
              <CustomBar
                key={`bar-${d.label}`}
                x={barX}
                y={barY}
                width={barwidth}
                height={barHeight}
                fill={barColor}
                isLoading={isLoading}
                opacity={barOpacity}
                pathProps={{
                  d: `
                    M ${barX},${barY + barHeight}
                    L ${barX + barwidth},${barY + barHeight}
                    L ${barX + barwidth},${barY + radius}
                    Q ${barX + barwidth},${barY} ${barX + barwidth - radius},${barY}
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

const VerticalBarChartComponent = (props: VerticalBarChartProps) => {
  return (
    <ErrorBoundary>
      <VerticalBarChart {...props} />
    </ErrorBoundary>
  );
};

export default VerticalBarChartComponent;
