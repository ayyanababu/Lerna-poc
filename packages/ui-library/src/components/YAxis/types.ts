
import { ScaleBand, ScaleLinear } from '@visx/vendor/d3-scale';

export interface YAxisProps {
  /**
   * Scale for the y-axis
   */
  scale: ScaleLinear<number, number> | ScaleBand<
    string | number>;
  
  /**
   * Theme of the chart
   */
  theme: any;
  
  /**
   * Format function for tick labels
   */
  tickFormat?: (value: any) => string;
  
  /**
   * Number of ticks
   */
  numTicks?: number;
  
  /**
   * Whether to show ticks
   */
  showTicks?: boolean;
  
  /**
   * Whether to show the axis line
   */
  showAxisLine?: boolean;
  
  /**
   * Whether the chart is in loading state
   */
  isLoading?: boolean;
  
  /**
   * Whether to hide all ticks when a condition is met
   */
  hideAllTicks?: boolean;
  
  /**
   * Custom text anchor for labels
   */
  textAnchor?: 'inherit' | 'end' | 'start' | 'middle';
}