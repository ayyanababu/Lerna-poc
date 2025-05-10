import { ScaleBand, ScaleLinear } from "d3";

import { DataPoint } from "../../components/HorizontalBar/types";

export interface BarsList {
  x: number;
  width: number;
  label: string;
}

export interface BarRendererProps {
  filteredData: DataPoint[];
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  colorScale: (index: string) => string;
  hoveredBar: number | null;
  isLoading: boolean;
  maxBarWidth: number;
  drawableChartHeight: number;
  handleBarMouseMove: (
    value: number,
    color: string,
    index: number,
  ) => (event: React.MouseEvent) => void;
  handleBarMouseLeave: () => void;
  defaultOpacity: number;
  reducedOpacity: number;
  baseAdjustWidth: number;
  barProps?: any;
  onClick?: (event: React.MouseEvent, data: DataPoint, index: number) => void;
  transferBarList: (barlist: BarsList[]) => void;
}
