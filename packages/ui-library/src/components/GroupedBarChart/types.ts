import { LegendsProps } from '../Legends/types';
import { TitleProps } from '../Title/types';
import { TooltipProps } from '../Tooltip/types';

export type ChartType = 'grouped' | 'stacked';

export interface DataPoint {
  label: string;
  data: Record<string, number>;
}

/**
 * Props for the GroupedBarChart component.
 */
export interface GroupedBarChartProps {
  /**
   * The data points to be displayed in the chart.
   */
  data: DataPoint[];

  /**
   * The keys used to group the data points.
   */
  groupKeys: string[];

  /**
   * The type of the chart.
   * @default 'bar'
   */
  type?: ChartType;

  /**
   * The margin around the chart.
   */
  margin?: {
    /**
     * Margin from the top.
     */
    top: number;

    /**
     * Margin from the right.
     */
    right: number;

    /**
     * Margin from the bottom.
     */
    bottom: number;

    /**
     * Margin from the left.
     */
    left: number;
  };

  /**
   * The title of the chart.
   */
  title?: string;

  /**
   * The timestamp of the data.
   */
  timestamp?: string;

  /**
   * Indicates if the chart is loading.
   */
  isLoading?: boolean;

  /**
   * The colors used in the chart.
   */
  colors?: string[];

  /**
   * Props for the title component.
   */
  titleProps?: TitleProps;

  /**
   * Props for the legends component.
   */
  legendsProps?: LegendsProps;

  /**
   * Props for the tooltip component.
   */
  tooltipProps?: TooltipProps;
}

export interface BarProps {
  key?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
  rx: number;
  value: number;
  label: string;
  onMouseMove: (event: React.MouseEvent) => void;
  onMouseLeave: () => void;
}
