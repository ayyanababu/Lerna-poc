import { OmittedLegendsProps, OmittedTooltipProps } from '../ChartWrapper/types';
import { LegendData } from '../Legends/types';
import { TitleProps } from '../Title/types';

export type DonutData = LegendData;

export type DonutLegendsProps = OmittedLegendsProps;

export type DonutTooltipProps = OmittedTooltipProps;

export interface DonutChartProps {
    data: DonutData;
    type?: 'full' | 'semi';
    hideLabels?: boolean;
    title?: string;
    timestamp?: string;
    colors?: string[];
    isLoading?: boolean;

    titleProps?: TitleProps;
    legendsProps?: DonutLegendsProps;
    tooltipProps?: DonutTooltipProps;
}
