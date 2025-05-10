import React from "react";
import { ScaleBand, ScaleLinear } from "d3";

import XAxis from "../RXAxis";
import YAxis from "../RYAxis";

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
      barsList={barsList}
    />
  );
};

// Y-Axis Component
const YAxisComponent: React.FC<YAxisProps> = ({
  scale,
  isLoading,
  ...props
}) => {
  return <YAxis scale={scale} isLoading={isLoading} {...props} />;
};

// Export both axis components
const AxisManager = {
  XAxis: XAxisComponent,
  YAxis: YAxisComponent,
};

export default AxisManager;
