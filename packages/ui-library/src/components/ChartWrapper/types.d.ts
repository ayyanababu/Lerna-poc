import { LegendsProps } from '../Legends';
import { TimestampProps } from '../Timestamp';
import { TitleProps } from '../Title';
import { TooltipProps } from '../Tooltip';

export interface OmittedLegendsProps
  extends Omit<
    LegendsProps,
    | 'data'
    | 'colorScale'
    | 'hideIndex'
    | 'setHideIndex'
    | 'hovered'
    | 'setHovered'
    | 'isLoading'
  > {}

export interface OmittedTooltipProps
  extends Omit<TooltipProps, 'data' | 'top' | 'left' | 'isVisible'> {}



export interface ChartWrapperProps {
  children: ReactNode;
  title?: string;
  titleProps?: TitleProps;
  legendsProps?: LegendsProps;
  tooltipProps?: TooltipProps;
  timestampProps?: TimestampProps;
}
