import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleOrdinal } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";

import useTheme from "../../hooks/useTheme";
import ChartWrapper from "../ChartWrapper";
import Grid from "../Grid";
import SvgShimmer from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import mockVerticalBarChartData from "./mockdata";
import { DataPoint, VerticalBarChartProps } from "./types";
import { LegendPosition } from "../Legends/types";
import useChartDimensions from "../../utils/hooks/useChartDimensions";
import useChartScales from "../../utils/hooks/useChartScales";
import BarRenderer from "../../utils/components/BarRenderer";
import AxisManager from "../../utils/components/AxisManager";
import LegendManager from "../../utils/components/LegendManager";
import {BarsList} from '../../utils/components/types'


const DEFAULT_MARGIN = {
  top: 5,
  right: 60,
  bottom: 50,
  left: 25,
};

const DEFAULT_MAX_BAR_WIDTH = 16;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const TICK_LABEL_PADDING = 8;
const BASE_ADJUST_WIDTH = 5;

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
// eslint-disable-next-line prefer-const   
  let {
    parentRef,
    width = 100,
    height = 100,
  } = useParentSize({ debounceTime: 150 });

  if (!width){
      width = parentRef?.current?.offsetWidth ?? 0;
  }
  if (!height){
      height = parentRef?.current?.offsetHeight ?? 0;
  }

  const data = useMemo<DataPoint[]>(
    () => (isLoading ? mockVerticalBarChartData : _data),
    [isLoading, _data],
  );

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const axis_bottom = useRef<SVGGElement | null>(null);
  const axis_left = useRef<SVGGElement | null>(null);
  const overall_chart = useRef<SVGGElement | null>(null);
  const legend_ref = useRef<SVGGElement | null>(null);

  const [refreshAxis, setRefreshAxis] = useState(0);
  const [barList,setBarList] = useState<BarsList[]>([]);
  
  const {
    maxLabelWidth,
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
    DEFAULT_MARGIN,
    chartSvgRef,
    axis_bottom,
    legend_ref,
    overall_chart,
  });

  const yAxisLabelWidth = maxLabelWidth + TICK_LABEL_PADDING;
  const innerWidth = width - DEFAULT_MARGIN.right;

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

  useEffect(()=>{
    if (legendsProps){
      const { legendsHeight, scrollbarAfter } = legendsProps;
      if (legendsHeight && legendsHeight > 0 && scrollbarAfter && scrollbarAfter < 0 ){
        if (adjustedChartHeight){
          if (legendsHeight < 1){
              setLegendHeight(legendsHeight * adjustedChartHeight)
          }else{
              setLegendHeight(calculatedLegendHeight);
          }    
        }  
      }
    }
   },[chartSvgRef,axis_bottom.current,adjustedChartHeight,calculatedLegendHeight]);  

  const { xScale, yScale } = useChartScales({
    filteredData,
    innerWidth,
    drawableChartHeight,
  });

  // Create more explicitly typed local variables for scales
  const typedXScale = xScale as any;  // Using any temporarily to bypass type checking
  const typedYScale = yScale as any;  // Using any temporarily to bypass type checking

  const legendData = useMemo(
    () => data.map((d) => ({ label: d.label, value: d.value })),
    [data],
  );

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
    (value: number, color: string, index: number) => (event: React.MouseEvent) => {
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
    },
    [isLoading, filteredData, showTooltip, setHoveredBar]
  );

  const handleBarMouseLeave = useCallback(() => {
    if (!isLoading) {
      hideTooltip();
      setHoveredBar(null);
    }
  }, [isLoading, hideTooltip]);

  const wrapped = useCallback((wrapped: boolean) => {
    if (wrapped && chartSvgRef.current && axis_bottom.current) {
      const bottomaxisheight = axis_bottom.current.getBBox().height;

      let legendhgt = 0;
      if (legend_ref && legend_ref.current) {
        const currentLegendHeight = (legend_ref.current as SVGGElement).querySelector("div")?.querySelector("svg");
        if (currentLegendHeight) {  
          legendhgt = currentLegendHeight.getBBox().height;
        }  
      }

      const hgt = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom - legendhgt;
      setDrawableChartHeight(hgt); 

      let moveY = 0;
      if (overall_chart && overall_chart.current) {
        moveY = overall_chart.current.getBBox().height;
        setTopLegendPosition(moveY - DEFAULT_MARGIN.bottom);
      }
    }
  }, [chartSvgRef, axis_bottom, legend_ref, height, setDrawableChartHeight, setTopLegendPosition]);

  const generatedLegendHeight = useCallback((calculatedlegendHeight: number) => {
    if (legendsProps) {
      setCalculatedLegendHeight(calculatedlegendHeight)
      if (legendHeight > 0) {
        return;
      }
      const { scrollbarAfter, eachLegendGap } = legendsProps;
      if (typeof scrollbarAfter === 'number' && typeof eachLegendGap === 'number') {
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
  }, [legendsProps]);

  const isLegendRendered = useCallback((renderedStatus: boolean) => {
    if (renderedStatus) {
      setLegendBoxWidth(innerWidth + DEFAULT_MARGIN.right);
      const axisBottom = chartSvgRef?.current?.querySelector(".visx-axis-bottom") as SVGGElement;
      let moveY = 0;
      if (axisBottom) {
        const axisBottomBBox = axisBottom.getBBox();
        if (axisBottom && axisBottom.getAttribute("transform")) {
          const transform = axisBottom.getAttribute("transform");
          if (transform) {
            const translateY = parseFloat(transform.split("translate(")[1].split(",")[1]);
            moveY = translateY + axisBottomBBox.y + axisBottomBBox.height;
          }
        } else {
          moveY = +axisBottomBBox.y + axisBottomBBox.height;
        }
        setTopLegendPosition(moveY);
      }
      const axisLeft = chartSvgRef?.current?.querySelector(".visx-axis-left") as SVGGElement;
      if (axisLeft) {
        setLegendLeft(axisLeft.getBBox().x + 10);
      }
    }
    
    if (legend_ref && legend_ref.current && legendsProps?.isVisible) {
      let bottomaxisheight = 0;
      if (axis_bottom && axis_bottom.current) {
         bottomaxisheight = axis_bottom.current.getBBox().height;
      }
      let legendHeight = 0;
      if (legend_ref && legend_ref.current) {
         legendHeight = legend_ref.current.getBBox().height;
      }
      const hgt = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom - legendHeight;
      setDrawableChartHeight(hgt);
    }
  }, [chartSvgRef, height, innerWidth, setLegendBoxWidth, setTopLegendPosition, setLegendLeft, setDrawableChartHeight]);

  const generateAxis = useCallback((selectedLegends: number[]) => {
    setRefreshAxis(selectedLegends.length);
  }, []);

 
   const TransferBarList = ((barList:BarsList[]) =>{
      setBarList(barList);
      setRefreshAxis(barList.length)
   })
  
   if (!isLoading && (!_data || _data.length === 0)) {
    return <div>No data to display.</div>;
  }

  const {
    position = LegendPosition.BOTTOM,
    hovered = hoveredBar !== null && hoveredBar !== -1 ? legendData?.[hoveredBar]?.label : null,
    setHovered = (label: string) => {
      const hoveredIndex = legendData?.findIndex(
        (item) => item.label === label,
      );
      setHoveredBar(hoveredIndex !== undefined && hoveredIndex !== -1 ? hoveredIndex : null);
    }
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
        width={adjustedChartWidth || width}
        height={adjustedChartHeight || height}
      >
        {isLoading && <SvgShimmer />}
        <Group top={DEFAULT_MARGIN.top} left={yAxisLabelWidth}>
          <g ref={overall_chart}>
            <g ref={axis_left}>
              <AxisManager.YAxis 
                scale={typedYScale} 
                isLoading={isLoading} 
                {...yAxisProps} 
              />
            </g>
            
            <Grid
              width={innerWidth}
              yScale={typedYScale}
              isLoading={isLoading}
              showHorizontal
              {...gridProps}
            />
            
            <g ref={axis_bottom}>
              <AxisManager.XAxis
                key={refreshAxis}
                scale={typedXScale}
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
              xScale={typedXScale}
              yScale={typedYScale}
              colorScale={colorScale}
              hoveredBar={hoveredBar}
              isLoading={isLoading}
              maxBarWidth={maxBarWidth}
              drawableChartHeight={drawableChartHeight}
              handleBarMouseMove={handleBarMouseMove}
              handleBarMouseLeave={handleBarMouseLeave}
              DEFAULT_OPACITY={DEFAULT_OPACITY}
              REDUCED_OPACITY={REDUCED_OPACITY}
              BASE_ADJUST_WIDTH={BASE_ADJUST_WIDTH}
              barProps={barProps}
              onClick={onClick}
              TransferBarList={TransferBarList}
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
              legendHeight={legendHeight}
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