import { ScaleBand, ScaleLinear } from '@visx/vendor/d3-scale';

export interface XAxisProps<Domain> {
  /**
   * Scale for the x-axis
   */
  scale: ScaleLinear<number, number> | ScaleBand<Domain>;
  
  /**
   * Top position of the axis
   */
  top: number;
  
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
   * Specific tick values to show
   */
  tickValues?: any[];
  
  /**
   * Format function for labels
   */
  formatLabel?: (label: string) => string;
  
  /**
   * Whether to rotate labels
   */
  rotate?: boolean;
  
  /**
   * Rotation angle for labels
   */
  angle?: number;
  
  /**
   * Text anchor for labels
   */
  textAnchor?: string;
  
  /**
   * Map of even positions for labels
   */
  evenPositionsMap?: Map<any, number>;
  
  /**
   * Width available for the axis (for auto-rotation calculation)
   */
  availableWidth?: number;
  
  /**
   * Enable auto rotation of labels based on available space
   */
  autoRotate?: boolean;
  
  /**
   * The labels to display (used for auto-rotation calculation)
   */
  labels?: string[];
}