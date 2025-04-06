import React from 'react';
import { AxisLeft, AxisRight } from '@visx/axis';

import { useTheme } from '../../hooks/useTheme';
import { shimmerClassName } from '../Shimmer/Shimmer';
import { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { YAxisProps } from './types';

const MAX_LABEL_CHARS = 15; // Or however many you want before truncating

const baseFontStyles = {
  fontSize: '10px',
  fontWeight: 'normal',
  lineHeight: '165%',
  letterSpacing: '0.4px'
};

function YAxis({
  scale,
  numTicks = 5,
  showTicks = false,
  showAxisLine = false,
  isLoading = false,
  hideAllTicks = false,
  textAnchor = 'end',
  isVisible = true,
  isRightYAxis = false,
  labelProps: externalLabelProps,
  tickLabelProps: externalTickLabelProps,
  ...props
}: YAxisProps) {
  const { theme } = useTheme();
  const AxisComponent = isRightYAxis ? AxisRight : AxisLeft;

  const renderAxisLabel = (
    formattedValue: string | number | undefined,
    tickProps: React.SVGProps<SVGTextElement>
  ) => {
    if (isLoading) {
      // Show shimmer effect
      return (
        <text
          {...tickProps}
          className={shimmerClassName}
          fill={`url(#${shimmerGradientId})`}
          style={baseFontStyles as React.CSSProperties}
         />
      );
    }

    // Possibly truncate
    let label = String(formattedValue || '');
    if (label.length > MAX_LABEL_CHARS) {
      label = `${label.substring(0, MAX_LABEL_CHARS - 1)  }…`;
    }

    return (
      <text
        {...tickProps}
        fill={theme.colors.axis.label}
        style={baseFontStyles as React.CSSProperties}
      >
        {label}
      </text>
    );
  };
  const labelOffset = isRightYAxis ? 4 : -4;

  const mergedLabelProps = {
    ...externalLabelProps,
    ...baseFontStyles,
    color: theme.colors.axis.title,
    fill: theme.colors.axis.title,
    dx: labelOffset,
    transform: isRightYAxis ? 'rotate(90)' : 'rotate(-90)'
  };

  const mergedTickLabelProps = {
    ...externalTickLabelProps,
    ...baseFontStyles,
    color: theme.colors.axis.label,
    fill: theme.colors.axis.label
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AxisComponent
      scale={scale}
      stroke={theme.colors.axis.line}
      tickStroke={theme.colors.axis.line}
      tickLabelProps={() => ({
        textAnchor,
        dy: '0.33em',
        ...mergedTickLabelProps
      })}
      hideAxisLine={!showAxisLine}
      hideTicks={hideAllTicks || !showTicks}
      numTicks={numTicks}
      tickComponent={({ formattedValue, ...tickProps }) =>
        renderAxisLabel(formattedValue, tickProps)
      }
      labelProps={mergedLabelProps}
      {...props}
    />
  );
}

export default YAxis;
