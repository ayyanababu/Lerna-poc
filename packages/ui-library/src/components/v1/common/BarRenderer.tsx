import React, { useEffect, useMemo } from "react";

import CustomBar from "../../CustomBar";
import type { BarRendererProps } from "./BarRenderer.types";
import { BarsList } from "./types";

const DEFAULT_BAR_RADIUS = 4;

const BarRenderer: React.FC<BarRendererProps> = ({
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
  // Function to calculate optimal bar width
  const getOptimalBarWidth = (calculatedWidth: number) =>
    Math.min(calculatedWidth, maxBarWidth);

  // Store bar positions and widths for use by the X-axis component
  const barsList = useMemo<BarsList[]>(() => {
    return filteredData.map((d, index) => {
      const calculatedBarWidth = xScale.bandwidth();
      const barwidth = getOptimalBarWidth(calculatedBarWidth);

      let barX =
        barwidth < calculatedBarWidth
          ? (xScale(d.label) || 0) + (calculatedBarWidth - barwidth) / 2
          : xScale(d.label) || 0;

      if (index === 0) {
        barX -= baseAdjustWidth;
      } else if (index === filteredData.length - 1) {
        barX += baseAdjustWidth * 1.5;
      } else {
        barX += baseAdjustWidth / 2;
      }

      return {
        x: barX,
        width: barwidth,
        label: d.label,
      };
    });
  }, [filteredData, xScale, maxBarWidth, baseAdjustWidth]);

  useEffect(() => {
    if (transferBarList) {
      transferBarList(barsList);
    }
  }, [barsList]);

  return (
    <>
      {filteredData.map((d, index) => {
        const value = Number(d.value);
        if (Number.isNaN(value)) return null;

        const calculatedBarWidth = xScale.bandwidth();
        const barwidth = getOptimalBarWidth(calculatedBarWidth);

        // Calculate bar position
        let barX =
          barwidth < calculatedBarWidth
            ? (xScale(d.label) || 0) + (calculatedBarWidth - barwidth) / 2
            : xScale(d.label) || 0;

        if (index === 0) {
          barX -= baseAdjustWidth;
        } else if (index === filteredData.length - 1) {
          barX += baseAdjustWidth * 1.5;
        } else {
          barX += baseAdjustWidth / 2;
        }

        // Calculate bar dimensions
        const barHeight = drawableChartHeight - yScale(value);
        const barY = yScale(value);

        // Calculate visual properties
        const isHovered = hoveredBar === index;
        const barOpacity =
          hoveredBar !== null && hoveredBar !== -1 && !isHovered
            ? reducedOpacity
            : defaultOpacity;

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
    </>
  );
};

export default BarRenderer;
