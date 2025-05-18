import React,{SetStateAction} from 'react'
import { CSSProperties } from "react";
import { CustomBarProps } from "../../CustomBar/types";
import { GridProps } from "../../Grid/types";
import { TimestampProps } from "../../Timestamp/types";
import { TitleProps } from "../../Title/types";
import { TooltipProps } from "../../Tooltip/types";
import { XAxisProps } from "../../XAxis/types";
import { YAxisProps } from "../../YAxis/types";
import { LegendsProps } from "../Legends/types";
import { ChartProps } from "../Charts/types";
import { BarLineData, DataPoint } from "../common/Data.types";
import useTheme from "../../../hooks/useTheme"; 

export interface BarChartProps {
  data: BarLineData[];
  type?:string;
  title?: string;
  margin?: { top: number; right: number; bottom: number; left: number };
  colors?: string[];
  isLoading?: boolean;
  titleProps?: Partial<TitleProps>;
  chartProps?:Partial<ChartProps>;
  legendsProps?: LegendsProps;
  tooltipProps?: Partial<TooltipProps>;
  xAxisProps?: Partial<XAxisProps>;
  yAxisProps?: Partial<YAxisProps>;
  y1AxisProps?: Partial<YAxisProps>;
  gridProps?: Partial<GridProps>;
  timestampProps?: Partial<TimestampProps>;
  barProps?: Partial<CustomBarProps>;
  maxBarWidth?: number;
  showGrid?:boolean;
  showXAxis:boolean;
  showYAxis:boolean;
  showTicks:boolean;
  onClick?: (
    event: React.MouseEvent<SVGGElement, MouseEvent>,
    data: DataPoint,
    index: number,
  ) => void;
  theme:ReturnType<typeof useTheme>;
}


export type {BarLineData};

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
   * Maximum width of the bars (computed bar widths will be capped to this value)
   * @default MAX_BAR_WIDTH constant in component (16)
   */
  maxBarWidth?: number;

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






