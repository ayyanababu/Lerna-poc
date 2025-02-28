import { LegendsProps } from '../Legends/Legends';
import { TimestampProps } from '../Timestamp/Timestamp';
import { TitleProps } from '../Title/Title';
import { TooltipProps } from '../Tooltip/Tooltip';

export interface ChartWrapperProps {
  children: ReactNode;
  title?: string;
  titleProps?: TitleProps;
  legendsProps?: LegendsProps;
  tooltipProps?: TooltipProps;
  timestampProps?: TimestampProps;
}
