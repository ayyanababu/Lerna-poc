import { Bar } from '@visx/shape';
import { CSSProperties } from 'react';
import { LegendsProps } from '../Legends/types';
import { TimestampProps } from '../Timestamp/types';
import { TitleProps } from '../Title/types';
import { TooltipProps } from '../Tooltip/types';
import { XAxisProps } from '../XAxis/types';
import { YAxisProps } from '../YAxis/types';

export interface DataPoint {
    label: string;
    value: number;
    color?: string;
}

export interface VerticalBarChartProps {
    /**
     * Data for the chart
     */
    data: DataPoint[];

    /**
     * Chart title
     */
    title?: string;

    /**
     * Chart timestamp
     */
    timestamp?: string;

    /**
     * Margin around the chart
     */
    margin?: { top: number; right: number; bottom: number; left: number };

    /**
     * Width of the chart
     */
    width?: number;

    /**
     * Height of the chart
     */
    height?: number;

    /**
     * Custom colors for the chart
     */
    colors?: string[];

    /**
     * Loading state
     */
    isLoading?: boolean;

    /**
     * Title props
     */
    titleProps?: TitleProps;

    /**
     * Legend props
     */
    legendsProps?: Partial<LegendsProps>;

    /**
     * Tooltip props
     */
    tooltipProps?: Partial<TooltipProps>;

    /**
     * X axis props
     */
    xAxisProps?: Partial<XAxisProps>;

    /**
     * Y axis props
     */
    yAxisProps?: Partial<YAxisProps>;

    /**
     * Timestamp props
     */
    timestampProps?: Partial<TimestampProps>;

    /**
     * Chart container style
     */
    style?: CSSProperties;

    /**
     * Show ticks on axes
     * @default false
     */
    showTicks?: boolean;

    /**
     * Show grid lines
     * @default true
     */
    showGrid?: boolean;

    /**
     * Show Y axis
     * @default false
     */
    showYAxis?: boolean;

    /**
     * Show X axis
     * @default true
     */
    showXAxis?: boolean;

    /**
     * barProps
     */
    barProps?: Parameters<typeof Bar>[0];
}
