import React, { useEffect, useRef, useState } from "react";
import {  startCase } from "lodash-es";
import { formatNumberWithCommas } from "../../utils/number";
import { LegendItemProps, LegendVariant } from "./types";
import useTheme from "../../hooks/useTheme";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";

function LegendItem({
  label,
  index = 0,
  data,
  isHidden = false,
  isHoveredOther = false,
  isLoading = false,
  doStrike = false,
  variant = LegendVariant.COMPACT,
  onToggle,
  onMouseOver,
  onMouseLeave,
  hideValues = false,
  markerColor,
  onArrowClick,
  eachLegendGap,
  showIcon,
  hideLegendLableClick = true,
  showArrow = true,
}: LegendItemProps) {
  const [, setStrikeLineX2] = useState(0);
  const [, setStrikeLineY2] = useState(0);
  const [iconPositionX, setIconPositionX] = useState(0);
  console.log("show", showIcon);

  const text_ref = useRef<SVGGElement>(null);
  const theme = useTheme();

  let displayText = "";
  if (isLoading) {
    displayText = "loading";
  } else if (label?.datum) {
    displayText = startCase(label.datum);
  }

  const valueText =
    data && label?.index !== undefined ? data[label.index]?.value : undefined;

  const renderMarker = () => (
    <circle
      cx={6}
      cy={6}
      r={6}
      fill={markerColor}
      onClick={!hideLegendLableClick ? onToggle : undefined}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      style={{
        pointerEvents: "fill",
        cursor: "pointer",
        opacity: isHoveredOther ? 0.5 : 1,
        filter: !doStrike && isHidden ? "grayscale(100%) opacity(0.5)" : "none",
      }}
    />
  );

  useEffect(() => {
    if (text_ref.current) {
      const textheight = text_ref.current.getBBox().height;
      const y = text_ref.current.getBBox().y + textheight / 2;
      setStrikeLineY2(y);
      const textwidth = text_ref.current.getBBox().width;
      const x = text_ref.current.getBBox().x + textwidth;
      setStrikeLineX2(x);
      setIconPositionX(x - 7);
    }
  }, [text_ref.current]);

  const renderText = () => (
    <>
      <g ref={text_ref} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
        <text
          x={20}
          y={6}
          dy=".35em"
          fill={theme.theme.colors.legend.text}
          className="MuiTypography-root MuiTypography-caption css-19buuys-MuiTypography-root"
          onClick={!hideLegendLableClick ? onToggle : undefined}
        >
          {displayText}
          {!hideValues &&
            (isLoading
              ? "loadingloading"
              : ` (${valueText ? formatNumberWithCommas(valueText) : ""})`)}
        </text>
        {showIcon ? (
          <foreignObject x={iconPositionX} y="-2" width="16" height="16">
            {React.createElement(
              "div",
              {
                xmlns: "http://www.w3.org/1999/xhtml",
                style: { width: "100%", height: "100%" },
              },
              showArrow && (
                <ArrowOutwardIcon
                  sx={{
                    height: "16px",
                    width: "16px",
                    color: theme.theme.colors.legend.text,
                    visibility: !isHoveredOther ? "visible" : "hidden",
                    transition: "opacity 0.25s ease-in-out",
                  }}
                  className="arrow-icon"
                  onClick={() => onArrowClick?.()}
                />
              ),
            )}
          </foreignObject>
        ) : (
          <foreignObject x={iconPositionX} y="-2" width="16" height="16">
            {React.createElement(
              "div",
              {
                xmlns: "http://www.w3.org/1999/xhtml",
                style: { width: "100%", height: "100%" },
              },
              showArrow && (
                <ArrowOutwardIcon
                  sx={{
                    height: "16px",
                    width: "16px",
                    color: theme.theme.colors.legend.text,
                    visibility: "hidden",
                    transition: "opacity 0.250s ease-in-out",
                  }}
                  className="arrow-icon"
                  onClick={() => onArrowClick?.()}
                />
              ),
            )}
          </foreignObject>
        )}
      </g>
    </>
  );

  return (
    <g
      transform={`translate(0, ${eachLegendGap ? index * eachLegendGap : 0})`}
      className="legendItems"
      style={{
        pointerEvents: "stroke",
        cursor: "pointer",
        opacity: isHoveredOther ? 0.5 : 1,
        filter: !doStrike && isHidden ? "grayscale(100%) opacity(0.5)" : "none",
      }}
    >
      {renderMarker()}
      {renderText()}
    </g>
  );
}

export { LegendItem };
export default LegendItem;
