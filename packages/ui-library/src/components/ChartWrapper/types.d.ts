import { ReactNode } from 'react';
import { LegendsProps } from '../Legends/types.d';
import { TimestampProps } from '../Timestamp/types.d';
import { TitleProps } from '../Title/types.d';
import { TooltipProps } from '../Tooltip/types.d';

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
  > { }

export interface OmittedTooltipProps
  extends Omit<TooltipProps, 'data' | 'top' | 'left' | 'isVisible'> { }

export interface ChartWrapperProps {
  children: ReactNode;
  title?: string;
  titleProps?: TitleProps;
  legendsProps?: LegendsProps;
  tooltipProps?: TooltipProps;
  timestampProps?: TimestampProps;
}
