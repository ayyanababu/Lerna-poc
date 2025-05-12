import React from "react";

import XAxis from "../XAxis";
import { XAxisProps } from "../XAxis/types";
import YAxis from "../YAxis";
import { YAxisProps } from "../YAxis/types";

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
      {...props}
      key={refreshAxis}
      scale={scale}
      top={top}
      isLoading={isLoading}
      availableWidth={availableWidth}
      forceFullLabels={forceFullLabels}
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

const Y1AxisComponent: React.FC<YAxisProps> = ({
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
  Y1Axis:Y1AxisComponent
};

export default AxisManager;
