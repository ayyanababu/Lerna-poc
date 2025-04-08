import { AxisBottom } from "@visx/axis";

type AxisBottomProps = Parameters<typeof AxisBottom>[0];
export interface XAxisProps extends AxisBottomProps {
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
   * Map of even positions for labels
   */
  evenPositionsMap?: Map<string, number>;

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

  /**
   * Whether the axis is visible
   */
  isVisible?: boolean;
  tickLength?: number;
  labelOffset?: number;
  forceFullLabels?: boolean;
}
