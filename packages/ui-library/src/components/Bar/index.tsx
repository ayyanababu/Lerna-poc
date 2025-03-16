import { Bar as VisxBar } from '@visx/shape';
import React from 'react';
import { shimmerGradientId } from '../Shimmer/SvgShimmer';

export interface BarProps {
  /**
   * X-coordinate of the bar
   */
  x: number;

  /**
   * Y-coordinate of the bar
   */
  y: number;

  /**
   * Width of the bar
   */
  width: number;

  /**
   * Height of the bar
   */
  height: number;

  /**
   * Fill color of the bar
   */
  fill: string;

  /**
   * Whether the chart is in loading state
   */
  isLoading?: boolean;

  /**
   * Opacity of the bar
   */
  opacity?: number;

  /**
   * Corner radius of the bar
   */
  rx?: number;

  /**
   * Mouse enter handler
   */
  onMouseMove?: (event: React.MouseEvent<SVGRectElement, MouseEvent>) => void;

  /**
   * Mouse leave handler
   */
  onMouseLeave?: (event: React.MouseEvent<SVGRectElement, MouseEvent>) => void;

  /**
   * Additional bar props
   */
  additionalProps?: any;
}

/**
 * Generic Bar component to be used across different chart types
 */
const Bar: React.FC<BarProps> = ({
  x,
  y,
  width,
  height,
  fill,
  isLoading = false,
  opacity = 1,
  rx = 5,
  onMouseMove,
  onMouseLeave,
  additionalProps,
}) => {
  return (
    <VisxBar
      x={x}
      y={y}
      width={width}
      height={height}
      fill={isLoading ? `url(#${shimmerGradientId})` : fill} 
      opacity={opacity}
      rx={rx}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...additionalProps}
    />
  );
};

export default Bar;