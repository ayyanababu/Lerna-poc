import {
  BandScaleInterface,
  LinearScaleInterface,
} from "../../../hooks/useChartScales";
import { CustomBarProps } from "../../CustomBar/types";
import { BarLineDataItem, BarsList, DataPoint } from "./Data.types";

export interface BarRendererProps {
  filteredData: BarLineDataItem[];
  xScale: BandScaleInterface;
  yScale: LinearScaleInterface;
  colorScale: (index: string) => string;
  hoveredBar: number | null | string | undefined;
  hoveredBarOther: number | null | string | undefined;
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
  chartProps: string | undefined;
}

export type { BarsList };
