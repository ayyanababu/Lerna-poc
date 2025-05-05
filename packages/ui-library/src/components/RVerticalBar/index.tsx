
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";

import useTheme from "../../hooks/useTheme";
import ChartWrapper from "../ChartWrapper";
import CustomBar from "../CustomBar";
import Grid from "../Grid";
import SvgShimmer from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import XAxis from "../RXAxis";
import YAxis from "../RYAxis";
import mockVerticalBarChartData from "./mockdata";
import { DataPoint, VerticalBarChartProps } from "./types";
import Legends from '../RLegends'
import { LegendPosition } from "../Legends/types";


const DEFAULT_MARGIN = {
  top: 5,
  right: 75,
  bottom: 50,
  left: 25,
};

const DEFAULT_MAX_BAR_WIDTH = 16;
const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.02;
const TRUNCATE_RATIO = 0.5;
const TICK_LABEL_PADDING = 8;
const AXISX_ROTATE = false;
const AXISY_ROTATE = true;
const BASE_ADJUST_WIDTH = 5; // used to fix the check width for the overlap of xaxis
const ADD_ADJUST_WIDTH = 0; // used to check the overlap of xaxis
const BASE_ADJUST_HEIGHT = 5; // used to fix the check width for the overlap of yaxis
const ADD_ADJUST_HEIGHT = 0; // used to check the overlap of yaxis
const bottomHeightAddOnSpace = 0;
const titleHeightAddOnSpace = 0;
const truncatedLabelSuffix = "..";
const activatesizing = false;
const nodenametocheck = "SVG";
const eachLegendGap = 23;
const legendScrollingAfer = 3;

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
  const innerWidth = width  - DEFAULT_MARGIN.right;
  const [drawableChartHeight, setdrawableChartHeight] = useState(height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom);
//  const [innerHeight, setinnerHeight] = useState(
//    height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom,
//  );
  const [Wrapped, setWrapped] = useState(false);
  const [recalculate,setRecalculate] = useState(true);
  const [legendPosition,setLegendPosition] = useState(0);
  const legend_ref = useRef<SVGGElement | null>(null)
  const bar_ref = useRef<SVGGElement | null>(null)
  const overall_chart = useRef<SVGGElement | null>(null)
  const [legendLeft,setLegendLeft] = useState(0)
  const [legendsHeight,setLegendsHeight] = useState(0)
  const [refreshAxis,setrefreshAxis] = useState(0);
  const rotateincrease = 0;
  const [legendBoxWidth,setlegendBoxWidth] = useState(0);
  let barwidth = 0;


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

//  useEffect(() => {
//    console.log("inner", innerHeight);
//    setdrawableChartHeight(innerHeight);
 // }, [innerHeight]);

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
        range: [drawableChartHeight, 0],
        nice: true,
      }),
    [drawableChartHeight, maxValue],
  );
console.log("domain",xScale.domain())
  const legendData = useMemo(
    () => data.map((d) => ({ label: d.label, value: d.value })),
    [data],
  );


  const colorScale: ReturnType<typeof scaleOrdinal<string, string>> = useMemo(() => {
    if (colors?.length) {
      return scaleOrdinal<string, string>({
        domain: filteredData.map((_, index) => index.toString()), // Domain based on index
        range: colors, // Ensure colors is a string[]
      });
    }

    return scaleOrdinal<string, string>({
      domain: filteredData.map((_, index) => index.toString()), // Domain based on index
      range: theme.colors.charts.bar, // Ensure this is a string[]
    });
  }, [colors, filteredData, theme.colors.charts.bar]);

 // let sl = scaleOrdinal({
