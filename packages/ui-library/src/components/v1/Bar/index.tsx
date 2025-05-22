/* eslint-disable max-lines */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect
} from "react";
import { AxisScale } from "@visx/axis";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleOrdinal } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";
import { ScaleLinear } from "d3-scale"; // Importing the correct type for linear scales

import useChartDimensions from "../../../hooks/useChartDimensions";
import useChartScales, {
  LinearScaleInterface,
} from "../../../hooks/useChartScales";
import useTheme from "../../../hooks/useTheme";
import ChartWrapper from "../../ChartWrapper";
import Grid from "../../Grid";
import { LegendPosition } from "../../Legends/types";
import SvgShimmer from "../../Shimmer/SvgShimmer";
import { TooltipData } from "../../Tooltip/types";
import AxisManager from "../common/AxisManager";
import BarRenderer from "../common/BarRenderer";
import {
  BarLineData,
  BarLineDataItem,
  BarsList,
  DataPoint,
} from "../common/Data.types";
import LegendManager from "../common/LegendManager";
import LineRenderer from "../common/LineRenderer";
import { UnifiedChartProps } from "./types";

const defaultMargin = {
  top: 5,
  right: 0,
  bottom: 0,
  left: 28,
};

const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const TICK_LABEL_PADDING = 8;
const BASE_ADJUST_WIDTH = 8;

