import React, { useMemo } from "react";
import { AxisBottom } from "@visx/axis";

import useTheme from "../../hooks/useTheme";
import { formatNumberWithSuffix, isNumeric } from "../../utils/number";
import { shimmerClassName } from "../Shimmer/Shimmer";
import { shimmerGradientId } from "../Shimmer/SvgShimmer";
import { XAxisProps } from "./types";

const MAX_LABEL_CHARS = 15;
const MIN_SPACE_BETWEEN_TICKS = 45;
const ROTATED_LABEL_PADDING = 20;

function XAxis({
  availableWidth = 0,
  hideAllTicks = false,
  isLoading = false,
  labels: providedLabels,
  numTicks = 5,
  scale,
  showAxisLine = false,
  showTicks = false,
  top,
  isVisible = true,
  labelProps: externalLabelProps,
  tickLabelProps: externalTickLabelProps,
  tickLength = 5,
  labelOffset = 8,
  autoRotate = false,
  forceFullLabels = false,
  ...props
}: XAxisProps): JSX.Element | null {
  const theme = useTheme()?.theme || {
    colors: { axis: { label: '#888', title: '#555', line: '#ddd' } }
  };

  const overLineStyles = {
    fontSize: '10px',
    fontWeight: 'normal',
    lineHeight: '165%',
    letterSpacing: '0.4px',
    fontFamily: 'Roboto',
  };

  const tickFormat = (value: number | string) => {
    if (isNumeric(value)) {
      return formatNumberWithSuffix(Number(value));
    }
    return String(value);
  };
 
  const dynamicNumTicks = useMemo(() => {
    if (availableWidth <= 0) return numTicks;
    return Math.max(2, Math.floor(availableWidth / MIN_SPACE_BETWEEN_TICKS));
  }, [availableWidth, numTicks]);

  const { angle, evenPositionsMap, formatLabel, rotate, textAnchor, tickValues } = useMemo(() => {
    const scaleLabels =
      providedLabels ||
      (scale.domain && typeof scale.domain === 'function' ? scale.domain().map(String) : []);

    if (scaleLabels.length <= 1) {
      return {
        angle: 0,
        evenPositionsMap: null,
        formatLabel: (label: string): string => {
          if (typeof label !== 'string') return String(label);
          if (forceFullLabels) return label;
          return label.length > MAX_LABEL_CHARS
            ? `${label.substring(0, MAX_LABEL_CHARS - 3)}...`
            : label;
        },
        rotate: false,
        textAnchor: 'middle' as const,
        tickValues: []
      };
    }

    // Calculate available width per label
    const availableWidthPerLabel = availableWidth / scaleLabels.length;
    const averageCharWidth = 6; // Approximate width per character

    const maxLabelLength = Math.max(...scaleLabels.map((label) => String(label).length));
    const estimatedMaxLabelWidth = maxLabelLength * averageCharWidth;

    // Improved spacing calculation for horizontal labels
    const horizontalSpaceFactor = 1.5; // Increased from previous value

    // If we have enough space or few labels, display all labels flat
    if (
      scaleLabels.length <= dynamicNumTicks ||
      (availableWidthPerLabel > estimatedMaxLabelWidth * horizontalSpaceFactor && !autoRotate)
    ) {
      // Added adaptive character limit based on available width
      const horizontalCharLimit = Math.min(
        100,
        Math.floor((availableWidthPerLabel / averageCharWidth) * 0.9)
      );

      const effectiveCharLimit = forceFullLabels
        ? 100
        : Math.max(8, Math.min(MAX_LABEL_CHARS + 5, horizontalCharLimit));

      return {
        angle: 0,
        evenPositionsMap: null,
        formatLabel: (label: string): string => {
          if (typeof label !== 'string') return String(label);
          if (forceFullLabels) return label;
          return label.length > effectiveCharLimit
            ? `${label.substring(0, effectiveCharLimit - 3)}...`
            : label;
        },
        rotate: false,
        textAnchor: 'middle' as const,
        tickValues: null
      };
    }

    // If rotating helps fit the labels, use rotation
    // Improved rotation angle and positioning
    if (
      autoRotate ||
      scaleLabels.length <= dynamicNumTicks * 2 ||
      availableWidthPerLabel > estimatedMaxLabelWidth * 0.6
    ) {
      // Improved space calculation for rotated labels
      const rotatedSpaceFactor = 2.0; // Increased from previous value
      const rotatedCharLimit = Math.min(
        forceFullLabels ? 100 : MAX_LABEL_CHARS + 8,
        Math.floor((availableWidthPerLabel * rotatedSpaceFactor) / averageCharWidth)
      );

      return {
        angle: -45,
        evenPositionsMap: null,
        formatLabel: (label: string): string => {
          if (typeof label !== 'string') return String(label);
          if (forceFullLabels) return label;
          return label.length > rotatedCharLimit
            ? `${label.substring(0, rotatedCharLimit - 3)}...`
            : label;
        },
        rotate: true,
        textAnchor: 'end' as const,
        tickValues: null
      };
    }

    // For crowded axes, show select labels (always first and last, distribute rest)
    const indicesToShow: number[] = [0, scaleLabels.length - 1]; // Always show first and last

    const optimalLabelCount = Math.min(dynamicNumTicks, scaleLabels.length);
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

    // Create a map for positioning the labels evenly
    const positions = new Map();
    const labelCount = indicesToShow.length;

    if (labelCount > 1) {
      // Improved spacing with better margins
      const effectiveWidth = availableWidth * 0.95; // Use 95% of available width
      const spacing = effectiveWidth / (labelCount - 1);
      indicesToShow.forEach((index, i) => {
        positions.set(scaleLabels[index], availableWidth * 0.025 + i * spacing);
      });
    } else if (labelCount === 1) {
      positions.set(scaleLabels[indicesToShow[0]], availableWidth / 2);
    }

    // Calculate how many characters we can show based on available space
    const filteredSpaceFactor = 2.2; // Increased for better readability
    const maxCharsPerLabel = Math.floor(
      (availableWidthPerLabel * filteredSpaceFactor) / averageCharWidth
    );

    const charLimit = forceFullLabels
      ? 100
      : Math.min(MAX_LABEL_CHARS + 5, Math.max(8, maxCharsPerLabel));

    return {
      angle: -45,
      evenPositionsMap: positions,
      formatLabel: (label: string): string => {
        if (typeof label !== 'string') return String(label);
        if (forceFullLabels) return label;
        return label.length > charLimit ? `${label.substring(0, charLimit - 3)}...` : label;
      },
      rotate: true,
      textAnchor: 'end' as const,
      tickValues: indicesToShow.map((i) => scaleLabels[i])
    };
  }, [availableWidth, providedLabels, scale, dynamicNumTicks, forceFullLabels, autoRotate]);

  const renderAxisLabel = (
    formattedValue: string | undefined,
    tickProps: React.SVGProps<SVGTextElement>
  ): JSX.Element => {
    let label = '';
    if (!isLoading) {
      label = formatLabel ? formatLabel(formattedValue || '') : formattedValue || '';

      if (isNumeric(label)) {
        label = formatNumberWithSuffix(Number(label));
      }
    }

    const textStyle = { ...overLineStyles };

    const xPos =
      evenPositionsMap &&
      tickValues &&
      formattedValue &&
      evenPositionsMap.get(formattedValue) !== undefined
        ? evenPositionsMap.get(formattedValue)
        : tickProps.x;

    // Adjusted y-offset for better positioning
    const yOffset = showAxisLine
      ? labelOffset + (rotate ? ROTATED_LABEL_PADDING : 0)
      : labelOffset / 2;

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
      <g transform={`translate(${xPos},${tickProps.y})`}>
        <text
          className={isLoading ? shimmerClassName : ''}
          fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
          style={textStyle}
          textAnchor="middle"
          dy={`${yOffset}px`}
        >
          {label}
        </text>
      </g>
    );
  };

  const mergedLabelProps = {
    ...externalLabelProps,
    ...overLineStyles,
    color: theme.colors.axis.title,
    fill: theme.colors.axis.title,
    dy: showAxisLine
      ? `${labelOffset + 4 + (rotate ? ROTATED_LABEL_PADDING : 0)}px`
      : `${labelOffset + 23}px`
  };

  // Fixed the tickLabelProps function to return proper typing
  const mergedTickLabelProps = () => ({
    ...externalTickLabelProps,
    ...overLineStyles,
    color: theme.colors.axis.label,
    fill: theme.colors.axis.label,
    textAnchor: 'middle' as const
  });

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
      tickLabelProps={mergedTickLabelProps}
      numTicks={dynamicNumTicks}
      hideAxisLine={!showAxisLine}
      hideTicks={hideAllTicks || !showTicks}
      tickLength={showTicks ? tickLength : 0}
      tickComponent={({ formattedValue, ...tickProps }) =>
        renderAxisLabel(formattedValue, tickProps)
      }
      tickFormat={tickFormat}
      labelProps={mergedLabelProps}
      {...props}
    />
  );
}

export default XAxis;
