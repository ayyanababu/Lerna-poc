import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleOrdinal } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";

import useChartDimensions from "../../../hooks/useChartDimensions";
import useChartScales from "../../../hooks/useChartScales";
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
  chartProps,
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
}) => {
  const { theme } = useTheme();
  let {
    parentRef,
    width = 100,
    height = 100,
  } = useParentSize({ debounceTime: 150 });

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
  const axis_bottom = useRef<SVGGElement | null>(null);
  const axis_left = useRef<SVGGElement | null>(null);
  const overall_chart = useRef<SVGGElement | null>(null);
  const legend_ref = useRef<SVGGElement | null>(null);
  const line_chart = useRef<SVGGElement | null>(null);
  const [refreshAxis, setRefreshAxis] = useState<number>(0);
  const [barList, setBarList] = useState<BarsList[]>([]);
  const [innerWidth, setInnerWidth] = useState<number>(0);
  const [hideChart, setHideChart] = useState<number[]>([]);
  const [showBar, setShowBar] = useState<boolean>(true);
  const [showLine, setShowLine] = useState<boolean>(true);
  const [rightPositionYAxis, setRightPositionYAxis] = useState<number>(0);
  const [, setHoveredBarId] = useState<string>("");
  const [moveforBarLineLegend, setmoveforBarLineLegend] = useState(0);
  const [lineColor,setLineColor] = useState<string>("");

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
    axis_bottom,
    legend_ref,
    overall_chart,
  });

  useEffect(() => {
    if (
      chartProps &&
      chartProps.variant &&
      chartProps?.variant.toUpperCase() === "BAR AND LINE"
    ) {
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
  }, [width, chartSvgRef, axis_left, axis_bottom]);

  useEffect(() => {
    if (legendsProps) {
      const { legendsHeight, scrollbarAfter } = legendsProps;
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
    axis_bottom.current,
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
  const variant = chartProps?.variant?.toUpperCase() ?? "";

  const filteredData = useMemo<BarLineDataItem[]>(() => {
    if (!isValidData(data)) return [];
    const { chartData } = data;
    switch (variant) {
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
  const typedYscale = yScale;
  const typedY1scale = y1Scale;

  let circleRadius = 0;
  let xOffset = 0;

  if (
    chartProps &&
    chartProps?.variant &&
    chartProps?.variant.toUpperCase() === "BAR AND LINE"
  ) {
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
    if (
      chartProps &&
      chartProps?.variant &&
      chartProps?.variant.toUpperCase() === "BAR AND LINE"
    ) {
      return [
        { label: yAxisLeftLabel, value: 0, color:null},
        { label: yAxisRightLabel, value: 0, color:lineColor?lineColor:theme.colors.charts.line[0] },
      ];
    } else {
      if (isBarLineData(data)) {
        return filteredData.map((d: BarLineDataItem) => ({
          label: d.xAxis,
          value: d.yAxisLeft,
          color:d.barColor
        }));
      }
    }
  }, [data, yAxisLeftLabel, yAxisRightLabel, lineColor]);


  const colorScale = useMemo(() => {
    if (colors && !("bar" in colors) && !("line" in colors) && colors?.length) {
      return scaleOrdinal<string, string>({
        domain: filteredData.map((_, index) => filteredData[index].xAxis),
        range: colors,
      });
    }
    if (colors && ("line" in colors)){
      setLineColor(colors.line);
    }
    if (colors && ("bar" in colors)) {
      console.log('bared',colors.bar)
      return scaleOrdinal<string, string>({
        domain: filteredData.map((_, index) => filteredData[index].xAxis),
        range: [colors.bar],
      });
    }
    if (colors && !("line" in colors) && !("bar" in colors)){
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
          if (
            chartProps &&
            chartProps?.variant &&
            chartProps?.variant.toUpperCase() === "BAR AND LINE"
          ) {
            const { yAxisLeft, yAxisRight, xAxis } = chartData[index];
            const toolTipdata = [
              { label: yAxisLeftLabel, value: yAxisLeft, color: colorScale(yAxisLeftLabel?yAxisLeftLabel:'') },
              {
                label: yAxisRightLabel,
                value: yAxisRight,
                color: lineColor?lineColor:theme.colors.charts.line[0],
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
    [isLoading, filteredData, showTooltip, setHoveredBar, setHoveredLine, lineColor],
  );


  const handleLineMouseMove = useCallback(
    (value: number | undefined, color: string, index: number) =>
      (event: React.MouseEvent) => {
        if (!isLoading) {
          if (
            chartProps &&
            chartProps?.variant &&
            chartProps?.variant.toUpperCase() === "BAR AND LINE"
          ) {
            const { yAxisLeft, yAxisRight, xAxis } = chartData[index];
            const toolTipdata = [
              {
                label: yAxisRightLabel,
                value: yAxisRight,
                color: lineColor?lineColor:theme.colors.charts.line[0],
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
    [isLoading, filteredData, showTooltip, setHoveredBar, setHoveredLine, lineColor],
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
      if (isWrapped && chartSvgRef.current && axis_bottom.current) {
        let legendheight = 0;
        if (legend_ref && legend_ref.current) {
          const currentLegend = legend_ref.current as SVGGElement;
          if (currentLegend) {
            legendheight = currentLegend.getBBox().height;
          }
        }
        let axisheight = 0;
        if (axis_bottom && axis_bottom.current) {
          axisheight = axis_bottom.current.getBBox().height;
        }
        const hgt =
          height -
          defaultMargin.top -
          defaultMargin.bottom -
          legendheight -
          axisheight +
          TICK_LABEL_PADDING;
        setDrawableChartHeight(hgt);

        let moveY = 0;
        if (overall_chart && overall_chart.current) {
          moveY = overall_chart.current.getBBox().height;
          setTopLegendPosition(moveY - defaultMargin.bottom);
        }
      }
    },
    [
      chartSvgRef,
      axis_bottom,
      legend_ref,
      height,
      setDrawableChartHeight,
      setTopLegendPosition,
      isLoading,
    ],
  );

  const generatedLegendHeight = (calculatedlegendHeight: number) => {
    if (legendsProps) {
      setCalculatedLegendHeight(calculatedlegendHeight);
      //        if (legendHeight > 0) {
      //          return;
      //        }
      const { scrollbarAfter, eachLegendGap } = legendsProps;
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
  };
  // [legendsProps],
  // );

  const isLegendRendered = (renderedStatus: boolean) => {
    if (renderedStatus) {
      if (chartSvgRef && chartSvgRef.current) {
        setLegendBoxWidth(
          (chartSvgRef?.current?.querySelector("g") as SVGGElement).getBBox()
            .width -
            (chartProps &&
            chartProps?.variant &&
            chartProps?.variant.toUpperCase() != "BAR AND LINE"
              ? 10
              : 0),
        );
      }
      let moveY = 0;
      if (axis_bottom && axis_bottom.current) {
        const axisBottomBBox = axis_bottom.current.getBBox();
        if (axis_bottom && axis_bottom.current.getAttribute("transform")) {
          const transform = axis_bottom.current.getAttribute("transform");
          if (transform) {
            const translateY = parseFloat(
              transform.split("translate(")[1].split(",")[1],
            );
            moveY = translateY + axisBottomBBox.y + axisBottomBBox.height;
          }
        } else {
          moveY = +axisBottomBBox.y + axisBottomBBox.height;
        }
        setTopLegendPosition(moveY + 10);
      }
      if (axis_left && axis_left.current) {
        let lleft = -8;
        if (
          chartProps &&
          chartProps?.variant &&
          chartProps?.variant.toUpperCase() != "BAR AND LINE"
        ) {
          if (!yAxisLeftLabel) {
            lleft += 18;
          }else{
            lleft += 2;          
          }
        }
        setLegendLeft(axis_left.current.getBBox().x + lleft);
      }
    }
    let legendcalculatedHeight = 0;
    if (legend_ref && legend_ref.current && legendsProps?.isVisible) {
      if (legend_ref && legend_ref.current) {
        legendcalculatedHeight = legend_ref.current.getBBox().height;
      }
    }
    let axisbottomheight: number = 0;
    if (axis_bottom && axis_bottom.current) {
      axisbottomheight = (axis_bottom.current as SVGGElement).getBBox().height;
    }
    const hgt =
      height -
      defaultMargin.top -
      defaultMargin.bottom -
      legendcalculatedHeight -
      axisbottomheight;
    setDrawableChartHeight(hgt);
  };

  const generateAxis = useCallback((selectedLegends: number[]) => {
    setRefreshAxis(selectedLegends.length);
  }, []);

  const transferBarList = (barsList: BarsList[]) => {
    setBarList(barsList);
    setRefreshAxis(barList.length);
  };

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

      if (chartProps?.variant?.toUpperCase() === "BAR AND LINE") {
        if (hoveredIndex === 0) {
          setHoveredBar(0);
        } else if (hoveredIndex === 1) {
          setHoveredLine(1);
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
    if (chartProps && chartProps.variant) {
      setmoveforBarLineLegend(
        chartProps?.variant?.toUpperCase() === "BAR AND LINE" ? 4 : 0,
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
      <svg ref={chartSvgRef} width="100%" height="100%">
        {isLoading && <SvgShimmer />}
        <Group
          top={defaultMargin.top}
          left={
            yAxisLabelWidth > defaultMargin.left
              ? yAxisLabelWidth
              : defaultMargin.left
          }
        >
          <g ref={overall_chart}>
            <g ref={axis_left}>
              <AxisManager.YAxis
                scale={typedYscale}
                isLoading={isLoading}
                hideTicks={!showTicks}
                hideAxisLine={!showYAxis}
                label={yAxisLeftLabel}
                showYAxis={showYAxis}
                chart={chartProps?.variant}
                {...yAxisProps}
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

            <g ref={axis_bottom}>
              <AxisManager.XAxis
                scale={typedXscale}
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
                chart={chartProps?.variant ? chartProps?.variant : ""}
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
                chartProps={chartProps?.variant}
              />
            )}
            {showLine &&
            chartProps &&
            chartProps.variant &&
            chartProps?.variant.toUpperCase() === "BAR AND LINE" ? (
              <g ref={line_chart}>
                <LineRenderer
                  data={data}
                  xScale={typedXscale}
                  y1Scale={typedY1scale}
                  defaultOpacity={DEFAULT_OPACITY}
                  reducedOpacity={REDUCED_OPACITY}
                  circleRadius={circleRadius}
                  getAxisRight={getAxisRight}
                  {...y1AxisProps}
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
                  chart={chartProps?.variant}
                  handleLineMouseMove={handleLineMouseMove}
                  handleLineMouseLeave={handleLineMouseLeave}
                />
              </g>
            ) : (
              ""
            )}
          </g>
          <g ref={legend_ref}>
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
              chart={chartProps && chartProps.variant ? chartProps.variant : ""}
            />
          </g>
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default Bar;
