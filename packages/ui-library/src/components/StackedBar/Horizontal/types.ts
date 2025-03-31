import { CustomBarProps } from '../../CustomBar/types';
import { GridProps } from '../../Grid/types';
import { LegendsProps } from '../../Legends/types';
import { TimestampProps } from '../../Timestamp/types';
import { TitleProps } from '../../Title/types';
import { TooltipProps } from '../../Tooltip/types';
import { XAxisProps } from '../../XAxis/types';
import { YAxisProps } from '../../YAxis/types';

export interface DataPoint {
    label: string;
    data: Record<string, number>;
}

export interface HorizontalStackedBarChartProps {
    data: DataPoint[];
    groupKeys: string[];
    margin?: { top: number; right: number; bottom: number; left: number };
    title?: string;
    timestamp?: string;
    colors?: string[];
    isLoading?: boolean;
    showTicks?: boolean;
    titleProps?: TitleProps;
    legendsProps?: Partial<LegendsProps>;
    tooltipProps?: Partial<TooltipProps>;
    timestampProps?: Partial<TimestampProps>;
    xAxisProps?: Partial<XAxisProps>;
    yAxisProps?: Partial<YAxisProps>;
    gridProps?: Partial<GridProps>;
    barProps?: Partial<CustomBarProps>;
}
