import { AxisLeft } from '@visx/axis';
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { shimmerClassName } from '../Shimmer/Shimmer';
import { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { YAxisProps } from './types';

/**
 * Generic YAxis component to be used across different chart types
 */
function YAxis({
    scale,
    numTicks = 5,
    showTicks = false,
    showAxisLine = true,
    isLoading = false,
    hideAllTicks = false,
    textAnchor = 'end',
    availableHeight,
    ...props
}: YAxisProps) {
    const { theme } = useTheme();
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
            {isLoading
                ? ''
                : ((label: string) => {
                      if (typeof label !== 'string') return label;
                      // Allow longer labels
                      if (label.length > 6) {
                          return `${label.substring(0, 6)}...`;
                      }
                      return label;
                  })(formattedValue || '')}
        </text>
    );

    return (
        <AxisLeft
            scale={scale}
            stroke={theme.colors.axis.line}
            tickStroke={theme.colors.axis.line}
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
            {...props}
        />
    );
}

export default YAxis;