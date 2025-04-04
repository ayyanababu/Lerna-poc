import { OmittedTooltipProps } from '../ChartWrapper/types';
import { LegendData, LegendsProps } from '../Legends/types';
import { TitleProps } from '../Title/types';

export interface DonutData extends LegendData {
    _donutSpecific?: never;
}

export interface DonutTooltipProps extends OmittedTooltipProps {
    _tooltipSpecific?: never;
}

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
    tooltipProps?: DonutTooltipProps;
    /**
     * @example 0.02
     * @description The gap between the arcs in the donut chart. It is a value between 0 and 1, where 0 means no gap and 1 means a full gap.
     * @default 0
     */
    arcGap?: number;
    /**
     * @example 10
     * @description The radius of the arcs in the donut chart. It is a value in pixels.
     * @default 0
     */
    arcRadius?: number;
}
