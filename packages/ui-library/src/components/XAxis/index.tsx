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

import React, { useMemo } from "react";
import { AxisBottom } from "@visx/axis";

import useTheme from "../../hooks/useTheme";
import { formatNumberWithSuffix, isNumeric } from "../../utils/number";
import { shimmerClassName } from "../Shimmer/Shimmer";
import { shimmerGradientId } from "../Shimmer/SvgShimmer";
import { XAxisProps } from "./types";

const MAX_LABEL_CHARS = 15;
const MIN_SPACE_BETWEEN_TICKS = 45;

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
  ...props
}: XAxisProps): JSX.Element | null {
  const { theme } = useTheme();

  const overLineStyles = {
    fontSize: "10px",
    fontWeight: "normal",
    lineHeight: "165%",
    letterSpacing: "0.4px",
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

  const {
    angle,
    evenPositionsMap,
    formatLabel,
    rotate,
    textAnchor,
    tickValues,
  } = useMemo(() => {
    const scaleLabels =
      providedLabels ||
      (scale.domain && typeof scale.domain === "function"
        ? scale.domain().map(String)
        : []);

    if (scaleLabels.length <= 1) {
      return {
        angle: 0,
        evenPositionsMap: null,
        formatLabel: (label: string): string => {
          if (typeof label !== "string") return String(label);
          return label.length > MAX_LABEL_CHARS
            ? `${label.substring(0, MAX_LABEL_CHARS - 3)}...`
            : label;
        },
        rotate: false,
        textAnchor: "middle",
        tickValues: [],
      };
    }

    // Calculate available width per label
    const availableWidthPerLabel = availableWidth / scaleLabels.length;
    const averageCharWidth = 6; // Approximate width per character

    const maxLabelLength = Math.max(
      ...scaleLabels.map((label) => String(label).length),
    );
    const estimatedMaxLabelWidth = maxLabelLength * averageCharWidth;

    if (
      scaleLabels.length <= dynamicNumTicks ||
      availableWidthPerLabel > estimatedMaxLabelWidth * 1.2
    ) {
      return {
        angle: 0,
        evenPositionsMap: null,
        formatLabel: (label: string): string => {
          if (typeof label !== "string") return String(label);

          return label.length > MAX_LABEL_CHARS
            ? `${label.substring(0, MAX_LABEL_CHARS - 3)}...`
            : label;
        },
        rotate: false,
        textAnchor: "middle",
        tickValues: null,
      };
    }

    if (
      scaleLabels.length <= dynamicNumTicks * 2 ||
      availableWidthPerLabel > estimatedMaxLabelWidth * 0.6
    ) {
      const rotatedCharLimit = Math.min(
        MAX_LABEL_CHARS,
        Math.floor((availableWidthPerLabel * 1.5) / averageCharWidth),
      );

      return {
        angle: -45,
        evenPositionsMap: null,
        formatLabel: (label: string): string => {
          if (typeof label !== "string") return String(label);
          return label.length > rotatedCharLimit
            ? `${label.substring(0, rotatedCharLimit - 3)}...`
            : label;
        },
        rotate: true,
        textAnchor: "end",
        tickValues: null,
      };
    }

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

    // Calculate how many characters we can show based on available space

    const rotatedSpaceFactor = 1.8;
    const maxCharsPerLabel = Math.floor(
      (availableWidthPerLabel * rotatedSpaceFactor) / averageCharWidth,
    );

    const charLimit = Math.min(MAX_LABEL_CHARS, Math.max(8, maxCharsPerLabel));

    return {
      angle: -45,
      evenPositionsMap: positions,
      formatLabel: (label: string): string => {
        if (typeof label !== "string") return String(label);

        return label.length > charLimit
          ? `${label.substring(0, charLimit - 3)}...`
          : label;
      },
      rotate: true,
      textAnchor: "end",
      tickValues: indicesToShow.map((i) => scaleLabels[i]),
    };
  }, [availableWidth, providedLabels, scale, dynamicNumTicks]);

  const renderAxisLabel = (
    formattedValue: string | undefined,
    tickProps: React.SVGProps<SVGTextElement>,
  ): JSX.Element => {
    let label = "";
    if (!isLoading) {
      label = formatLabel
        ? formatLabel(formattedValue || "")
        : formattedValue || "";

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

    const yOffset = showAxisLine ? labelOffset : labelOffset / 2;

    if (rotate) {
      return (
        <g transform={`translate(${xPos},${tickProps.y})`}>
          <text
            className={isLoading ? shimmerClassName : ""}
            fill={
              isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label
            }
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
          className={isLoading ? shimmerClassName : ""}
          fill={
            isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label
          }
          style={textStyle}
          textAnchor="middle"
          dy={yOffset + "px"}
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
    dy: showAxisLine ? labelOffset + 4 + "px" : labelOffset + 15 + "px",
  };

  const mergedTickLabelProps = {
    ...externalTickLabelProps,
    ...overLineStyles,
    color: theme.colors.axis.label,
    fill: theme.colors.axis.label,
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
