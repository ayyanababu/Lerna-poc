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
  axisBottom: RefObject<SVGGElement>;
  legendRef: RefObject<SVGGElement>;
  overallChart: RefObject<SVGGElement>;
}

const useChartDimensions = ({
  height,
  defaultMargin,
}: ChartDimensionsProps) => {
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

  // Set initial drawable chart height
  useEffect(() => {
    setDrawableChartHeight(height - defaultMargin.top - defaultMargin.bottom);
  }, [height, defaultMargin]);

  return {
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
