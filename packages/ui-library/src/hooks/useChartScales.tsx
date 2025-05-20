import { useMemo } from "react";
import { scaleBand, scaleLinear } from '@visx/scale';

import { BarLineDataItem } from "../components/v1/common/Data.types";

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
  filteredData: BarLineDataItem[];
  innerWidth: number;
  drawableChartHeight: number;
}

const SCALE_PADDING = 1.02;

// Enhance the visx band scale with the missing methods needed by your component
const enhanceVisxBandScale = (
  scale: ReturnType<typeof scaleBand<string>>,
): BandScaleInterface => {
  const enhanced = scale as unknown as BandScaleInterface;

  enhanced.rangeRound = function (range: [number, number]) {
    scale.range(range);
    return enhanced;
  };

  enhanced.copy = function () {
    return enhanceVisxBandScale(scale);
  };

  return enhanced;
};

// Enhance the visx linear scale with the missing methods needed by your component
const enhanceVisxLinearScale = (
  scale: ReturnType<typeof scaleLinear<number>>,
): LinearScaleInterface => {
  const enhanced = scale as unknown as LinearScaleInterface;
  enhanced.rangeRound = function (range: [number, number]) {
    scale.range(range);
    return enhanced;
  };

  enhanced.ticks = function (count?: number) {
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
    () => Math.max(0, ...filteredData.map((d) => d.yAxisLeft)) * SCALE_PADDING,
    [filteredData],
  );

  const maxY2Value = useMemo(
    () =>
      Math.max(0, ...filteredData.map((d) => d.yAxisRight ?? 0)) *
      SCALE_PADDING,
    [filteredData],
  );


  // Create and enhance the xScale
  const xScale = useMemo(() => {
    const band = scaleBand<string>({
      domain: filteredData.map((d) => d.xAxis),
      range: [0, innerWidth],
      padding: 0.6,
      round: true,
    }) 
    return enhanceVisxBandScale(band);
  }, [filteredData, innerWidth]);

  const yScale = useMemo(() => {
    const lin = scaleLinear<number>({
      domain: [0, maxY1Value],
      range: [drawableChartHeight, 0],
      nice: true,
    })
    return enhanceVisxLinearScale(lin);
  }, [drawableChartHeight, maxY1Value]);

  const y1Scale = useMemo(() => {
    const lin = scaleLinear<number>({
      domain: [0, maxY2Value],
      range: [drawableChartHeight, 0],
      nice: true,
    })
    return enhanceVisxLinearScale(lin);
  }, [drawableChartHeight, maxY2Value]);

  return { xScale, yScale, y1Scale };
};

export default useChartScales;
