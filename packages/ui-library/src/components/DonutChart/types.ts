import { ChartWrapperProps } from '../ChartWrapper/types';

export type DonutChartData = {
  label: string;
  value: number;
};

export interface DonutChartProps {
  /**
   * Data for the donut chart
   */
  data: DonutChartData[];

  /**
   * Type of donut chart - full circle or semi-circle
   * @default 'full'
   */
  type?: 'full' | 'semi';

  /**
   * Whether to hide the labels on the chart
   * @default false
   */
  hideLabels?: boolean;

  /**
   * Title of the chart
   * @default ''
   */
  title?: string;

  /**
   * Timestamp for the chart data
   */
  timestamp?: string;

  /**
   * Custom colors for the chart segments
   */
  colors?: string[];

  /**
   * Whether the chart is in loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Props for the title component
   */
  titleProps?: ChartWrapperProps['titleProps'];

  /**
   * Props for the legends component
   */
  legendsProps?: Omit<ChartWrapperProps['legendsProps'], 'colorScale' | 'data'>;

  /**
   * Props for the tooltip component
   */
  tooltipProps?: Omit<
    ChartWrapperProps['tooltipProps'],
    'data' | 'top' | 'left' | 'isVisible'
  >;
}
