import { LegendData, LegendsProps } from '../Legends/Legends';
import { TitleProps } from '../Title/Title';
import { TooltipProps } from '../Tooltip/Tooltip';

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
