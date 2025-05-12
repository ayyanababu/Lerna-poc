import { useMemo } from "react";
import { scaleBand, scaleLinear } from "@visx/scale";

import { DataPoint } from "../components/v1/common/types";

// Define the interfaces based on what your component needs
// These are pure TypeScript interfaces with no imports from d3
export interface BandScaleInterface {
  (value: string): number | undefined;
  domain(): string[];
  range(): number[];
  bandwidth(): number;
  step(): number;
  paddingInner(): number;
  paddingOuter(): number;
  rangeRound(range: [number, number]): BandScaleInterface;
  round(round: boolean): BandScaleInterface;
  padding(padding: number): BandScaleInterface;
  align(align: number): BandScaleInterface;
  copy(): BandScaleInterface;
}

export interface LinearScaleInterface {
  (value: number): number;
  domain(): number[];
  range(): number[];
  invert(value: number): number;
  clamp(clamp?: boolean): boolean | LinearScaleInterface;
  // interpolate(interpolator: any): LinearScaleInterface;
  unknown(value: number): LinearScaleInterface;
  rangeRound(range: [number, number]): LinearScaleInterface;
  ticks(count?: number): number[];
  copy(): LinearScaleInterface;
}

export interface ChartScales {
  xScale: BandScaleInterface;
  yScale: LinearScaleInterface;
  y1Scale: LinearScaleInterface;
}

interface ChartScalesProps {
  filteredData: DataPoint[];
  innerWidth: number;
  drawableChartHeight: number;
}

const SCALE_PADDING = 1.02;

// Enhance the visx band scale with the missing methods needed by your component
const enhanceVisxBandScale = (
  scale: ReturnType<typeof scaleBand<string>>,
): BandScaleInterface => {
  // Create the enhanced scale object with existing methods
  const enhanced = scale as unknown as BandScaleInterface;

  // Add the missing methods
  enhanced.rangeRound = function (range: [number, number]) {
    scale.range(range);
    return enhanced;
  };

  // enhanced.round = function (round: boolean) {
  // ViSX scaleBand doesn't have a separate round method,
  // but we can return the enhanced scale for chaining
  //   return enhanced;
  // };

  // enhanced.padding = function (padding: number) {
  // ViSX scaleBand accepts padding in the constructor,
  // but we can return the enhanced scale for chaining
  //   return enhanced;
  //  };

  //  enhanced.align = function (align: number) {
  // ViSX scaleBand doesn't have an align method,
  // but we can return the enhanced scale for chaining
  //    return enhanced;
  //  };

  enhanced.copy = function () {
    // Return a new enhanced scale
    return enhanceVisxBandScale(scale);
  };

  return enhanced;
};

// Enhance the visx linear scale with the missing methods needed by your component
const enhanceVisxLinearScale = (
  scale: ReturnType<typeof scaleLinear<number>>,
): LinearScaleInterface => {
  // Create the enhanced scale object with existing methods
  const enhanced = scale as unknown as LinearScaleInterface;

  // Add the missing methods
  //enhanced.interpolate = function (interpolator: any) {
  // ViSX scaleLinear doesn't have an interpolate method,
  // but we can return the enhanced scale for chaining
  //   return enhanced;
  // };

  // enhanced.unknown = function (value: number) {
  // ViSX scaleLinear doesn't have an unknown method,
  // but we can return the enhanced scale for chaining
  //   return enhanced;
  // };

  enhanced.rangeRound = function (range: [number, number]) {
    scale.range(range);
    return enhanced;
  };

  enhanced.ticks = function (count?: number) {
    // Simple implementation that returns n evenly spaced ticks
    const domain = scale.domain();
    const min = domain[0];
    const max = domain[1];
    const step = (max - min) / (count || 10);
    const ticks = [];
    for (let i = min; i <= max; i += step) {
      ticks.push(i);
    }
    return ticks;
  };

  enhanced.copy = function () {
    // Return a new enhanced scale
    return enhanceVisxLinearScale(scale);
  };

  return enhanced;
};

/**
 * Custom hook for creating chart scales using visx
 * Enhanced with the necessary methods for compatibility
 */
const useChartScales = ({
  filteredData,
  innerWidth,
  drawableChartHeight,
}: ChartScalesProps): ChartScales => {
  const maxY1Value = useMemo(
    () =>
      Math.max(0, ...filteredData.map((d) => d.value?Number(d.value) : d.yAxisLeft?Number(d.yAxisLeft):0)) *
      SCALE_PADDING,
    [filteredData],
  );
  console.log(maxY1Value);
  console.log(filteredData)
  const maxY2Value = useMemo(
    () =>
      Math.max(0, ...filteredData.map((d) => Number(d.yAxisRight) || 0)) *
      SCALE_PADDING,
    [filteredData],
  );  

  // Create and enhance the xScale
  const xScale = useMemo(() => {
    const scale = scaleBand<string>({
      domain: filteredData.map((d) => String(d.label || d.xAxis)),
      range: [0, innerWidth],
      padding: 0.6,
      round: true,
    });

    return enhanceVisxBandScale(scale);
  }, [filteredData, innerWidth]);

  // Create and enhance the yScale
  const yScale = useMemo(() => {
    const scale = scaleLinear<number>({
      domain: [0, maxY1Value],
      range: [drawableChartHeight, 0],
      nice: true,
    });

    return enhanceVisxLinearScale(scale);
  }, [drawableChartHeight, maxY1Value]);

  const y1Scale = useMemo(() => {
    const scale = scaleLinear<number>({
      domain: [0, maxY2Value],
      range: [drawableChartHeight, 0],
      nice: true,
    });

    return enhanceVisxLinearScale(scale);
  }, [drawableChartHeight, maxY2Value]);  
console.log("yscale",yScale);
console.log("y1scale",y1Scale)
  return { xScale, yScale, y1Scale };
};

export default useChartScales;
