import { CustomBarProps } from "../CustomBar/types";
import { GridProps } from "../Grid/types";
import { LegendsProps } from "../Legends/types";
import { TimestampProps } from "../Timestamp/types";
import { TitleProps } from "../Title/types";
import { TooltipProps } from "../Tooltip/types";
import { XAxisProps } from "../XAxis/types";
import { YAxisProps } from "../YAxis/types";

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface HorizontalBarChartProps {
  data: DataPoint[];
  title?: string;
  margin?: { top: number; right: number; bottom: number; left: number };
  colors?: string[];
  isLoading?: boolean;
  maxBarHeight?: number;
  titleProps?: Partial<TitleProps>;
  legendsProps?: Partial<LegendsProps>;
  tooltipProps?: Partial<TooltipProps>;
  xAxisProps?: Partial<XAxisProps>;
  yAxisProps?: Partial<YAxisProps>;
  gridProps?: Partial<GridProps>;
  timestampProps?: Partial<TimestampProps>;
  barProps?: Partial<CustomBarProps>;
  onClick?: (
    event: React.MouseEvent<SVGGElement, MouseEvent>,
    data: DataPoint,
    index: number,
  ) => void;
}
