import { ScaleBand, ScaleLinear } from "d3";

import { CustomBarProps } from "../../CustomBar/types";
import { BarsList, DataPoint } from "./types";

export interface BarRendererProps {
  filteredData: DataPoint[];
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  colorScale: (index: string) => string;
  hoveredBar: number | null | string;
  hoveredBarOther: number | null | string;
  isLoading: boolean;
  maxBarWidth: number | undefined; 
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
  barProps?: CustomBarProps;
  onClick?: (event: React.MouseEvent, data: DataPoint, index: number) => void;
  transferBarList: (barlist: BarsList[]) => void;
  chartProps:string|undefined;
}

export type {BarsList};

