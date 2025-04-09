import { CSSProperties } from "react";

import { CustomBarProps } from "../CustomBar/types";
import { GridProps } from "../Grid/types";
import { LegendsProps } from "../Legends/types";
import { TimestampProps } from "../Timestamp/types";
import { TitleProps } from "../Title/types";
import { TooltipProps } from "../Tooltip/types";
import { XAxisProps } from "../XAxis/types";
import { YAxisProps } from "../YAxis/types";

export interface BarLineDataPoint {
    xAxis: string;
    yAxisLeft: number;
    yAxisRight: number;
}

export interface BarLineData {
    xAxislabel: string;
    yAxisLeftLabel: string;
    yAxisRightLabel: string;
    chartData: BarLineDataPoint[]
}

export interface BarLineChartProps {
    /**
     * Data for the chart
     */
    data: BarLineData;

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
    colors?: {
        line: string;
        bar: string;
    };

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
     * Grid props
     */
    gridProps?: GridProps;

    /**
     * barProps
     */
    barProps?: CustomBarProps;

    /**
     * Timestamp props
     */
    timestampProps?: Partial<TimestampProps>;

    /**
     * Show ticks on axes
     * @default false
     */
    showTicks?: boolean;

    /**
     * Chart container style
     */
    style?: CSSProperties;

    /**
     * Show grid lines
     * @default true
     */
    showGrid?: boolean;

    /**
     * Show Y axis
     * @default true
     */
    showYAxis?: boolean;

    /**
     * Show X axis
     * @default true
     */
    showXAxis?: boolean;
}
