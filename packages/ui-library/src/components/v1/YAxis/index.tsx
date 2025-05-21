import React, { useEffect, useRef } from "react";
import { AxisLeft, AxisRight, AxisScale } from "@visx/axis";

import useTheme from "../../../hooks/useTheme";
import { formatNumberWithSuffix, isNumeric } from "../../../utils/number";
import { shimmerClassName } from "../../Shimmer/Shimmer";
import { shimmerGradientId } from "../../Shimmer/SvgShimmer";
import { YAxisProps } from "./types";

const MAX_LABEL_CHARS = 15; // Or however many you want before truncating

const baseFontStyles = {
  fontSize: "10px",
  fontWeight: "normal",
  letterSpacing: "0.4px",
  fontFamily: "Roboto",
};

function YAxis({
  scale,
  numTicks = 5,
  showTicks = false,
  showAxisLine = false,
  isLoading = false,
  hideAllTicks = false,
  textAnchor = "end",
  isVisible = true,
  isRightYAxis = false,
  labelProps: externalLabelProps,
  tickLabelProps: externalTickLabelProps,
  ...props
}: YAxisProps) {
  const { theme } = useTheme();
  const AxisComponent = isRightYAxis ? AxisRight : AxisLeft;
  const axis = useRef<SVGSVGElement | null>(null);

  const tickFormat = (value: number | string) => {
    if (isNumeric(value)) {
      return formatNumberWithSuffix(Number(value));
    }
    return String(value);
  };

  useEffect(() => {
    if (!isLoading && axis.current) {
      let xpos: number = Number(
        axis.current.querySelector("svg")?.getAttribute("x"),
      );
      if (isRightYAxis) {
        xpos -= 30;
      } else {
        xpos += 4;
      }
      axis.current.querySelector("svg")?.setAttribute("x", String(xpos));
    }
  }, [isLoading, axis]);

  const renderAxisLabel = (
    formattedValue: string | number | undefined,
    tickProps: React.SVGProps<SVGTextElement>,
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

    let label = String(formattedValue || "");

    // Possibly truncate
    if (label.length > MAX_LABEL_CHARS) {
      label = `${label.substring(0, MAX_LABEL_CHARS - 1)}…`;
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
    transform: isRightYAxis ? "rotate(90)" : "rotate(-90)",
  };

  const mergedTickLabelProps = {
    ...externalTickLabelProps,
    ...baseFontStyles,
    color: theme.colors.axis.label,
    fill: theme.colors.axis.label,
  };

  if (!isVisible) {
    return null;
  }

  return (
    <g id="axis" ref={axis}>
      <AxisComponent
        scale={scale as any as AxisScale}
        stroke={theme.colors.axis.line}
        tickStroke={theme.colors.axis.line}
        tickLabelProps={() => ({
          textAnchor,
          dy: "0.33em",
          ...mergedTickLabelProps,
        })}
        hideAxisLine={!showAxisLine}
        hideTicks={hideAllTicks || !showTicks}
        numTicks={numTicks}
        tickFormat={tickFormat}
        tickComponent={({ formattedValue, ...tickProps }) =>
          renderAxisLabel(formattedValue, tickProps)
        }
        labelProps={mergedLabelProps}
        {...props}
      />
    </g>
  );
}

export default YAxis;
