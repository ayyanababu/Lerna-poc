import { RefObject, useEffect, useState } from "react";

interface ChartDimensionsProps {
  width: number;
  height: number;
  defaultMargin: {
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
  defaultMargin,
  chartSvgRef,
}: ChartDimensionsProps) => {
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(60);
  const [drawableChartHeight, setDrawableChartHeight] = useState<number>(0);
  const [legendTopPosition, setTopLegendPosition] = useState<number>(0);
  const [legendLeft, setLegendLeft] = useState<number>(0);
  const [legendHeight, setLegendHeight] = useState<number>(0);
  const [legendBoxWidth, setLegendBoxWidth] = useState<number>(0);
  const [calculatedLegendHeight, setCalculatedLegendHeight] =
    useState<number>(0);
  const [adjustedChartWidth, setAdjustedChartWidth] = useState<number | null>(
    null,
  );
  const [adjustedChartHeight, setAdjustedChartHeight] = useState<number | null>(
    null,
  );


  // Calculate adjusted chart dimensions
  useEffect(() => {
    if (!chartSvgRef.current || !width || !height) return;
  //  const svg = chartSvgRef.current;
  //  const bbox = svg.getBBox();

    let updatedHeight = height - defaultMargin.top  - defaultMargin.bottom;

    const updatedWidth =  width - defaultMargin.left - defaultMargin.right;

    setAdjustedChartHeight(updatedHeight);
    setAdjustedChartWidth(updatedWidth);
  }, [width, height, defaultMargin, chartSvgRef]);

  // Set initial drawable chart height
  useEffect(() => {
    setDrawableChartHeight(height - defaultMargin.top - defaultMargin.bottom);
  }, [height, defaultMargin]);

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
