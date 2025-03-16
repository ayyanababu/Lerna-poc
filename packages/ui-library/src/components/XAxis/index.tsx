import { AxisBottom } from '@visx/axis';
import { ScaleBand, ScaleLinear } from '@visx/vendor/d3-scale';
import React from 'react';
import { shimmerClassName } from '../Shimmer/Shimmer';
import { shimmerGradientId } from '../Shimmer/SvgShimmer';

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
}

/**
 * Generic XAxis component to be used across different chart types
 */
function XAxis<Domain extends string | number>({
  scale,
  top,
  theme,
  tickFormat,
  numTicks = 5,
  showTicks = false,
  showAxisLine = true,
  isLoading = false,
  hideAllTicks = false,
  tickValues,
  formatLabel,
  rotate = false,
  angle = 0,
  textAnchor = 'middle',
  evenPositionsMap,
}: XAxisProps<Domain>) {

  // Render axis label with loading state handling
  const renderAxisLabel = (formattedValue: string | undefined, tickProps: any) => {
    const label = isLoading ? '' : (formatLabel ? formatLabel(formattedValue || '') : formattedValue);
    
    // Get position for evenly spaced labels if available
    let xPosition = tickProps.x;
    
    // Use even spacing if we're using a subset of labels
    if (evenPositionsMap && tickValues && formattedValue) {
      const evenPosition = evenPositionsMap.get(formattedValue);
      if (evenPosition !== undefined) {
        xPosition = evenPosition;
      }
    }

    // For rotated labels, use a g element to handle rotation properly
    if (rotate) {
      return (
        <g transform={`translate(${evenPositionsMap && tickValues ? xPosition : tickProps.x},${tickProps.y})`}>
          <text
            className={isLoading ? shimmerClassName : ''}
            fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
            style={{
              fontSize: theme.typography.fontSize.small,
            }}
            textAnchor={textAnchor}
            transform={`rotate(${angle})`}
            dy="0.5em"
            dx="0.32em"
          >
            {label}
          </text>
        </g>
      );
    }

    // For non-rotated labels
    return (
      <g transform={`translate(${tickProps.x},${tickProps.y})`}>
        <text
          className={`${isLoading ? shimmerClassName : ''}`}
          fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
          style={{
            fontSize: theme.typography.fontSize.small,
          }}
          textAnchor="middle"
          dy="0.71em"
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <AxisBottom
      scale={scale}
      top={top}
      stroke={theme.colors.axis.line}
      tickStroke={theme.colors.axis.line}
      tickValues={tickValues || undefined}
      tickLabelProps={() => ({
        fill: theme.colors.axis.label,
        fontSize: theme.typography.fontSize.small,
      })}
      tickFormat={tickFormat}
      numTicks={numTicks}
      hideAxisLine={!showAxisLine}
      hideTicks={hideAllTicks || !showTicks}
      tickComponent={({ formattedValue, ...tickProps }) => 
        renderAxisLabel(formattedValue, tickProps)
      }
    />
  );
}

export default XAxis;