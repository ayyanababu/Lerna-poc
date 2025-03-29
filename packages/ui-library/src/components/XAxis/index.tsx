/**
 * XAxis Component
 *
 * Algorithm:
 * 1. Calculate optimal label display based on available width
 * 2. For crowded axes:
 *    - Always show first and last labels
 *    - Distribute remaining labels evenly
 *    - Rotate labels if needed to fit available space
 * 3. Truncate long label text and add ellipsis
 * 4. Handle loading states with shimmer effect
 *
 */

import { AxisBottom } from '@visx/axis';
import React, { useMemo } from 'react';

import useTheme from '../../hooks/useTheme';
import { shimmerClassName } from '../Shimmer/Shimmer';
import { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { XAxisProps } from './types';

function XAxis({
  availableWidth = 0,
  hideAllTicks = false,
  isLoading = false,
  labels: providedLabels,
  numTicks = 5,
  scale,
  showAxisLine = true,
  showTicks = false,
  top,
  isVisible = true,
  ...props
}: XAxisProps): JSX.Element | null {
  const { theme } = useTheme();

  const { angle, evenPositionsMap, formatLabel, rotate, textAnchor, tickValues } = useMemo(() => {
    const scaleLabels =
      providedLabels ||
      (scale.domain && typeof scale.domain === 'function' ? scale.domain().map(String) : []);

    if (scaleLabels.length <= 1) {
      return {
        angle: 0,
        evenPositionsMap: null,
        formatLabel: (label: string): string => label,
        rotate: false,
        textAnchor: 'middle',
        tickValues: [],
      };
    }

    const optimalLabelCount = Math.max(2, Math.floor(availableWidth / 15));
    const averageCharWidth = 7;
    const totalLabelWidth = scaleLabels.join('').length * averageCharWidth;

    if (scaleLabels.length > optimalLabelCount || totalLabelWidth >= availableWidth) {
      let indicesToShow: number[] = [];

      if (scaleLabels.length > optimalLabelCount) {
        indicesToShow = [0, scaleLabels.length - 1];
        const middleLabelsToShow = optimalLabelCount - 2;

        if (middleLabelsToShow > 0 && scaleLabels.length > 2) {
          const step = (scaleLabels.length - 2) / (middleLabelsToShow + 1);

          for (let i = 1; i <= middleLabelsToShow; i += 1) {
            const index = Math.round(step * i);
            if (index > 0 && index < scaleLabels.length - 1) {
              indicesToShow.push(index);
            }
          }
        }

        indicesToShow.sort((a, b) => a - b);
      } else {
        indicesToShow = scaleLabels.map((_, i) => i);
      }

      const positions = new Map();
      const labelCount = indicesToShow.length;

      if (labelCount > 1) {
        const spacing = availableWidth / labelCount;
        indicesToShow.forEach((index, i) => {
          positions.set(scaleLabels[index], i * spacing);
        });
      } else if (labelCount === 1) {
        positions.set(scaleLabels[indicesToShow[0]], availableWidth / 2);
      }

      return {
        angle: -45,
        evenPositionsMap: positions,
        formatLabel: (label: string): string => {
          if (typeof label !== 'string') return String(label);
          return label.length > 12 ? `${label.substring(0, 12)}...` : label;
        },
        rotate: true,
        textAnchor: 'end',
        tickValues: indicesToShow.map((i) => scaleLabels[i]),
      };
    }

    if (scaleLabels.length <= optimalLabelCount) {
      return {
        angle: 0,
        evenPositionsMap: null,
        formatLabel: (label: string): string => {
          if (typeof label !== 'string') return String(label);
          return label.length > 12 ? `${label.substring(0, 12)}...` : label;
        },
        rotate: false,
        textAnchor: 'middle',
        tickValues: null,
      };
    }

    const indicesToShow = [0, scaleLabels.length - 1];
    const middleLabelsToShow = optimalLabelCount - 2;

    if (middleLabelsToShow > 0) {
      const step = (scaleLabels.length - 2) / (middleLabelsToShow + 1);
      for (let i = 1; i <= middleLabelsToShow; i += 1) {
        const index = Math.round(step * i) + 1;
        if (index > 0 && index < scaleLabels.length - 1) {
          indicesToShow.push(index);
        }
      }
    }

    indicesToShow.sort((a, b) => a - b);

    const positions = new Map();
    const labelCount = indicesToShow.length;

    if (labelCount > 1) {
      const spacing = availableWidth / labelCount;
      indicesToShow.forEach((index, i) => {
        positions.set(scaleLabels[index], i * spacing);
      });
    } else if (labelCount === 1) {
      positions.set(scaleLabels[indicesToShow[0]], availableWidth / 2);
    }

    return {
      angle: -30,
      evenPositionsMap: positions,
      formatLabel: (label: string): string => {
        if (typeof label !== 'string') return String(label);
        return label.length > 12 ? `${label.substring(0, 12)}...` : label;
      },
      rotate: true,
      textAnchor: 'end',
      tickValues: indicesToShow.map((i) => scaleLabels[i]),
    };
  }, [availableWidth, providedLabels, scale]);

  const renderAxisLabel = (
    formattedValue: string | undefined,
    tickProps: React.SVGProps<SVGTextElement>,
  ): JSX.Element => {
    let label = '';
    if (!isLoading) {
      label = formatLabel ? formatLabel(formattedValue || '') : formattedValue || '';
    }

    const textStyle = { fontSize: '12px' };

    const xPos =
      evenPositionsMap &&
      tickValues &&
      formattedValue &&
      evenPositionsMap.get(formattedValue) !== undefined
        ? evenPositionsMap.get(formattedValue)
        : tickProps.x;

    if (rotate) {
      return (
        <g transform={`translate(${xPos},${tickProps.y})`}>
          <text
            className={isLoading ? shimmerClassName : ''}
            fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
            style={textStyle}
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

    return (
      <g transform={`translate(${tickProps.x},${tickProps.y})`}>
        <text
          className={isLoading ? shimmerClassName : ''}
          fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
          style={textStyle}
          textAnchor="middle"
          dy="0.71em"
        >
          {label}
        </text>
      </g>
    );
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AxisBottom
      scale={scale}
      top={top}
      stroke={theme.colors.axis.line}
      tickStroke={theme.colors.axis.line}
      tickValues={tickValues === null ? undefined : tickValues}
      tickLabelProps={() => ({
        fill: theme.colors.axis.label,
        fontSize: '12px',
      })}
      numTicks={numTicks}
      hideAxisLine={!showAxisLine}
      hideTicks={hideAllTicks || !showTicks}
      tickComponent={({ formattedValue, ...tickProps }) =>
        renderAxisLabel(formattedValue, tickProps)
      }
      tickFormat={(value) => value.toString()}
      {...props}
    />
  );
}

export default XAxis;
