import { LegendData, LegendsProps } from '../Legends/types';
import { TitleProps } from '../Title/types';
import { TooltipProps } from '../Tooltip/types';

export interface DonutData extends LegendData {}

export interface DonutChartProps {
  data: DonutData;
  type?: 'full' | 'semi';
  hideLabels?: boolean;
  title?: string;
  timestamp?: string;
  colors?: string[];
  isLoading?: boolean;

  titleProps?: TitleProps;
  legendsProps?: LegendsProps;
  tooltipProps?: TooltipProps;
}
