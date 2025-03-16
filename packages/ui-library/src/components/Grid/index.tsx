import { ScaleLinear } from '@visx/vendor/d3-scale';
import React from 'react';

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
  xScale?: ScaleLinear<number, number>;
  
  /**
   * Scale for vertical grid lines
   */
  yScale?: ScaleLinear<number, number>;
  
  /**
   * Number of ticks for grid lines
   */
  numTicks?: number;
  
  /**
   * Theme of the chart
   */
  theme: any;
  
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
}

/**
 * Generic Grid component to be used across different chart types
 */
const Grid: React.FC<GridProps> = ({
  width = 0,
  height = 0,
  xScale,
  yScale,
  numTicks = 5,
  theme,
  showHorizontal = true,
  showVertical = false,
  opacity = 0.3,
}) => {
  return (
    <g>
      {/* Horizontal grid lines */}
      {showHorizontal && yScale && (
        <>
          {yScale.ticks(numTicks).map((tick) => (
            <line
              key={`horizontal-${tick}`}
              x1={0}
              x2={width}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke={theme.colors.axis.grid}
              strokeDasharray="2,2"
              opacity={opacity}
            />
          ))}
        </>
      )}

      {/* Vertical grid lines */}
      {showVertical && xScale && (
        <>
          {xScale.ticks(numTicks).map((tick) => (
            <line
              key={`vertical-${tick}`}
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={0}
              y2={height}
              stroke={theme.colors.axis.grid}
              strokeDasharray="2,2"
              opacity={opacity}
            />
          ))}
        </>
      )}
    </g>
  );
};

export default Grid;