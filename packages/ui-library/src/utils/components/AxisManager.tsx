import React, { useState, useEffect } from 'react';
import XAxis from "../../components/RXAxis";
import YAxis from "../../components/RYAxis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { ScaleBand, ScaleLinear } from 'd3';

// Types
interface BarsList {
  x: number;
  width: number;
  label: string;
}

interface XAxisProps {
  scale: ScaleBand<string>;
  top: number;
  isLoading: boolean;
  availableWidth: number;
  forceFullLabels?: boolean;
  addGap: number;
  wrapped: (wrapped: boolean) => void;
  barWidth: number;
  refreshAxis: number;
  chartWidth: number;
  barsList?: BarsList[];
  [key: string]: any; // For additional props
}

interface YAxisProps {
  scale: ScaleLinear<number, number>;
  isLoading: boolean;
  [key: string]: any; // For additional props
}

// X-Axis Component
const XAxisComponent: React.FC<XAxisProps> = ({
  scale,
  top,
  isLoading,
  availableWidth,
  forceFullLabels = false,
  addGap,
  wrapped,
  barWidth,
  refreshAxis,
  chartWidth,
  barsList = [],
  ...props
}) => {
  const [localBarsList, setLocalBarsList] = useState<BarsList[]>([]);
  
  // Update the bars list when external data changes
  useEffect(() => {
    if (barsList && barsList.length > 0) {
      setLocalBarsList(barsList);
    }
  }, [barsList]);

  return (
    <XAxis
      key={refreshAxis}
      scale={scale}
      top={top}
      isLoading={isLoading}
      availableWidth={availableWidth}
      forceFullLabels={forceFullLabels}
      {...props}
      addGap={addGap}
      wrapped={wrapped}
      barWidth={barWidth}
      refreshAxis={refreshAxis}
      chartWidth={chartWidth}
      barsList={localBarsList}
    />
  );
};

// Y-Axis Component
const YAxisComponent: React.FC<YAxisProps> = ({
  scale,
  isLoading,
  ...props
}) => {
  return (
    <YAxis 
      scale={scale} 
      isLoading={isLoading} 
      {...props} 
    />
  );
};

// Export both axis components
const AxisManager = {
  XAxis: XAxisComponent,
  YAxis: YAxisComponent
};

export default AxisManager;
