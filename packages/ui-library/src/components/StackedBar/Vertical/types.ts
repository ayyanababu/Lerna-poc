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

export interface VerticalStackedBarChartProps {
    data: DataPoint[];
    groupKeys: string[];
    stackGap?: number;
    title?: string;
    margin?: { top: number; right: number; bottom: number; left: number };
    colors?: string[];
    isLoading?: boolean;
    titleProps?: Partial<TitleProps>;
    legendsProps?: Partial<LegendsProps>;
    tooltipProps?: Partial<TooltipProps>;
    xAxisProps?: Partial<XAxisProps>;
    yAxisProps?: Partial<YAxisProps>;
    gridProps?: Partial<GridProps>;
    timestampProps?: Partial<TimestampProps>;
    barProps?: Partial<CustomBarProps>;
}