//    domain: legendData.map((d) => d.label),
//    range: filteredData.map((_, i) => colorScale(i))
//  });


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
    updatedHeight = height + DEFAULT_MARGIN.top + DEFAULT_MARGIN.bottom;
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
    return;
  };

  const truncateYAxis = (
    textNodes: SVGTextElement[],
    usedRects: { y1: number; y2: number }[],
    axisadded: { [key: number]: boolean },
    centeronly: boolean,
  ) => {
    return;
  };

  useEffect(() => {
    return;
  }, [xScale, axis_bottom.current, AXISX_ROTATE, hoveredBar]);

  useEffect(() => {
    return;
  }, [yScale, axis_left.current]);

  const rotated = (rotate: boolean) => {
    return;
  };

  const wrapped = useCallback((wrapped: boolean) => {
    if (wrapped && chartSvgRef.current && axis_bottom.current) {
      setWrapped(wrapped);
      setRecalculate(true);

      const bottomaxisheight = axis_bottom.current.getBBox().height;

      let legendHeight = 0;
      if (legend_ref && legend_ref.current) {
        legendHeight = legend_ref.current.getBBox().height;
        console.log("lheight", legendHeight);
      }

      const hgt =
        height -
        DEFAULT_MARGIN.top -
        DEFAULT_MARGIN.bottom
        - legendHeight
        console.log("hgt2",hgt)
      setdrawableChartHeight(hgt); // Uncomment if needed

      let moveY = 0;

      if (overall_chart && overall_chart.current) {
        console.log("bbox",overall_chart.current.getBBox())
        moveY = overall_chart.current.getBBox().height;
        setLegendPosition(moveY - DEFAULT_MARGIN.bottom);
      }
    }
  }, [
    chartSvgRef,
    axis_bottom,
    legend_ref,
    height,
    setWrapped,
    setRecalculate,
    setLegendPosition,
  ]);

  const generatedLegendHeight = useCallback((calculatedLegendHeight: number) => {
    if (legendsProps) {
      const { scrollbarAfter, eachLegendGap } = legendsProps;
      console.log("each",scrollbarAfter)
      if (typeof scrollbarAfter === 'number' && typeof eachLegendGap === 'number') {
        if (scrollbarAfter < 0) {
            setLegendsHeight(calculatedLegendHeight);
        } else {
          setLegendsHeight(scrollbarAfter * eachLegendGap );
        }
      } else {
        if (scrollbarAfter && scrollbarAfter < 0){
          setLegendsHeight(calculatedLegendHeight);
        }
      }
    }
  }, [legendsProps, setLegendsHeight]);

  const isLegendRendered = useCallback((renderedStatus: boolean) => {
    if (renderedStatus) {
      setlegendBoxWidth(innerWidth - 20);
      const axisBottom = chartSvgRef?.current?.querySelector(".visx-axis-bottom") as SVGGElement;
      let moveY = 0;
      if (axisBottom) {
        const axisBottomBBox = axisBottom.getBBox();
        if (axisBottom && axisBottom.getAttribute("transform")){
          const transform = axisBottom.getAttribute("transform");
          if (transform) {
            const translateY = parseFloat(transform.split("translate(")[1].split(",")[1]);
            moveY = translateY + axisBottomBBox.y + axisBottomBBox.height;
          }
        } else {
          moveY = +axisBottomBBox.y + axisBottomBBox.height;
        }
        setLegendPosition(moveY);
      }
      const axisLeft = chartSvgRef?.current?.querySelector(".visx-axis-left") as SVGGElement;
      if (axisLeft) {
        setLegendLeft(axisLeft.getBBox().x+10)
      }
    }
    if (legend_ref && legend_ref.current && legendsProps?.isVisible){
      let bottomaxisheight = 0;
      if (axis_bottom && axis_bottom.current){
         bottomaxisheight = axis_bottom.current.getBBox().height;
      }
      let legendHeight = 0;
      if (legend_ref && legend_ref.current){
         legendHeight = legend_ref?.current?.getBBox().height
      }
      console.log("legend",legendHeight)
      const hgt =
        height -
        DEFAULT_MARGIN.top -
        DEFAULT_MARGIN.bottom
 //       bottomaxisheight
//          -bottomHeight
        - legendHeight
      console.log("hgt1",hgt)
      setdrawableChartHeight(hgt);
    }
  }, [chartSvgRef, setLegendPosition,axis_bottom.current,XAxis]);

  if (!isLoading && (!_data || _data.length === 0)) {
    return <div>No data to display.</div>;
  }

  const {
    position = LegendPosition.BOTTOM,
    hovered = hoveredBar !== null && hoveredBar !== -1 ? legendData?.[hoveredBar]?.label : null,
    setHovered = (label) => {
      console.log("hovered");
      console.log(label);
      const hoveredIndex = legendData?.findIndex(
        (item) => item.label === label,
      );
      hoveredIndex !== null ? hoveredIndex : null
      setHoveredBar(hoveredIndex !== null && hoveredIndex !== -1 ? hoveredIndex : null);
    }
 } = legendsProps || {};

 const generateAxis = useCallback((selectedLegends: number[]) => {
    if (selectedLegends && selectedLegends.length > 0){
      setrefreshAxis(selectedLegends.length)
    }else{
      setrefreshAxis(selectedLegends.length)
    }
 }, [chartSvgRef, setLegendPosition,axis_bottom.current,XAxis]);

 useEffect(()=>{
   if (legendsProps){
     const { legendsHeight, scrollbarAfter } = legendsProps;
     if (legendsHeight && legendsHeight !== 0 && scrollbarAfter && scrollbarAfter < 0 ){
       setLegendsHeight(legendsHeight * drawableChartHeight)
     }
   }
  },[]);


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
              key={refreshAxis}
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
              refreshAxis={refreshAxis}
            />
          </g>
          <g ref = {bar_ref}>
          {filteredData.map((d, index) => {
            const value = Number(d.value);
            if (Number.isNaN(value)) return null;
            console.log("valx",value)
            const calculatedBarWidth = xScale.bandwidth();
            barwidth = getOptimalBarWidth(calculatedBarWidth);
            console.log(barwidth);
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
              hoveredBar !== null && hoveredBar !== -1  && !isHovered
                ? REDUCED_OPACITY
                : DEFAULT_OPACITY;
             console.log("bopac",barOpacity)
            const radius = Math.min(
              DEFAULT_BAR_RADIUS,
              barwidth / 2,
              barHeight > 0 ? barHeight : 0,
            );
            const barColor = d.color || colorScale(index.toString());

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
          </g>
          </g>
          <g  ref={legend_ref}>
             {legendsProps?.isVisible?
             <foreignObject x={`${legendLeft}`} y={`${legendPosition + 20}`} width={`${innerWidth+DEFAULT_MARGIN.right}`} height={legendsHeight}>
             {
              React.createElement('div', {
                xmlns: 'http://www.w3.org/1999/xhtml',
                style: { width: '100%', height: '100%' , overflowY:"auto", overflowX:"hidden" }
              }, <svg style = {{width:"100%",height:`${Number(legendsHeight) * 1.1 + DEFAULT_MARGIN.bottom}px`}}>
                   <Legends
                     {...legendsProps}
                     position={position}
                     colorScale={colorScale}
                     data={legendData}
                     hideIndex = {hideIndex}
                     hovered ={hovered}
                     setHideIndex = {setHideIndex}
                     isLoading={isLoading}
                     setHovered={setHovered}
                     isLegendRendered={isLegendRendered}
                     eachLegendGap={legendsProps?.eachLegendGap}
                     scrollbarAfter={legendsProps?.scrollbarAfter}
                     generatedLegendHeight={generatedLegendHeight}
                     generateAxis={generateAxis}
                     legendBoxWidth={legendBoxWidth}
                   />
                 </svg>
              )}
            </foreignObject>:''}
           </g>
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default VerticalBarChart;
