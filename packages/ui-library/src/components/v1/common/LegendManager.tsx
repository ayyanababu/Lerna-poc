import React from "react";

import Legends from "../Legends";
import { LegendManagerProps } from "./LegendManager.types";

const LegendManager: React.FC<LegendManagerProps> = ({
  legendsProps,
  position,
  legendData,
  colorScale,
  hideIndex,
  setHideIndex,
  hovered,
  setHovered,
  isLoading,
  isLegendRendered,
  generatedLegendHeight,
  generateAxis,
  legendLeft,
  legendTopPosition,
  legendBoxHeight,
  calculatedLegendHeight,
  legendBoxWidth,
  chart
}) => {
  // Only render the legend if it's visible in props
  if (!legendsProps?.isVisible) {
    return null;
  }
  console.log("hoveringed",hovered);
  return (
    <foreignObject
      x={`${legendLeft}`}
      y={`${legendTopPosition}`}
      width={`${legendBoxWidth}`}
      height={legendBoxHeight}
    >
      {React.createElement(
        "div",
        {
          xmlns: "http://www.w3.org/1999/xhtml",
          style: {
            width: "100%",
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
          },
        },
        <svg
          style={{ width: "100%", height: `${calculatedLegendHeight - 5}px` }}
        >
          <Legends
            {...legendsProps}
            position={position}
            colorScale={colorScale}
            data={legendData}
            hideIndex={hideIndex}
            hovered={hovered}
            setHideIndex={setHideIndex}
            isLoading={isLoading}
            setHovered={setHovered}
            isLegendRendered={isLegendRendered}
            eachLegendGap={legendsProps?.eachLegendGap}
            scrollbarAfter={legendsProps?.scrollbarAfter}
            generatedLegendHeight={generatedLegendHeight}
            generateAxis={generateAxis}
            legendBoxWidth={legendBoxWidth}
            chart={chart}
          />
        </svg>,
      )}
    </foreignObject>
  );
};

export default LegendManager;
