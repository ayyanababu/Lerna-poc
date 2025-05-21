import React, { useEffect, useRef, useState } from "react";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";

import useTheme from "../../../hooks/useTheme";
import { capitalizeWord, formatNumberWithCommas } from "../../../utils/number";
import { LegendItemProps } from "./types";

function LegendItem({
  label,
  index = 0,
  data,
  isHidden = false,
  isHoveredOther = false,
  isLoading = false,
  doStrike = false,
  // variant = LegendVariant.COMPACT,
  onToggle,
  onMouseOver,
  onMouseLeave,
  hideValues = false,
  markerColor,
  onArrowClick,
  hideLegendLableClick = true,
  showArrow = true,
  id
}: LegendItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [labelWidth, setLabelWidth] = useState(0);
  const textElementRef = useRef<SVGTextElement>(null);

  const theme = useTheme();

  let displayText = "";
  if (isLoading) {
    displayText = "loading";
  } else if (label?.datum) {
    displayText = capitalizeWord(label.datum);
  }

  const valueText =
    data && label?.index !== undefined ? data[label.index]?.value : undefined;

  const handleMouseOver = () => {
    setIsHovered(true);
    onMouseOver?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave?.();
  };

  useEffect(() => {
    if (textElementRef.current) {
      const width = textElementRef.current.getBBox().width;
      if (width !== labelWidth) setLabelWidth(width);
    }
  }, [displayText, valueText, labelWidth]);

  const ICON_WIDTH = 16;
  const ICON_GAP = 4;
  const MARKER_SIZE = 12;
  const MARKER_GAP = 4;
  const BORDER_RADIUS = 3;

  const renderMarker = () => (
    <rect
      x={0}
      y={-MARKER_SIZE / 2 + 6}
      width={MARKER_SIZE}
      height={MARKER_SIZE}
      rx={BORDER_RADIUS}
      fill={markerColor}
      onClick={!hideLegendLableClick ? onToggle : undefined}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      style={{
        pointerEvents: "fill",
        cursor: "pointer",
        opacity: isHoveredOther ? 0.5 : 1,
        filter: !doStrike && isHidden ? "grayscale(100%) opacity(0.5)" : "none",
      }}
    />
  );

  // const handleArrowClick = (
  //   event: React.MouseEvent<SVGSVGElement, MouseEvent>,
  // ) => {
  //   onArrowClick?.(event);
  // };

  const iconX = MARKER_SIZE + MARKER_GAP + labelWidth + ICON_GAP;
  const renderText = () => (
    <>
      <g onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
        {renderMarker()}
        <text
          ref={textElementRef}
          x={MARKER_SIZE + MARKER_GAP}
          y={6}
          dy=".35em"
          fill={theme.theme.colors.legend.text}
          className="MuiTypography-root MuiTypography-caption css-19buuys-MuiTypography-root"
          onClick={!hideLegendLableClick ? onToggle : undefined}
        >
          {displayText}
          {!hideValues &&
            (isLoading
              ? ""
              : ` ${valueText ? "(" + formatNumberWithCommas(valueText) + ")" : ""}`)}
        </text>
        <foreignObject x={iconX} y="-2" width={ICON_WIDTH} height="16">
          {showArrow ? (
            <ArrowOutwardIcon
              sx={{
                height: "16px",
                width: "16px",
                color: theme.theme.colors.legend.text,
                visibility: isHovered && !isHoveredOther ? "visible" : "hidden",
                transition: "opacity 0.25s ease-in-out",
              }}
              className="arrow-icon"
              onClick={(event: React.MouseEvent<SVGSVGElement, MouseEvent>) =>
                onArrowClick?.(event)
              }
            />
          ) : (
            <div style={{ width: ICON_WIDTH, height: 16 }} />
          )}
        </foreignObject>
      </g>
    </>
  );

  return (
    <g id = {id}
      transform={`translate(0, ${index * 14})`}
      className="legendItems"
      style={{
        pointerEvents: "stroke",
        cursor: "pointer",
        opacity: isHoveredOther ? 0.5 : 1,
        filter: !doStrike && isHidden ? "grayscale(100%) opacity(0.5)" : "none",
      }}
    >
      {renderText()}
    </g>
  );
}

export { LegendItem };
export default LegendItem;
