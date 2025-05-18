import { CustomBarProps } from "../CustomBar/types";
import { GridProps } from "../Grid/types";
import { LegendsProps } from "../v1/Legends/types";
import { TimestampProps } from "../Timestamp/types";
import { TitleProps } from "../Title/types";
import { TooltipProps } from "../Tooltip/types";
import { XAxisProps } from "../XAxis/types";
import { YAxisProps } from "../YAxis/types";
import { ChartProps } from "../v1/Charts/types";
import { DataPoint } from "../HorizontalBar/types";
import { BarLineData } from '../v1/common/Data.types'


export interface VerticalBarChartProps {
  data: BarLineData;
  title?: string;
  margin?: { top: number; right: number; bottom: number; left: number };
  colors?: string[];
  isLoading?: boolean;
  titleProps?: Partial<TitleProps>;
  legendsProps?: Partial<LegendsProps>;
  tooltipProps?: Partial<TooltipProps>;
  xAxisProps?: Partial<XAxisProps>;
  yAxisProps?: Partial<YAxisProps>;
  gridProps?: Partial<GridProps>;
  timestampProps?: Partial<TimestampProps>;
  barProps?: Partial<CustomBarProps>;
  maxBarWidth?: number;
  onClick?: (
    event: React.MouseEvent<SVGGElement, MouseEvent>,
    data: DataPoint,
    index: number,
  ) => void;
  showGrid?:boolean;
  showXAxis?:boolean;
  showYAxis?:boolean;
  showTicks?:boolean;  
  chartProps?:Partial<ChartProps>;
}

export type {BarLineData};
