import React, { useEffect, useRef, useState } from "react";
import { curveLinear } from "@visx/curve";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";

import { shimmerGradientId } from "../../Shimmer/SvgShimmer";
import AxisManager from "../common/AxisManager";
import type { LineRendererProps } from "./LineRenderer.types";
import { DataPoint,BarLineData } from "./Data.types";

const ANIMATION_DURATION = 800; // animation duration in ms

const LineRenderer: React.FC<LineRendererProps> = ({
  data,
  xScale,
  y1Scale,
  circleRadius,
  defaultOpacity,
  reducedOpacity,
  y1AxisProps,
  getAxisRight,
  xOffset,
  hideIndex,
  setHideIndex,
  isLoading,
  yAxisRightLabel,
  hoveredLine,
  rightPosition,
  lineColor,
  hideTicks,
  hideAxisLine,
  label,
  handleLineMouseMove,
  handleLineMouseLeave,
  onLineClick,
  onPointClick
}) => {
  const axis_right = useRef<SVGGElement | null>(null);

  // Animation states
  const [progress, setProgress] = useState(0);
  const [animationStarted, setAnimationStarted] = useState(false);

  // Prepare animated data - this is the key change for smoother animation
  const getAnimatedPathData = () => {
    if (!animationStarted || !data?.chartData?.length) {
      return [];
    }

    // Apply easing function for smoother animation (ease-out cubic)
    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
    const easedProgress = easeOutCubic(progress);

    if (easedProgress >= 1) {
      return data.chartData;
    }

    // If we have less than 2 points, can't animate smoothly
    if (data.chartData.length < 2) {
      return progress > 0.5 ? data.chartData : [];
    }

    // Create a smoothly interpolated path by including all points
    // but adjusting the final point's position
    const result = [...data.chartData];

    // Find the segment where the animation should currently be
    const totalDistance = data.chartData.length - 1; // Total segments
    const currentSegmentPosition = easedProgress * totalDistance;
    const currentSegmentIndex = Math.floor(currentSegmentPosition);
    const segmentProgress = currentSegmentPosition - currentSegmentIndex;

    // Keep all points up to the current segment
    const visiblePoints = currentSegmentIndex + 1;

    // For the last visible point, interpolate its position if needed
    if (
      currentSegmentIndex < data.chartData.length - 1 &&
      segmentProgress > 0
    ) {
      // Get the next point that we're animating toward
      const nextPoint = data.chartData[currentSegmentIndex + 1];
      const currentPoint = data.chartData[currentSegmentIndex];
      let cyar:number = 0;
      if (currentPoint && currentPoint.yAxisRight){
        cyar = currentPoint.yAxisRight
      }else{
        cyar = 0;
      }
      let nyar:number|undefined = 0;
      if (nextPoint && nextPoint.yAxisRight){
        nyar = nextPoint.yAxisRight;
      }
      let yaxisright = cyar +
          (nyar - cyar) * segmentProgress
      // Create interpolated point
      const interpolatedPoint = {
        ...currentPoint,
        yAxisRight:
          cyar +
          (nyar - cyar) * segmentProgress,
        xAxis: currentPoint.xAxis, // Keep x the same to avoid visual glitches
      };

      // Return all points up to current segment plus the interpolated point
      return [...data.chartData.slice(0, visiblePoints), interpolatedPoint];
    }

    // Otherwise just return the visible points
    return data.chartData.slice(0, visiblePoints + 1);
  };

  // Get current circle radius based on animation progress
  const getCurrentRadius = () => {
    if (!animationStarted) return 0;

    // Apply easing function
    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
    const easedProgress = easeOutCubic(progress);

    return circleRadius * easedProgress;
  };

  // Handle animation
  useEffect(() => {
    // Start animation after a delay
    const timer = setTimeout(() => {
      setAnimationStarted(true);

      // Start time for the animation
      let startTime: number | null = null;

      // Animation frame function
      const animate = (timestamp: number | null) => {
        if (!startTime) startTime = timestamp;

        // Calculate progress based on elapsed time
        let elapsed: number = 0;
        if (timestamp && startTime) {
          elapsed = timestamp - startTime;
        }
        const newProgress = Math.min(elapsed / ANIMATION_DURATION, 1);

        setProgress(newProgress);

        // Continue animation if not complete
        if (newProgress < 1) {
          requestAnimationFrame(animate);
        }
      };

      // Start the animation
      requestAnimationFrame(animate);
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (axis_right.current) {
      getAxisRight(axis_right.current.getBBox().width);
    }
  }, [axis_right.current, isLoading, data, xScale]);

  const renderCircles = (circleRadius:number) => {
    if (!animationStarted || !data?.chartData?.length) {
      return null;
    }

    // Apply easing function for smoother animation (ease-out cubic)
    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
    const easedProgress = easeOutCubic(progress);

    // Get full number of points to show (including partial segment)
    const totalDistance = data.chartData.length - 1; // Total segments
    const currentSegmentPosition = easedProgress * totalDistance;
    const currentSegmentIndex = Math.floor(currentSegmentPosition);

    // Only render circles for points that should be fully visible
    return data.chartData.slice(0, currentSegmentIndex + 1).map((d, index) => {
      // Calculate per-circle animation for a staggered effect
      const circleDelay = 0.1; // Delay between circle animations (in progress units)
      const dataClicked: DataPoint = { label: d.xAxis, value: d.yAxisLeft };      
      const circleProgress = Math.min(
        1,
        Math.max(
          0,
          (easedProgress - index * circleDelay) / (1 - index * circleDelay),
        ),
      );
      const circleEasedProgress = easeOutCubic(circleProgress);
      const pointRadius = circleRadius * circleEasedProgress;
      return (
        <circle
          key={`circle-${index}`}
          r={pointRadius}
          cx={
            (xScale(d.xAxis) ?? 0) + circleRadius * 2 + (xOffset ? xOffset : 0)
          }
          cy={y1Scale(d && d.yAxisRight?d.yAxisRight:0)}
          fill={isLoading ? `url(#${shimmerGradientId})` : lineColor}
          opacity={
            hoveredLine && hoveredLine !== yAxisRightLabel
              ? reducedOpacity
              : defaultOpacity
          }
          onMouseEnter={handleLineMouseMove(d.yAxisRight,lineColor,index)}          
          onMouseLeave={handleLineMouseLeave}   
          onClick={(event) => {
            if (onPointClick) onPointClick(event, dataClicked, index);
          }}               
        />
      );
    });
  };

  // Get the animated data
  const animatedData = getAnimatedPathData();
  const currentRadius = getCurrentRadius();
  const dataClicked:BarLineData = data;
  return (
    <Group>
      <>
        <g ref={axis_right}>
          <AxisManager.Y1Axis
            scale={y1Scale}
            isLoading={isLoading}
            isRightYAxis
            left={rightPosition}
            {...y1AxisProps}
            hideTicks={hideTicks}
            hideAxisLine={hideAxisLine}
            label={label}
          />
        </g>

        {/* Render line with animated data */}
        <LinePath
          curve={curveLinear}
          data={animatedData}
          x={(d) =>
            (xScale(d.xAxis) ?? 0) + circleRadius * 2 + (xOffset ? xOffset : 0)
          }
          y={(d) => y1Scale(d.yAxisRight?d.yAxisRight:0)}
          strokeWidth={2}
          strokeOpacity={
            hoveredLine && hoveredLine !== yAxisRightLabel
              ? reducedOpacity
              : defaultOpacity
          }
          stroke={isLoading ? `url(#${shimmerGradientId})` : lineColor}
          shapeRendering="geometricPrecision" 
          onClick={(event) => {
            if (onLineClick) onLineClick(event, dataClicked, 0);
          }}              
        />

        {/* Render circles with animated and staggered growth */}
        {renderCircles(currentRadius)}
      </>
    </Group>
  );
};

export default LineRenderer;
