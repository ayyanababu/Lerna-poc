import React, { useEffect, useMemo, useState } from "react";

import CustomBar from "../../CustomBar";
import type { BarRendererProps } from "./BarRenderer.types";
import { BarsList, DataPoint } from "./Data.types";

const DEFAULT_BAR_RADIUS = 4;
const ANIMATION_DURATION = 800; // animation duration in ms

const BarRenderer: React.FC<BarRendererProps> = ({
  filteredData,
  xScale,
  yScale,
  colorScale,
  hoveredBar,
  hoveredBarOther,
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
  chartProps,
}) => {
  // Function to calculate optimal bar width
  const getOptimalBarWidth = (calculatedWidth: number) =>
    Math.min(calculatedWidth, maxBarWidth ? maxBarWidth : 0);

  // Animation progress state (0 to 1)
  const [progress, setProgress] = useState(0);
  const [animationStarted, setAnimationStarted] = useState(false);

  // Store bar positions and widths for use by the X-axis component
  const barsList = useMemo<BarsList[]>(() => {
    return filteredData.map((d, index) => {
      const calculatedBarWidth = xScale.bandwidth();
      const barwidth = calculatedBarWidth;

      let barX =
        barwidth < calculatedBarWidth
          ? (xScale(d.xAxis) || 0) + (calculatedBarWidth - barwidth) / 2
          : xScale(d.xAxis) || 0;

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
        label: d.xAxis,
      };
    });
  }, [filteredData, xScale, maxBarWidth, baseAdjustWidth]);

  useEffect(() => {
    if (transferBarList) {
      transferBarList(barsList);
    }
  }, [barsList, transferBarList]);

  // Handle animation
  useEffect(() => {
    // Start animation after a delay
    if (isLoading) {
      return;
    }
    const timer = setTimeout(() => {
      setAnimationStarted(true);
      let startTime: number | null = null;
      const animate = (timestamp: number | null) => {
        if (!startTime) startTime = timestamp;

        let elapsed: number = 0;
        if (timestamp && startTime) {
          elapsed = timestamp - startTime;
        }
        const newProgress = Math.min(elapsed / ANIMATION_DURATION, 1);

        setProgress(newProgress);

        if (newProgress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, 50);

    // eslint-disable-next-line consistent-return
    return () => {
      clearTimeout(timer);
    };
  }, [isLoading]);

  return (
    <>
      {filteredData.map((d, index) => {
        const dataClicked: DataPoint = { label: d.xAxis, value: d.yAxisLeft };
        const value = Number(d.yAxisLeft);
        if (Number.isNaN(value)) return null;
        const calculatedBarWidth = xScale.bandwidth();
        const barwidth = getOptimalBarWidth(calculatedBarWidth);

        // Calculate bar position
        let barX =
          barwidth < calculatedBarWidth
            ? (xScale(d.xAxis) || 0) + (calculatedBarWidth - barwidth) / 2
            : xScale(d.xAxis) || 0;

        if (index === 0) {
          barX -= baseAdjustWidth;
        } else if (index === filteredData.length - 1) {
          barX += baseAdjustWidth * 1.5;
        } else {
          barX += baseAdjustWidth / 2;
        }

        // Calculate final bar dimensions
        const finalBarHeight = drawableChartHeight - yScale(value);
        const finalBarY = yScale(value);

        // Apply easing function for smoother animation (ease-out cubic)
        const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
        const easedProgress = easeOutCubic(progress);

        // Interpolate height and y position using custom linear interpolation
        const linearInterpolate = (start: number, end: number, t: number) =>
          start + (end - start) * t;

        let currentHeight;
        if (animationStarted) {
          currentHeight = linearInterpolate(0, finalBarHeight, easedProgress);
        } else if (isLoading) {
          currentHeight = finalBarHeight;
        } else {
          currentHeight = 0;
        }

        let currentY;
        if (animationStarted) {
          currentY = linearInterpolate(
            drawableChartHeight,
            finalBarY,
            easedProgress,
          );
        } else if (isLoading) {
          currentY = finalBarY;
        } else {
          currentY = drawableChartHeight;
        }

        // Calculate visual properties
        let barOpacity = 1;
        if (chartProps?.toUpperCase() === "BAR AND LINE") {
          const isHovered = hoveredBarOther === index;
          barOpacity =
            hoveredBar !== null && hoveredBar !== -1 && !isHovered
              ? reducedOpacity
              : defaultOpacity;
        } else {
          const isHovered = hoveredBar === index;
          barOpacity =
            hoveredBar !== null && hoveredBar !== -1 && !isHovered
              ? reducedOpacity
              : defaultOpacity;
        }

        const radius = Math.min(
          DEFAULT_BAR_RADIUS,
          barwidth / 2,
          currentHeight > 0 ? currentHeight : 0,
        );

        const barColor = d.barColor || colorScale(d.xAxis);

        return (
          <CustomBar
            key={`bar-${d.xAxis}`}
            x={barX}
            y={currentY}
            width={barwidth}
            height={currentHeight}
            fill={barColor}
            isLoading={isLoading}
            opacity={barOpacity}
            id={`bar_${chartProps}`}
            pathProps={{
              d: `
                M ${barX},${currentY + currentHeight}
                L ${barX + barwidth},${currentY + currentHeight}
                L ${barX + barwidth},${currentY + radius}
                Q ${barX + barwidth},${currentY} ${barX + barwidth - radius},${currentY}
                L ${barX + radius},${currentY}
                Q ${barX},${currentY} ${barX},${currentY + radius}
                L ${barX},${currentY + currentHeight}
                Z
              `,
            }}
            onMouseMove={handleBarMouseMove(value, barColor, index)}
            onMouseLeave={handleBarMouseLeave}
            {...barProps}
            onClick={(event) => {
              if (barProps?.onClick) barProps.onClick(event);
              if (onClick) onClick(event, dataClicked, index);
            }}
          />
        );
      })}
    </>
  );
};

export default BarRenderer;
