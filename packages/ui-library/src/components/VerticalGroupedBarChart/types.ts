import { CSSProperties } from "react";

import { LegendsProps } from "../Legends/types";
import { TimestampProps } from "../Timestamp/types";
import { TitleProps } from "../Title/types";
import { TooltipProps } from "../Tooltip/types";

export interface DataPoint {
  label: string;
  data: Record<string, number>;
}

export interface VerticalGroupedBarChartProps {
  /**
   * Data for the chart
   */
  data: DataPoint[];

  /**
   * Keys for the data groups
   */
  groupKeys: string[];

  /**
   * Type of chart - 'grouped' or 'stacked'
   */
  type?: "grouped" | "stacked";

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
}
