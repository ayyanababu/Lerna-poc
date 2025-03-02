import { LegendsProps } from '../Legends';
import { TimestampProps } from '../Timestamp';
import { TitleProps } from '../Title';
import { TooltipProps } from '../Tooltip';

export interface ChartWrapperProps {
  children: ReactNode;
  title?: string;
  titleProps?: TitleProps;
  legendsProps?: LegendsProps;
  tooltipProps?: TooltipProps;
  timestampProps?: TimestampProps;
}
