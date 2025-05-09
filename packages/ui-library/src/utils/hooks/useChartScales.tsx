import { useMemo } from 'react';
import { scaleBand, scaleLinear } from "@visx/scale";
import { DataPoint } from '../../components/HorizontalBar/types';


interface ChartScalesProps {
  filteredData: DataPoint[];
  innerWidth: number;
  drawableChartHeight: number;
}

const SCALE_PADDING = 1.02;

const useChartScales = ({
  filteredData,
  innerWidth,
  drawableChartHeight,
}: ChartScalesProps) => {
  // Calculate max value for scaling
  const maxValue = useMemo(
    () =>
      Math.max(0, ...filteredData.map((d) => Number(d.value) || 0)) *
      SCALE_PADDING,
    [filteredData],
  );

  // Create X scale (horizontal)
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: filteredData.map((d) => String(d.label)),
        range: [0, innerWidth],
        padding: 0.6,
        round: true,
      }),
    [filteredData, innerWidth],
  );

  // Create Y scale (vertical)
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue],
        range: [drawableChartHeight, 0],
        nice: true,
      }),
    [drawableChartHeight, maxValue],
  );

  return {
    xScale,
    yScale,
    maxValue,
  };
};

export default useChartScales;
