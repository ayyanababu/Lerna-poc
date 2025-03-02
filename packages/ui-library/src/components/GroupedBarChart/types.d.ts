import { LegendsProps } from '../Legends';
import { TitleProps } from '../Title';
import { TooltipProps } from '../Tooltip';

export type ChartType = 'grouped' | 'stacked';

export interface DataPoint {
  label: string;
  data: Record<string, number>;
}

export interface GroupedBarChartProps {
  data: DataPoint[];
  groupKeys: string[];
  type?: ChartType;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  title?: string;
  timestamp?: string;
  isLoading?: boolean;
  colors?: string[];

  titleProps?: TitleProps;
  legendsProps?: LegendsProps;
  tooltipProps?: TooltipProps;
}

export interface BarProps {
  key?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
  rx: number;
  value: number;
  label: string;
  onMouseMove: (event: React.MouseEvent) => void;
  onMouseLeave: () => void;
}
