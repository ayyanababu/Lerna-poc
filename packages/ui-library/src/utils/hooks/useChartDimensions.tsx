import { useState, useEffect, RefObject } from 'react';

interface ChartDimensionsProps {
  width: number;
  height: number;
  DEFAULT_MARGIN: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  chartSvgRef: RefObject<SVGSVGElement>;
  axis_bottom: RefObject<SVGGElement>;
  legend_ref: RefObject<SVGGElement>;
  overall_chart: RefObject<SVGGElement>;
}

const useChartDimensions = ({
  width,
  height,
  DEFAULT_MARGIN,
  chartSvgRef,
  axis_bottom,
  legend_ref,
  overall_chart,
}: ChartDimensionsProps) => {
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);
  const [drawableChartHeight, setDrawableChartHeight] = useState<number>(0);
  const [legendTopPosition, setTopLegendPosition] = useState<number>(0);
  const [legendLeft, setLegendLeft] = useState<number>(0);
  const [legendHeight, setLegendHeight] = useState<number>(0);
  const [legendBoxWidth, setLegendBoxWidth] = useState<number>(0);
  const [calculatedLegendHeight, setCalculatedLegendHeight] = useState<number>(0);
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(null);
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(null);
  
  // Calculate maxLabelWidth from y-axis labels
  useEffect(() => {
    if (!chartSvgRef.current) return;
    const nodes = chartSvgRef.current.querySelectorAll(".visx-axis-left text");
    const widths = Array.from(nodes).map(
      (node) => (node as SVGGraphicsElement).getBBox().width,
    );
    setMaxLabelWidth(Math.max(...widths, 0));
  }, [width, height, chartSvgRef]);
  
  // Calculate adjusted chart dimensions
  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;
    const svg = chartSvgRef.current;
    const bbox = svg.getBBox();
    
    let updatedHeight = Math.max(
      DEFAULT_MARGIN.top + bbox.height + DEFAULT_MARGIN.bottom,
      height,
    );
    
    const updatedWidth = Math.max(
      width,
      DEFAULT_MARGIN.left + (width - DEFAULT_MARGIN.right) + DEFAULT_MARGIN.right,
    );
    
    // Adjust for x-axis rotation if needed
    const axisx_rotate = false; // This could be parameterized
    if (axisx_rotate && chartSvgRef.current.querySelector(".visx-axis-bottom")) {
      updatedHeight = updatedHeight - (
        chartSvgRef.current.querySelector(".visx-axis-bottom") as SVGGElement
      ).getBBox().height;
    }
    
    updatedHeight = height + DEFAULT_MARGIN.top + DEFAULT_MARGIN.bottom;
    
    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [width, height, DEFAULT_MARGIN, chartSvgRef]);

  // Set initial drawable chart height
  useEffect(() => {
    setDrawableChartHeight(height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom);
  }, [height, DEFAULT_MARGIN]);
  
  return {
    maxLabelWidth,
    setMaxLabelWidth,
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
    setAdjustedChartWidth,
    adjustedChartHeight,
    setAdjustedChartHeight,
  };
};

export default useChartDimensions;
