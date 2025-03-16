import { AxisLeft } from '@visx/axis';
import { ScaleBand, ScaleLinear } from '@visx/vendor/d3-scale';
import React from 'react';
import { shimmerClassName } from '../Shimmer/Shimmer';
import { shimmerGradientId } from '../Shimmer/SvgShimmer';

export interface YAxisProps<Domain> {
  /**
   * Scale for the y-axis
   */
  scale: ScaleLinear<number, number> | ScaleBand<Domain>;
  
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

/**
 * Generic YAxis component to be used across different chart types
 */
function YAxis<Domain extends string | number>({
  scale,
  theme,
  tickFormat,
  numTicks = 5,
  showTicks = false,
  showAxisLine = true,
  isLoading = false,
  hideAllTicks = false,
  textAnchor = 'end',
}: YAxisProps<Domain>) {

  // Render axis label with loading state handling
  const renderAxisLabel = (formattedValue: string | undefined, tickProps: any) => (
    <text
      {...tickProps}
      className={`${isLoading ? shimmerClassName : ''}`}
      fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
      style={{
        fontSize: theme.typography.fontSize.small,
      }}
    >
      {isLoading ? '' : formattedValue}
    </text>
  );

  return (
    <AxisLeft
      scale={scale}
      stroke={theme.colors.axis.line}
      tickStroke={theme.colors.axis.line}
      tickFormat={tickFormat}
      tickLabelProps={(value, index, values) => ({
        fill: theme.colors.axis.label,
        fontSize: theme.typography.fontSize.small,
        textAnchor: textAnchor,
        dy: '0.33em',
      })}
      hideAxisLine={!showAxisLine}
      hideTicks={hideAllTicks || !showTicks}
      numTicks={numTicks}
      tickComponent={({ formattedValue, ...tickProps }) => 
        renderAxisLabel(formattedValue, tickProps)
      }
    />
  );
}

export default YAxis;