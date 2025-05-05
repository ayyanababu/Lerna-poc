import React, { useCallback, useMemo } from "react";
import { SxProps, Theme } from "@mui/material";
import Box from "@mui/material/Box";
import { LegendOrdinal } from "@visx/legend";

import useTheme from "../../hooks/useTheme";
import LegendItem from "./LegendItem";
import { LegendPosition, LegendsProps, LegendVariant } from "./types";

function Legends({
  colorScale,
  data,
  hideIndex,
  setHideIndex,
  hovered,
  setHovered,
  position = LegendPosition.TOP,
  onClick,
  isLoading = false,
  doStrike = false,
  isVisible = true,
  variant = LegendVariant.COMPACT,
  hideValues = false,
  hideLegendLableClick = true,
  showArrow = true,
}: LegendsProps) {
  const { theme } = useTheme();

  const positionStyles = useMemo((): SxProps<Theme> => {
    switch (position) {
      case "left":
        return {
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          maxWidth: "150px",
        };
      case "right":
        return {
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          maxWidth: "150px",
        };
      case "bottom":
      case "top":
      default:
        return {};
    }
  }, [position]);

  const flexDirection =
    position === "left" || position === "right" ? "column" : "row";

  const handleToggleItem = useCallback(
    (index: number) => {
      if (setHideIndex && hideIndex) {
        setHideIndex((prev) =>
          prev.includes(index)
            ? prev.filter((idx) => idx !== index)
            : [...prev, index],
        );
      }
    },
    [data, setHideIndex, hideIndex],
  );

  const handleMouseOver = useCallback(
    (labelText: string) => {
      if (setHovered) {
        setHovered(labelText);
      }
    },
    [setHovered],
  );

  const handleMouseLeave = useCallback(() => {
    if (setHovered) {
      setHovered(null);
    }
  }, [setHovered]);

  if (!data || !colorScale || !setHideIndex || !setHovered || !isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection,
        flexWrap: "wrap",
        gap: variant === "compact" ? "8px" : "8px",
        backgroundColor: theme.colors.legend.background,
        borderRadius: "4px",
        zIndex: 9999,
        ...positionStyles,
      }}
    >
      <LegendOrdinal
        scale={colorScale}
        direction={flexDirection}
        labelMargin="0 0 0 0"
      >
        {(labels) => (
          <>
            {labels.map((label, index) => {
              if (index > data.length - 1) {
                return null;
              }

              const isHidden = hideIndex?.includes(index);
              const isHoveredOther = hovered && !hovered.includes(label.text);

              return (
                <LegendItem
                  key={`legend-${label.text}-${label.value}`}
                  label={label}
                  index={index}
                  data={data}
                  isHidden={isHidden}
                  isHoveredOther={!!isHoveredOther}
                  isLoading={isLoading}
                  doStrike={doStrike}
                  variant={variant}
                  onToggle={() => handleToggleItem(index)}
                  onMouseOver={() => handleMouseOver(label.text)}
                  onMouseLeave={handleMouseLeave}
                  hideValues={hideValues}
                  onArrowClick={() => {
                    if (onClick && data) {
                      onClick(data, label.text, index);
                    }
                  }}
                  hideLegendLableClick={hideLegendLableClick}
                  showArrow={showArrow}
                />
              );
            })}
          </>
        )}
      </LegendOrdinal>
    </Box>
  );
}

Legends.displayName = "Legends";
Legends.Position = LegendPosition;
Legends.Variant = LegendVariant;

export default Legends;
