import React from "react";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import { Box, Typography } from "@mui/material";
import { capitalize, lowerCase } from "lodash-es";

import useTheme from "../../hooks/useTheme";
import { formatNumberWithCommas } from "../../utils/number";
import { shimmerClassName } from "../Shimmer/Shimmer";
import { LegendItemProps, LegendVariant } from "./types";

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
}: LegendItemProps) {
  const { theme } = useTheme();
  const itemStyles = {
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    userSelect: "none",
    opacity: isHoveredOther ? 0.5 : 1,
    transition: "all 0.3s ease",
    filter: !doStrike && isHidden ? "grayscale(100%) opacity(0.5)" : "none",
  };

  const markerColor =
    (data && index !== undefined && data[index]?.color) ||
    label?.value ||
    "#fff";

  let displayText = "";
  if (isLoading) {
    displayText = "loading";
  } else if (label?.datum) {
    displayText = capitalize(lowerCase(label.datum));
  }

  const valueText =
    data && label?.index !== undefined ? data[label.index]?.value : undefined;

  const renderMarker = () => (
    <Box
      sx={{
        backgroundColor: markerColor,
        borderRadius: "20px",
        width: "12px",
        height: "12px",
      }}
      className={isLoading ? shimmerClassName : ""}
    />
  );

  const renderCompactItem = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        flexDirection: "row",
        "&:hover .arrow-icon": {
          opacity: 1,
        },
        "&:focus-visible .arrow-icon": {
          opacity: 1,
        },
        "&:focus .arrow-icon": {
          opacity: 1,
        },
        "&:active .arrow-icon": {
          opacity: 0.7,
        },
      }}
    >
      {renderMarker()}
      <Typography
        variant="caption"
        sx={{
          margin: 0,
          textDecoration: doStrike && isHidden ? "line-through" : "none",
          color: theme.colors.legend.text,
          lineHeight: "normal",
          letterSpacing: "0.4px",
          paddingTop: "1px",
        }}
        className={isLoading ? shimmerClassName : ""}
      >
        {displayText}
        {!hideValues &&
          valueText &&
          (isLoading
            ? "loadingloading"
            : ` (${formatNumberWithCommas(valueText)})`)}
      </Typography>
      <ArrowOutwardIcon
        className="arrow-icon"
        sx={{
          height: "16px",
          width: "16px",
          color: theme.colors.legend.text,
          opacity: 0,
          transition: "opacity 0.250s ease-in-out",
        }}
      />
    </Box>
  );

  const renderExpandedItem = () => (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexDirection: "row",
        }}
      >
        {renderMarker()}
        <Typography
          variant="caption"
          sx={{
            margin: 0,
            textDecoration: doStrike && isHidden ? "line-through" : "none",
            color: theme.colors.legend.text,
            lineHeight: "normal",
            letterSpacing: "0.4px",
            paddingTop: "1px",
          }}
          className={isLoading ? shimmerClassName : ""}
        >
          {displayText}
        </Typography>
      </Box>
      {!hideValues && valueText && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            marginTop: "4px",
            alignItems: "start",
            marginLeft: "20px",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              margin: 0,
              fontWeight: 700,
              color: theme.colors.legend.text,
            }}
            className={isLoading ? shimmerClassName : ""}
          >
            {isLoading ? "loadingloading" : formatNumberWithCommas(valueText)}
          </Typography>
          <ArrowOutwardIcon
            sx={{
              height: "16px",
              width: "16px",
              color: theme.colors.legend.text,
              opacity: 0,
              transition: "opacity 0.250s ease-in-out",
            }}
          />
        </Box>
      )}
    </>
  );

  return (
    <Box
      onClick={onToggle}
      tabIndex={0}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      sx={itemStyles}
    >
      {variant === "compact" ? renderCompactItem() : renderExpandedItem()}
    </Box>
  );
}

export { LegendItem };
export default LegendItem;
