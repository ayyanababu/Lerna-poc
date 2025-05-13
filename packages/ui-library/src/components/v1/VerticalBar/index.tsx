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
import LineRenderer from "../common/LineRenderer";
import LegendManager from "../common/LegendManager";
import { BarsList, DataPoint } from "../common/types";
import mockVerticalBarChartData from "./mockdata";
import mockBarLineChartData from "../../BarLine/mockData";
import { VerticalBarChartProps, BarLineData } from "./types";
import React from "react";

const defaultMargin = {
  top: 5,
  right: 20,
  bottom: 0,
  left: 50,
};

const DEFAULT_MAX_BAR_WIDTH = 16;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const TICK_LABEL_PADDING = 8;
const BASE_ADJUST_WIDTH = 8;

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data: _data,
  title,
  type,
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

  if (!width) {
    width = parentRef?.current?.offsetWidth ?? 0;
  }
  if (!height) {
    height = parentRef?.current?.offsetHeight ?? 0;
  }

  const data = useMemo<DataPoint[]>(
    () => (isLoading ? mockVerticalBarChartData : _data),
    [isLoading, _data],
  );

  console.log("##### verticalbar", parentRef, width, height, data);

  const [yAxisLabelWidth, setYAxisLabelWidth] = useState<number>(defaultMargin.left + TICK_LABEL_PADDING);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const axis_bottom = useRef<SVGGElement | null>(null);
  const axis_left = useRef<SVGGElement | null>(null);
  const overall_chart = useRef<SVGGElement | null>(null);
  const legend_ref = useRef<SVGGElement | null>(null);

  const [refreshAxis, setRefreshAxis] = useState(0);
  const [barList, setBarList] = useState<BarsList[]>([]);
  const [innerWidth,setInnerWidth] = useState(0);

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
    adjustedChartWidth,
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
    const svg = document.querySelector("svg");
    if (!isLoading && svg) {
      const axisLefts = svg.querySelector(".visx-axis-left");

      if (axisLefts) {
        const nodes = axisLefts.querySelectorAll("text");
        const widths = Array.from(nodes).map(
          (node) => (node as SVGGraphicsElement).getBBox().width
        );
        const maxWidth = Math.max(...widths, 0) + TICK_LABEL_PADDING;
        setYAxisLabelWidth(maxWidth);
      }
    }
  }, [isLoading]);


  useEffect(()=>{
    setInnerWidth(width - defaultMargin.right - (yAxisLabelWidth>defaultMargin.left?yAxisLabelWidth:defaultMargin.left));
  },[width,chartSvgRef,axis_left,axis_bottom])  

  const bardata = useMemo<BarLineData>(
    () => (isLoading ? mockBarLineChartData : _data),
    [isLoading, _data],
  );  

  const { xAxislabel, yAxisLeftLabel, yAxisRightLabel, chartData } = bardata;

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

  const filteredData = useMemo(
    () => data.filter((_, index) => !hideIndex.includes(index)),
    [data, hideIndex],
  );

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData[]>();

  const { xScale, yScale, y1Scale } = useChartScales({
    filteredData,
    innerWidth,
    drawableChartHeight,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedXscale = xScale as any;
  const typedYscale = yScale as any;

  const legendData = useMemo(() => {
    if (yAxisLeftLabel !== undefined && yAxisRightLabel !== undefined) {
      return [
        { label: yAxisLeftLabel, value: 0 },
        { label: yAxisRightLabel, value: 0 },
        ...data.map((d) => ({
          label: d.label || d.yAxisLeftLabel || '',
          value: d.value,
        })),
      ];
    } else {
      return data.map((d) => ({
        label: d.label || d.yAxisLeftLabel || '',
        value: d.value,
      }));
    }  
  }, [data, yAxisLeftLabel, yAxisRightLabel]);

  const colorScale = useMemo(() => {
    if (colors?.length) {
      return scaleOrdinal<string, string>({
        domain: filteredData.map((_, index) => index.toString()),
        range: colors,
      });
    }

    return scaleOrdinal<string, string>({
      domain: filteredData.map((_, index) => index.toString()),
      range: theme.colors.charts.bar,
    });
  }, [colors, filteredData, theme.colors.charts.bar]);

  const handleBarMouseMove = useCallback(
    (value: number, color: string, index: number) =>
      (event: React.MouseEvent) => {
        if (!isLoading) {
          if (chartData && chartData[index]){
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
          }else{
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
         
          }  
          setHoveredBar(index);
        }
      },
    [isLoading, filteredData, showTooltip, setHoveredBar],
  );

  const handleBarMouseLeave = useCallback(() => {
    if (!isLoading) {
      hideTooltip();
      setHoveredBar(null);
    }
  }, [isLoading, hideTooltip]);

  const wrapped = useCallback(
    (isWrapped: boolean) => {
      if (isWrapped && chartSvgRef.current && axis_bottom.current) {
        let legendheight = 0;
        if (legend_ref && legend_ref.current) {
          const currentLegend = (legend_ref.current as SVGGElement)
          if (currentLegend) {
            legendheight = currentLegend.getBBox().height;
          }
        }
        let axisheight = 0;
        if (axis_bottom && axis_bottom.current) {        
          axisheight = axis_bottom.current.getBBox().height
        }  
        const hgt =
          height - defaultMargin.top - defaultMargin.bottom - legendheight - axisheight + TICK_LABEL_PADDING;
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
      isLoading
    ],
  );

  const generatedLegendHeight =  (calculatedlegendHeight: number) => {
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
  }  
   // [legendsProps],
 // );

  const isLegendRendered = (renderedStatus: boolean) => {
      if (renderedStatus) {
        if (chartSvgRef && chartSvgRef.current){
          setLegendBoxWidth((chartSvgRef?.current?.querySelector("g") as SVGGElement).getBBox().width);
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
          setTopLegendPosition(moveY+10);
        }
        if (axis_left && axis_left.current) {
          setLegendLeft(axis_left.current.getBBox().x);
        }
      }
      let legendcalculatedHeight = 0;
      if (legend_ref && legend_ref.current && legendsProps?.isVisible) {
        if (legend_ref && legend_ref.current) {
          legendcalculatedHeight = legend_ref.current.getBBox().height;
        }
      }   
      let axisbottomheight:number = 0;
      if (axis_bottom && axis_bottom.current) {
        axisbottomheight = (axis_bottom.current as SVGGElement).getBBox().height;
      }    
      const hgt =
          height -
          defaultMargin.top -
          defaultMargin.bottom -
          legendcalculatedHeight -
          axisbottomheight
      setDrawableChartHeight(hgt);
  };

  const generateAxis = useCallback((selectedLegends: number[]) => {
    setRefreshAxis(selectedLegends.length);
  }, []);

  const transferBarList = (barsList: BarsList[]) => {
    console.log("bars1", barsList);
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

  if (!isLoading && (!_data || _data.length === 0)) {
    return <div>No data to display.</div>;
  }

  const {
    position = LegendPosition.BOTTOM,
    hovered = hoveredBar !== null && hoveredBar !== -1
      ? legendData?.[hoveredBar]?.label
      : null,
    setHovered = (label: string) => {
      const hoveredIndex = legendData?.findIndex(
        (item) => item.label === label,
      );
      setHoveredBar(
        hoveredIndex !== undefined && hoveredIndex !== -1 ? hoveredIndex : null,
      );
    },
  } = legendsProps || {};

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
      <svg
        ref={chartSvgRef}
        width="100%"
        height="100%"
      >
        {isLoading && <SvgShimmer />}
        <Group top={defaultMargin.top} left={yAxisLabelWidth>defaultMargin.left?yAxisLabelWidth:defaultMargin.left}>
          <g ref={overall_chart}>
            <g ref={axis_left}>
              <AxisManager.YAxis
                scale={typedYscale}
                isLoading={isLoading}
                {...yAxisProps}
              />
            </g>

            <Grid
              width={innerWidth}
              yScale={typedYscale}
              isLoading={isLoading}
              showHorizontal
              {...gridProps}
            />

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
              />
            </g>

            <BarRenderer
              filteredData={filteredData}
              xScale={typedXscale}
              yScale={typedYscale}
              colorScale={colorScale}
              hoveredBar={hoveredBar}
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
            />
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
              legendLeft={legendLeft}
              legendTopPosition={legendTopPosition}
              innerWidth={innerWidth}
              legendBoxHeight={legendHeight}
              calculatedLegendHeight={calculatedLegendHeight}
              legendBoxWidth={legendBoxWidth}
            />
          </g>
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default VerticalBarChart;
