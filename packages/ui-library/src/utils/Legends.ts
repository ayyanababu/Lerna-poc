import { useState, useCallback, useRef, useEffect } from 'react';

interface LegendsProps {
  scrollbarAfter?: number;
  eachLegendGap?: number;
  isVisible?: boolean;
}

interface Margins {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface UseLegendProps {
  legendsProps?: LegendsProps;
  innerWidth?: number;
  height?: number;
  chartSvgRef?: React.RefObject<SVGSVGElement>;
  legend_ref?: React.RefObject<SVGElement>;
  margin?: Margins;
  axisBottomRef?: React.RefObject<SVGSVGElement>;
  xAxisConfig?: Record<string, any>;
}

/**
 * Custom hook for legend management in chart components
 * Can be used directly in any component without additional state sharing mechanisms
 */
export const useLegend = ({
  legendsProps,
  innerWidth = 600,
  height = 400,
  chartSvgRef: externalChartSvgRef,
  legend_ref: externalLegendRef,
  margin: externalMargin,
  axisBottomRef: externalAxisBottomRef,
  xAxisConfig = {}
}: UseLegendProps = {}) => {
  // Create internal refs if external ones aren't provided
  const internalChartSvgRef = useRef<SVGSVGElement>(null);
  const internalLegendRef = useRef<SVGElement>(null);
  const internalAxisBottomRef = useRef<SVGSVGElement>(null);
  
  // Use provided refs or fallback to internal ones
  const chartSvgRef = externalChartSvgRef || internalChartSvgRef;
  const legendRef = externalLegendRef || internalLegendRef;
  const axisBottomRef = externalAxisBottomRef || internalAxisBottomRef;
  
  // Default margin if not provided
  const DEFAULT_MARGIN: Margins = externalMargin || {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };

  // State variables
  const [le_legendHeight, setle_LegendHeight] = useState<number>(0);
  const [le_legendTopPosition, setle_LegendTopPosition] = useState<number>(0);
  const [le_legendLeft, setle_LegendLeft] = useState<number>(0);
  const [le_drawableChartHeight, setle_DrawableChartHeight] = useState<number>(0);
  const [le_calculatedLegendHeight, setle_CalculatedLegendHeight] = useState<number>(0);
  const [le_legendBoxWidth, setle_LegendBoxWidth] = useState<number>(0);
  const [le_legendRenderedStatus, setle_LegendRenderedStatus] = useState<boolean>(false);

  // Calculate legend height based on legendProps
  const generatedLegendHeight = (calculatedHeight: number) => {
    if (!legendsProps) return;
    setle_CalculatedLegendHeight(calculatedHeight);
   // if (le_legendHeight > 0) return;
    
    const { scrollbarAfter, eachLegendGap } = legendsProps;
    
    if (typeof scrollbarAfter === 'number') {
      if (scrollbarAfter < 0) {
        setle_LegendHeight(calculatedHeight);
      } else if (typeof eachLegendGap === 'number') {
        setle_LegendHeight(scrollbarAfter * eachLegendGap);
      }
    } else if (scrollbarAfter && scrollbarAfter < 0) {
      setle_LegendHeight(calculatedHeight);
    }
  };

  // Handle the legend rendering
  const isLegendRendered = (renderedStatus: boolean) => {
    setle_LegendRenderedStatus(renderedStatus);
    if (!renderedStatus) return;

    // Set legend box width
    setle_LegendBoxWidth(innerWidth);
    
    // Calculate legend position based on axis
    console.log(chartSvgRef)
    const axisBottom = chartSvgRef?.current?.querySelector(".visx-axis-bottom") as SVGGElement;
    console.log("axis bot",axisBottom)
    if (axisBottom) {
      let moveY = 0;
      const axisBottomBBox = axisBottom.getBBox();
      
      const transform = axisBottom.getAttribute("transform");
      if (transform) {
        const translateY = parseFloat(transform.split("translate(")[1].split(",")[1]);
        moveY = translateY + axisBottomBBox.y + axisBottomBBox.height;
      } else {
        moveY = axisBottomBBox.y + axisBottomBBox.height;
      }
      console.log("move",moveY)
      setle_LegendTopPosition(moveY);
    }
    
    // Calculate legend left position
    const axisLeft = chartSvgRef?.current?.querySelector(".visx-axis-left") as SVGGElement;
    if (axisLeft) {
      setle_LegendLeft(axisLeft.getBBox().x + 10);
    }
    
    // Calculate drawable chart height
    if (legendRef?.current && legendsProps?.isVisible && le_legendRenderedStatus) {
      const currentLegendHeight = (legendRef.current as SVGGElement).getBoundingClientRect().height;
      if (currentLegendHeight){
        const calculatedHeight = height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom - currentLegendHeight;
        if (calculatedHeight != le_drawableChartHeight){
          console.log(height);
          console.log(legendRef);
          console.log(currentLegendHeight)
          console.log("calc hgt", calculatedHeight)
          setle_DrawableChartHeight(calculatedHeight);
        }   
      }  
    }
  };



  return {
    // State values
    le_calculatedLegendHeight,
    le_drawableChartHeight,
    le_legendTopPosition,
    le_legendLeft,
    le_legendHeight,
    le_legendBoxWidth,
    
    // Functions
    generatedLegendHeight,
    isLegendRendered,
    
    // Refs for external use
    chartSvgRef,
    legendRef,
    axisBottomRef
  };
};