const Bar: React.FC<UnifiedChartProps> = ({
  data,
  title,
  colors,
  isLoading = false,
  titleProps,
  variant,
  legendsProps,
  tooltipProps,
  xAxisProps,
  yAxisProps,
  y1AxisProps,
  gridProps,
  timestampProps,
  barProps,
  onClick,
  maxBarWidth,
  showGrid = true,
  showTicks = false,
  showXAxis = false,
  showYAxis = false,
  onLineClick,
  onPointClick,
  onArrowClick,
}) => {
  const { theme } = useTheme();
  const { parentRef } = useParentSize({ debounceTime: 150 });

  let { width = 100, height = 100 } = useParentSize({ debounceTime: 150 });

  if (!width) {
    width = parentRef?.current?.offsetWidth ?? 0;
  }
  if (!height) {
    height = parentRef?.current?.offsetHeight ?? 0;
  }

  const [yAxisLabelWidth, setYAxisLabelWidth] = useState<number>(
    defaultMargin.left + TICK_LABEL_PADDING,
  );
  const [hoveredBar, setHoveredBar] = useState<number | null | undefined>(null);
  const [hoveredBarOther, setHoveredBarOther] = useState<
    number | null | undefined
  >(null);
  const [hoveredLine, setHoveredLine] = useState<number | null | undefined>(
    null,
  );
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const axisBottom = useRef<SVGGElement | null>(null);
  const axisLeft = useRef<SVGGElement | null>(null);
  const overallChart = useRef<SVGGElement | null>(null);
  const legendRef = useRef<SVGGElement | null>(null);
  const lineChart = useRef<SVGGElement | null>(null);
  const [refreshAxis, setRefreshAxis] = useState<number>(0);
  const [barList, setBarList] = useState<BarsList[]>([]);
  const [innerWidth, setInnerWidth] = useState<number>(0);
  const [hideChart, setHideChart] = useState<number[]>([]);
  const [showBar, setShowBar] = useState<boolean>(true);
  const [showLine, setShowLine] = useState<boolean>(true);
  const [rightPositionYAxis, setRightPositionYAxis] = useState<number>(0);
  const [, setHoveredBarId] = useState<string>("");
  const [moveforBarLineLegend, setmoveforBarLineLegend] = useState(0);
  const [lineColor, setLineColor] = useState<string>("");
  const [newCalculatedHeight,setCalculatedHeight] = useState(height)

  const {
    drawableChartHeight,
    setDrawableChartHeight,
    legendTopPosition,
    setTopLegendPosition,
    legendLeft,
    setLegendLeft,
    legendHeight,
    setLegendHeight,
    legendBoxWidth,
    setLegendBoxWidth,
    calculatedLegendHeight,
    setCalculatedLegendHeight,
    adjustedChartHeight,
  } = useChartDimensions({
    width,
    height,
    defaultMargin,
    chartSvgRef,
    axisBottom,
    legendRef,
    overallChart,
  });

  useEffect(() => {
    if (variant && variant.toUpperCase() === "BAR AND LINE") {
      if (hideChart.includes(0)) {
        setShowBar(false);
      } else {
        setShowBar(true);
      }
      if (hideChart.includes(1)) {
        setShowLine(false);
      } else {
        setShowLine(true);
      }
    } else {
      setShowLine(true);
      setShowBar(true);
    }
  }, [hideChart]);

  useEffect(() => {
    const svg = document.querySelector("svg");
    if (!isLoading && svg) {
      const axisLefts = svg.querySelector(".visx-axis-left");

      if (axisLefts) {
        const nodes = axisLefts.querySelectorAll("text");
        const widths = Array.from(nodes).map(
          (node) => (node as SVGGraphicsElement).getBBox().width,
        );
        const maxWidth = Math.max(...widths, 0) + TICK_LABEL_PADDING;
        setYAxisLabelWidth(maxWidth);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    setInnerWidth(
      width -
        defaultMargin.right -
        (yAxisLabelWidth > defaultMargin.left
          ? yAxisLabelWidth
          : defaultMargin.left),
    );
  }, [width, chartSvgRef, axisLeft, axisBottom]);

  useEffect(() => {
    if (legendsProps) {
      let { legendsHeight, scrollbarAfter } = legendsProps;
      if (!legendsHeight) {
        legendsHeight = 1;
      }
      if (
        legendsHeight &&
        legendsHeight > 0 &&
        scrollbarAfter &&
        scrollbarAfter < 0
      ) {
        if (adjustedChartHeight) {
          if (legendsHeight < 1) {
            setLegendHeight(legendsHeight * adjustedChartHeight);
          } else {
            setLegendHeight(calculatedLegendHeight);
          }
        }
      }
    }
  }, [
    chartSvgRef,
    axisBottom.current,
    adjustedChartHeight,
    calculatedLegendHeight,
  ]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData[]>();

  const isBarLineData = (obj: object): obj is BarLineData => {
    if (!("chartData" in obj)) return false;
    const candidate = obj as BarLineData;
    return Array.isArray(candidate.chartData);
  };

  const isValidData = (obj: object): obj is BarLineData => {
    if (!("chartData" in obj)) return false;
    const candidate = obj as BarLineData;
    return Array.isArray(candidate.chartData);
  };

  // at the top of your component

  const filteredData = useMemo<BarLineDataItem[]>(() => {
    if (!isValidData(data)) return [];
    const { chartData } = data;
    switch (variant && variant.toUpperCase()) {
      case "VERTICAL BAR":
      case "BAR AND LINE":
        return chartData.filter((_, i) => !hideIndex.includes(i));
      case "VERTICAL STACKED BAR":
      case "HORIZONTAL STACKED BAR":
      case "HORIZONTAL BAR":
        return chartData;
      default:
        return [];
    }
  }, [data, hideIndex, variant]);

  let xAxislabel = "";
  let yAxisLeftLabel = undefined;
  let yAxisRightLabel = undefined;
  let chartData: BarLineDataItem[] = [];

  if (data && typeof data === "object" && "chartData" in data) {
    if (isBarLineData(data)) {
      const typedData = data as BarLineData;
      xAxislabel = typedData.xAxislabel;
      yAxisLeftLabel = typedData.yAxisLeftLabel;
      yAxisRightLabel = typedData.yAxisRightLabel;
      chartData = typedData.chartData;
    }
  }

  const { xScale, yScale, y1Scale } = useChartScales({
    filteredData,
    innerWidth,
    drawableChartHeight,
  });

  const typedXscale = xScale;
  const typedYscale = yScale as ScaleLinear<number, number, never>;
  const typedY1scale = y1Scale;

  let circleRadius = 0;
  let xOffset = 0;

  if (variant && variant.toUpperCase() === "BAR AND LINE") {
    const defaultBarWidth = xScale.bandwidth();
    const actualBarWidth = Math.min(
      defaultBarWidth,
      maxBarWidth ? maxBarWidth : 0,
    );
    xOffset =
      actualBarWidth < defaultBarWidth
        ? (defaultBarWidth - actualBarWidth) / 2
        : 0;
    circleRadius = Math.min(4, actualBarWidth / 4);
  }

  const legendData = useMemo(() => {
    if (variant && variant.toUpperCase() === "BAR AND LINE") {
      return [
        { label: yAxisLeftLabel, value: 0, color: null },
        {
          label: yAxisRightLabel,
          value: 0,
          color: lineColor ? lineColor : theme.colors.charts.line[0],
        },
      ];
    } else if (isBarLineData(data)) {
      return filteredData.map((d: BarLineDataItem) => ({
        label: d.xAxis,
        value: d.yAxisLeft,
        color: d.barColor,
      }));
    }

    // Fallback to an empty array to ensure consistent return
    return [];
  }, [data, yAxisLeftLabel, yAxisRightLabel, lineColor]);

  const colorScale = useMemo(() => {
    if (colors && !("bar" in colors) && !("line" in colors) && colors?.length) {
      return scaleOrdinal<string, string>({
        domain: filteredData.map((_, index) => filteredData[index].xAxis),
        range: colors,
      });
    }
    if (colors && "line" in colors) {
      setLineColor(colors.line);
    }
    if (colors && "bar" in colors) {
      return scaleOrdinal<string, string>({
        domain: filteredData.map((_, index) => filteredData[index].xAxis),
        range: [colors.bar],
      });
    }
    if (colors && !("line" in colors) && !("bar" in colors)) {
      setLineColor(theme.colors.charts.line[0]);
    }
    return scaleOrdinal<string, string>({
      domain: filteredData.map((_, index) => filteredData[index].xAxis),
      range: theme.colors.charts.bar,
    });
  }, [colors, filteredData, theme.colors.charts.bar]);

  const handleBarMouseMove = useCallback(
    (value: number, color: string, index: number) =>
      (event: React.MouseEvent) => {
        if (!isLoading) {
          if (variant && variant.toUpperCase() === "BAR AND LINE") {
            const { yAxisLeft, yAxisRight } = chartData[index];
            const toolTipdata = [
              {
                label: yAxisLeftLabel ?? "",
                value: yAxisLeft ?? 0,
                color: colorScale(yAxisLeftLabel ? yAxisLeftLabel : ""),
              },
              {
                label: yAxisRightLabel ?? "",
                value: yAxisRight ?? 0,
                color: lineColor ? lineColor : theme.colors.charts.line[0],
              },
            ];
            showTooltip({
              tooltipData: toolTipdata,
              tooltipLeft: event.clientX,
              tooltipTop: event.clientY,
            });
            if (event && event?.target) {
              const element = event.target as HTMLElement;
              const id = element.getAttribute("id")?.split("_")[1];
              if (id) {
                setHoveredBarId(id);
              }
            }
            setHoveredBar(0);
            setHoveredBarOther(index);
          } else {
            showTooltip({
              tooltipData: [
                {
                  label: filteredData[index].xAxis,
                  value,
                  color,
                },
              ],
              tooltipLeft: event.clientX,
              tooltipTop: event.clientY,
            });
            setHoveredBar(index);
          }
        }
      },
    [
      isLoading,
      filteredData,
      showTooltip,
      setHoveredBar,
      setHoveredLine,
      lineColor,
    ],
  );

  const handleLineMouseMove = useCallback(
    (value: number | undefined, color: string, index: number) =>
      (event: React.MouseEvent) => {
        if (!isLoading) {
          if (variant && variant.toUpperCase() === "BAR AND LINE") {
            const { yAxisRight } = chartData[index];
            const toolTipdata = [
              {
                label: yAxisRightLabel ?? "",
                value: yAxisRight ?? 0,
                color: lineColor ? lineColor : theme.colors.charts.line[0],
              },
            ];
            showTooltip({
              tooltipData: toolTipdata,
              tooltipLeft: event.clientX,
              tooltipTop: event.clientY,
            });
            if (event && event?.target) {
              const element = event.target as HTMLElement;
              const id = element.getAttribute("id")?.split("_")[1];
              if (id) {
                setHoveredBarId(id);
              }
            }
            setHoveredBar(0);
            setHoveredBarOther(index);
          } else {
            showTooltip({
              tooltipData: [
                {
                  label: filteredData[index].xAxis,
                  value: value ?? 0,
                  color,
                },
              ],
              tooltipLeft: event.clientX,
              tooltipTop: event.clientY,
            });
            setHoveredBar(index);
          }
        }
      },
    [
      isLoading,
      filteredData,
      showTooltip,
      setHoveredBar,
      setHoveredLine,
      lineColor,
    ],
  );

  const handleBarMouseLeave = useCallback(() => {
    if (!isLoading) {
      hideTooltip();
      setHoveredBar(null);
      setHoveredLine(null);
    }
  }, [isLoading, hideTooltip]);

  const handleLineMouseLeave = useCallback(() => {
    if (!isLoading) {
      hideTooltip();
      setHoveredBar(null);
      setHoveredLine(null);
    }
  }, [isLoading, hideTooltip]);

  const wrapped = useCallback(
    (isWrapped: boolean) => {
      if (isWrapped && chartSvgRef.current && axisBottom.current) {
        let legendheight = 0;
        if (legendRef && legendRef.current) {
          const currentLegend = legendRef.current as SVGGElement;
          if (currentLegend) {
            legendheight = currentLegend.getBBox().height;
          }
        }
        let axisheight = 0;
        if (axisBottom && axisBottom.current) {
          axisheight = axisBottom.current.getBBox().height;
        }
        let newcalculatedheight = height;
        if ((!timestampProps || (timestampProps && !timestampProps.timestamp)) && chartSvgRef && chartSvgRef.current){
          newcalculatedheight = (chartSvgRef.current?.parentElement as HTMLDivElement).offsetHeight
        }        
        const hgt =
          newcalculatedheight -
          defaultMargin.top -
          defaultMargin.bottom -
          legendheight -
          axisheight +
          TICK_LABEL_PADDING;
        setDrawableChartHeight(hgt);

        let moveY = 0;
        if (overallChart && overallChart.current) {
          moveY = overallChart.current.getBBox().y+overallChart.current.getBBox().height;
          setTopLegendPosition(moveY - defaultMargin.bottom);
        }
      }
    },
    [
      chartSvgRef,
      axisBottom,
      legendRef,
      height,
      setDrawableChartHeight,
      setTopLegendPosition,
      isLoading,
    ],
  );

  const generatedLegendHeight = 
    (calculatedlegendHeight: number) => {
      if (legendsProps) {
        setCalculatedLegendHeight(calculatedlegendHeight);
        //        if (legendHeight > 0) {
        //          return;
        //        }
        let { scrollbarAfter, eachLegendGap } = legendsProps;
        if (!scrollbarAfter) {
          scrollbarAfter = -1;
        }
        if (!eachLegendGap) {
          eachLegendGap = 23;
        }
        if (
          typeof scrollbarAfter === "number" &&
          typeof eachLegendGap === "number"
        ) {
          if (scrollbarAfter < 0) {
            setLegendHeight(calculatedlegendHeight);
          } else {
            setLegendHeight(scrollbarAfter * eachLegendGap);
          }
        } else {
          if (scrollbarAfter && scrollbarAfter < 0) {
            setLegendHeight(calculatedlegendHeight);
          }
        }
      }
    }
  // [legendsProps],
  // );

  useEffect(()=>{
      if (chartSvgRef && chartSvgRef.current) {
        setLegendBoxWidth(
          (chartSvgRef?.current.parentElement as HTMLDivElement).offsetWidth -
            (variant &&
             variant.toUpperCase() != "BAR AND LINE"
              ? 10
              : 0),
        );
      }
  },[chartSvgRef.current,chartSvgRef?.current?.querySelector("g")])

  const isLegendRendered = (renderedStatus: boolean) => {
    if (renderedStatus) {
      let moveY = 0;
      if (axisBottom && axisBottom.current) {
        const axisBottomBBox = axisBottom.current.getBBox();
        if (axisBottom && axisBottom.current.getAttribute("transform")) {
          const transform = axisBottom.current.getAttribute("transform");
          if (transform) {
            const translateY = parseFloat(
              transform.split("translate(")[1].split(",")[1],
            );
            moveY = translateY + axisBottomBBox.y + axisBottomBBox.height;
          }
        } else {
          moveY = +axisBottomBBox.y + axisBottomBBox.height;
        }
        setTopLegendPosition(moveY  + 5);
      }
      if (axisLeft && axisLeft.current) {
        let lleft = -8;
        if (variant && variant.toUpperCase() != "BAR AND LINE") {
          if (!yAxisLeftLabel) {
            lleft += 2;
          } else {
            lleft += 2;
          }
        }
        setLegendLeft(axisLeft.current.getBBox().x + lleft);
      }
    }
    let legendcalculatedHeight = 0;
    if (legendRef && legendRef.current && legendsProps?.isVisible) {
      if (legendRef && legendRef.current) {
        legendcalculatedHeight = legendRef.current.getBBox().height;
      }
    }
    let axisbottomheight: number = 0;
    if (axisBottom && axisBottom.current) {
      axisbottomheight = (axisBottom.current as SVGGElement).getBBox().height;
    }
    let newcalculatedheight = height;
    if ((!timestampProps || (timestampProps && !timestampProps.timestamp)) && chartSvgRef && chartSvgRef.current){
      if (chartSvgRef.current?.parentElement){
         if (chartSvgRef.current?.parentElement.parentElement){
           if (chartSvgRef.current?.parentElement.parentElement.parentElement){
               if (chartSvgRef.current?.parentElement.parentElement.parentElement.parentElement){
                  newcalculatedheight = (chartSvgRef.current?.parentElement.parentElement.parentElement.parentElement as HTMLDivElement).offsetHeight
               } 
           }
         }
       }                       
//       newcalculatedheight = (chartSvgRef.current?.parentElement.parentElement.parentElement.parentElement as HTMLDivElement).offsetHeight
//       console.log("parent element",(chartSvgRef.current?.parentElement.parentElement.parentElement.parentElement as HTMLDivElement).offsetHeight)
    }
    let top = defaultMargin.top;
    if (chartSvgRef && chartSvgRef.current){   
      top = chartSvgRef.current.getBBox().x;
    }   
    setCalculatedHeight(newcalculatedheight - defaultMargin.top);
    const hgt =
      newcalculatedheight  -
      top -
      defaultMargin.bottom -
      legendcalculatedHeight -
      axisbottomheight - ((!timestampProps || (timestampProps && !timestampProps.timestamp))?40:20)
    setDrawableChartHeight(hgt - 16);
  };

  const generateAxis = useCallback((selectedLegends: number[]) => {
    setRefreshAxis(selectedLegends.length);
  }, []);

  const transferBarList = useCallback((barsList: BarsList[]) => {
    setBarList(barsList);
    setRefreshAxis(barList.length);
  }, []);

  const wrappedOnClick = onClick
    ? (
        event: React.MouseEvent<Element>,
        clickdata: DataPoint,
        index: number,
      ) => {
        onClick(event as React.MouseEvent<SVGGElement>, clickdata, index);
      }
    : undefined;

  const {
    position = LegendPosition.BOTTOM,
    hovered = hoveredBar && hoveredBar !== null && hoveredBar > -1
      ? legendData?.[hoveredBar]?.label
      : null,
    setHovered = (label: string | number | null) => {
      const labelStr = label != null ? String(label) : null;
      const hoveredIndex = legendData?.findIndex(
        (item) => item.label === labelStr,
      );

      if (variant && variant.toUpperCase() === "BAR AND LINE") {
        if (hoveredIndex === 0) {
          setHoveredLine(1);
        } else if (hoveredIndex === 1) {
          setHoveredBar(0);
        } else {
          setHoveredBar(null);
          setHoveredLine(null);
        }
      } else {
        setHoveredBar(hoveredIndex !== -1 ? hoveredIndex : null);
      }
    },
  } = legendsProps || {};

  const getAxisRight = (axisrightwidth: number) => {
    setInnerWidth(
      width -
        defaultMargin.right -
        (yAxisLabelWidth > defaultMargin.left
          ? yAxisLabelWidth
          : defaultMargin.left) -
        axisrightwidth,
    );
    if (variant) {
      setmoveforBarLineLegend(
        variant && variant.toUpperCase() === "BAR AND LINE" ? 4 : 0,
      );
    }
    if (chartSvgRef && chartSvgRef.current) {
      setRightPositionYAxis(
        chartSvgRef.current.getBoundingClientRect().width -
          defaultMargin.left -
          defaultMargin.right -
          axisrightwidth +
          10,
      );
    }
  };

  const wrappedonLineClick = onLineClick
    ? (
        event: React.MouseEvent<Element>,
        clickdata: BarLineData,
        index: number,
      ) => {
        onLineClick(event as React.MouseEvent<SVGGElement>, clickdata, index);
      }
    : undefined;

  const wrappedonPointClick = onPointClick
    ? (
        event: React.MouseEvent<Element>,
        clickdata: DataPoint,
        index: number,
      ) => {
        onPointClick(event as React.MouseEvent<SVGGElement>, clickdata, index);
      }
    : undefined;

  const wrappedonArrowClick = onArrowClick
    ? (
        event: React.MouseEvent<Element>,
        clickdata: DataPoint,
        legend: string | undefined,
        index: number,
      ) => {
        onArrowClick(
          event as React.MouseEvent<SVGGElement>,
          clickdata,
          legend,
          index,
        );
      }
    : undefined;

  return (
    <ChartWrapper
      ref={parentRef}
      isLoading={isLoading}
      title={title}
      titleProps={titleProps}
      tooltipProps={{
        data: tooltipData,
        top: tooltipTop,
        left: tooltipLeft,
        isVisible: !isLoading && tooltipOpen,
        ...tooltipProps,
      }}
      timestampProps={{ isLoading, ...timestampProps }}
    >
      <svg ref={chartSvgRef} width="100%" height={newCalculatedHeight}>
        {isLoading && <SvgShimmer />}
        <Group
          top={defaultMargin.top}
          left={
            yAxisLabelWidth > defaultMargin.left
              ? yAxisLabelWidth
              : defaultMargin.left
          }
        >
          <g ref={overallChart}>
            <g ref={axisLeft}>
              <AxisManager.YAxis
                {...yAxisProps}
                scale={typedYscale}
                isLoading={isLoading}
                hideTicks={!showTicks}
                hideAxisLine={!showYAxis}
                label={yAxisLeftLabel}
                showYAxis={showYAxis}
                chart={variant}
              />
            </g>

            {showGrid && (
              <Grid
                width={innerWidth}
                yScale={typedYscale}
                isLoading={isLoading}
                showHorizontal
                {...gridProps}
              />
            )}

            <g ref={axisBottom}>
              <AxisManager.XAxis
                scale={typedXscale as unknown as AxisScale}
                top={drawableChartHeight}
                isLoading={isLoading}
                availableWidth={innerWidth}
                forceFullLabels
                {...xAxisProps}
                addGap={BASE_ADJUST_WIDTH}
                wrapped={wrapped}
                barWidth={maxBarWidth}
                refreshAxis={refreshAxis}
                chartWidth={innerWidth}
                barsList={barList}
                showXAxis={showXAxis}
                chart={variant ? variant : ""}
                label={xAxislabel}
              />
            </g>

            {showBar && (
              <BarRenderer
                filteredData={filteredData}
                xScale={typedXscale}
                yScale={typedYscale}
                colorScale={colorScale}
                hoveredBar={hoveredBar}
                hoveredBarOther={hoveredBarOther}
                isLoading={isLoading}
                maxBarWidth={maxBarWidth}
                drawableChartHeight={drawableChartHeight}
                handleBarMouseMove={handleBarMouseMove}
                handleBarMouseLeave={handleBarMouseLeave}
                defaultOpacity={DEFAULT_OPACITY}
                reducedOpacity={REDUCED_OPACITY}
                baseAdjustWidth={BASE_ADJUST_WIDTH}
                barProps={barProps}
                onClick={wrappedOnClick}
                transferBarList={transferBarList}
                chartProps={variant}
              />
            )}
            {showLine && variant && variant.toUpperCase() === "BAR AND LINE" ? (
              <g ref={lineChart}>
                <LineRenderer
                  data={data}
                  xScale={typedXscale}
                  y1Scale={typedY1scale}
                  defaultOpacity={DEFAULT_OPACITY}
                  reducedOpacity={REDUCED_OPACITY}
                  circleRadius={circleRadius}
                  getAxisRight={getAxisRight}
                  y1AxisProps={{
                    scale:
                      (y1AxisProps?.scale as LinearScaleInterface) ??
                      (typedY1scale as LinearScaleInterface),
                  }}
                  chartWidth={innerWidth}
                  hideIndex={hideChart}
                  setHideIndex={setHideChart}
                  xOffset={xOffset}
                  yAxisRightLabel={yAxisRightLabel}
                  isLoading={isLoading}
                  hoveredLine={hoveredLine}
                  rightPosition={rightPositionYAxis}
                  lineColor={lineColor}
                  hideTicks={!showTicks}
                  hideAxisLine={!showYAxis}
                  label={yAxisRightLabel}
                  chart={variant}
                  handleLineMouseMove={handleLineMouseMove}
                  handleLineMouseLeave={handleLineMouseLeave}
                  onLineClick={wrappedonLineClick}
                  onPointClick={wrappedonPointClick}
                />
              </g>
            ) : (
              ""
            )}
          </g>
          <g ref={legendRef} transform={`translate(0,16)`}>
            <LegendManager
              legendsProps={legendsProps}
              position={position}
              legendData={legendData}
              colorScale={colorScale}
              hideIndex={hideIndex}
              setHideIndex={setHideIndex}
              hovered={hovered}
              setHovered={setHovered}
              isLoading={isLoading}
              isLegendRendered={isLegendRendered}
              generatedLegendHeight={generatedLegendHeight}
              generateAxis={generateAxis}
              legendLeft={legendLeft + moveforBarLineLegend}
              legendTopPosition={legendTopPosition}
              innerWidth={innerWidth}
              legendBoxHeight={legendHeight}
              calculatedLegendHeight={calculatedLegendHeight}
              legendBoxWidth={legendBoxWidth}
              chart={variant ? variant : ""}
              eachLegendGap={
                legendsProps &&
                typeof legendsProps.eachLegendGap !== "undefined"
                  ? legendsProps.eachLegendGap
                  : 20
              }
              onArrowClick={wrappedonArrowClick}
            />
          </g>
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default Bar;
