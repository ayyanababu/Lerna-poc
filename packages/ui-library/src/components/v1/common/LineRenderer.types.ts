import React,{SetStateAction} from "react";
import { TooltipProps, GridProps } from "@mui/material";
import { CSSProperties } from "react";
import { CustomBarProps } from "../../CustomBar/types";
import { TimestampProps } from "../../Timestamp/types";
import { TitleProps } from "../../Title/types";
import { LegendsProps } from "../Legends/types";
import { XAxisProps } from "../XAxis/types";
import { YAxisProps } from "../YAxis/types";
import { ScaleBand, ScaleLinear } from "d3";

export interface BarLineDataPoint {
  xAxis: string;
  yAxisLeft: number;
  yAxisRight: number;
  barColor?: string;
}

export interface BarLineData {
  xAxislabel: string;
  yAxisLeftLabel: string;
  yAxisRightLabel: string;
  chartData: BarLineDataPoint[];
}

export interface LineRendererProps {
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

  xScale: ScaleBand<string>;
  y1Scale: ScaleLinear<number, number>;
  defaultOpacity: number;
  reducedOpacity: number;
  circleRadius:number;
  getAxisRight:(axisrightwidth:number)=>void;
  setHideIndex?: React.Dispatch<SetStateAction<number[]>>;
  hideIndex?:number[];
  y1AxisProps:Partial<YAxisProps>;
  xOffset?:number;
  yAxisRightLabel?:string;
  hoveredLine:string | null | number;
  chartWidth:number;
  lineColor:string;
  hideTicks?:boolean;
  hideAxisLine?:boolean
  label?:string;
  rightPosition:number;
}
