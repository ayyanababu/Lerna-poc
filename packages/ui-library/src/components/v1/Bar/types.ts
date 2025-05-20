import React, { CSSProperties } from "react";

import useTheme from "../../../hooks/useTheme";
import { CustomBarProps } from "../../CustomBar/types";
import { GridProps } from "../../Grid/types";
import { TimestampProps } from "../../Timestamp/types";
import { TitleProps } from "../../Title/types";
import { TooltipProps } from "../../Tooltip/types";
import { XAxisProps } from "../../XAxis/types";
import { YAxisProps } from "../../YAxis/types";
import { BarLineData, DataPoint } from "../common/Data.types";
import { LegendsProps } from "../Legends/types";

/**
 * Shared props across all bar-based charts
 */
export interface BaseChartProps {
  data: BarLineData;
  title?: string;
  margin?: { top: number; right: number; bottom: number; left: number };
  isLoading?: boolean;
  titleProps?: Partial<TitleProps>;
  legendsProps?: Partial<LegendsProps>;
  tooltipProps?: Partial<TooltipProps>;
  xAxisProps?: Partial<XAxisProps>;
  yAxisProps?: Partial<YAxisProps>;
  y1AxisProps?: Partial<YAxisProps>;
  gridProps?: Partial<GridProps>;
  timestampProps?: Partial<TimestampProps>;
  barProps?: Partial<CustomBarProps>;
  maxBarWidth?: number;
  showGrid?: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  showTicks: boolean;
  onClick?: (
    event: React.MouseEvent<SVGGElement, MouseEvent>,
    data: DataPoint,
    index: number,
  ) => void;
  theme: ReturnType<typeof useTheme>;
  style?: CSSProperties;
  variant:string;
  onLineClick?: (event: React.MouseEvent, data: BarLineData, index: number) => void;
  onPointClick?: (event: React.MouseEvent, data: DataPoint, index: number) => void;  
  onArrowClick?: (event: React.MouseEvent, data: DataPoint, legend: string | undefined,index: number) => void;  
}

/**
 * Props for a **plain vertical-bar** chart.
 * Uses a simple array of bar-colors.
 */
export interface VerticalBarChartProps extends BaseChartProps {
  variant: "VERTICAL BAR";
  colors?: string[];
}

/**
 * Props for a **bar+line** chart.
 * Uses an object with separate `bar` & `line` colors,
 * and also supports optional width/height/timestamp.
 */
export interface BarLineChartProps extends BaseChartProps {
  variant: "BAR AND LINE";
  colors?: { bar: string; line: string };
  width?: number;
  height?: number;
  timestamp?: string;
}

export type UnifiedChartProps = VerticalBarChartProps | BarLineChartProps;
