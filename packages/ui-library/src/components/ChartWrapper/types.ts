// import { ReactNode } from 'react';

// import { LegendsProps } from '../Legends/types';
// import { TimestampProps } from '../Timestamp/types';
// import { TitleProps } from '../Title/types';
// import { TooltipProps } from '../Tooltip/types';

// export type OmittedLegendsProps = Omit<
//     LegendsProps,
//     | 'data'
//     | 'colorScale'
//     | 'hideIndex'
//     | 'setHideIndex'
//     | 'hovered'
//     | 'setHovered'
//     | 'isLoading'
//   >

// export type OmittedTooltipProps = Omit<TooltipProps, 'data' | 'top' | 'left' | 'isVisible'>

// export interface ChartWrapperProps {
//   children: ReactNode;
//   title?: string;
//   titleProps?: TitleProps;
//   legendsProps?: LegendsProps;
//   tooltipProps?: TooltipProps;
//   timestampProps?: TimestampProps;
// }

import { ReactNode } from 'react';

import { LegendsProps } from '../Legends/types';
import { TimestampProps } from '../Timestamp/types';
import { TitleProps } from '../Title/types';
import { TooltipProps } from '../Tooltip/types';

export type OmittedLegendsProps = Omit<
    LegendsProps,
    'data' | 'colorScale' | 'hideIndex' | 'setHideIndex' | 'hovered' | 'setHovered' | 'isLoading'
>;

export type OmittedTooltipProps = Omit<TooltipProps, 'data' | 'top' | 'left' | 'isVisible'>;

export interface ChartWrapperProps {
    children: ReactNode;
    title?: string;
    titleProps?: TitleProps;
    legendsProps?: LegendsProps;
    tooltipProps?: TooltipProps;
    timestampProps?: TimestampProps;
}
