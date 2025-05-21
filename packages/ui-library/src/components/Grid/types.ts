import {
  BandScaleInterface,
  LinearScaleInterface,
} from "../../hooks/useChartScales";

export interface GridProps {
  /**
   * Width for horizontal grid lines
   */
  width?: number;

  /**
   * Height for vertical grid lines
   */
  height?: number;

  /**
   * Scale for horizontal grid lines
   */
  xScale?: BandScaleInterface;

  /**
   * Scale for vertical grid lines
   */
  yScale?: LinearScaleInterface;

  /**
   * Number of ticks for grid lines
   */
  numTicks?: number;

  /**
   * Whether to show horizontal grid lines
   */
  showHorizontal?: boolean;

  /**
   * Whether to show vertical grid lines
   */
  showVertical?: boolean;

  /**
   * Opacity of grid lines
   */
  opacity?: number;

  /**
   * Whether to show the bar
   * @default false
   */
  isVisible?: boolean;
  /**
   * whether to show the laoding state
   * @default false
   */
  isLoading?: boolean;
}
