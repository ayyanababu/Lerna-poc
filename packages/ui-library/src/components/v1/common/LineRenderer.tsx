import React, { useEffect, useMemo } from "react";
import { curveLinear } from "@visx/curve";
import type { LneRendererProps } from "./LineRenderer.types";

const LineRenderer: React.FC<LineRendererProps> = ({
  filteredData,
  xScale,
  yScale,
  colorScale,
  hoveredBar,
  isLoading,
  maxBarWidth,
  drawableChartHeight,
  handleBarMouseMove,
  handleBarMouseLeave,
  defaultOpacity,
  reducedOpacity,
  baseAdjustWidth,
  barProps,
  onClick,
  transferBarList,
}) => {

}  
export default LineRenderer;