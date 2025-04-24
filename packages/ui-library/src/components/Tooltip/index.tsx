import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Typography } from "@mui/material";
import { withBoundingRects } from "@visx/bounds";
import { Tooltip as VisxTooltip } from "@visx/tooltip";

import useTheme from "../../hooks/useTheme";
import { formatNumberWithCommas } from "../../utils/number";
import { TooltipProps } from "./types";

const MOUSE_OFFSET = 10;
const DEFAULT_Z_INDEX = 9999;
const MIN_TOOLTIP_WIDTH = 72;
const MAX_TOOLTIP_WIDTH = 144;
const MIN_TOOLTIP_HEIGHT = 24;

function TooltipBase({
  top,
  left,
  data,
  isVisible = true,
  containerRef,
}: TooltipProps) {
  const { theme } = useTheme();
  const [adjustedPosition, setAdjustedPosition] = useState({ top, left });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!isVisible || top === undefined || left === undefined) {
      setAdjustedPosition({ top, left });
      return;
    }

    const updatePosition = () => {
      if (!isVisible || !containerRef?.current) return;

      let adjustedTop = top;
      let adjustedLeft = left;

      try {
        const containerRect = containerRef.current.getBoundingClientRect();
        const tooltipWidth = tooltipRef.current
          ? Math.max(
              tooltipRef.current.getBoundingClientRect().width,
              MIN_TOOLTIP_WIDTH,
            )
          : MIN_TOOLTIP_WIDTH;
        const tooltipHeight = tooltipRef.current
          ? Math.max(
              tooltipRef.current.getBoundingClientRect().height,
              MIN_TOOLTIP_HEIGHT,
            )
          : MIN_TOOLTIP_HEIGHT;

        // Boundary checks
        if (left + tooltipWidth / 2 > containerRect.right) {
          adjustedLeft = containerRect.right - tooltipWidth / 2;
        }
        if (left - tooltipWidth / 2 < containerRect.left) {
          adjustedLeft = containerRect.left + tooltipWidth / 2;
        }
        if (top - tooltipHeight < containerRect.top) {
          adjustedTop = containerRect.top + tooltipHeight;
        }
        if (top > containerRect.bottom) {
          adjustedTop = containerRect.bottom;
        }

        adjustedTop -= MOUSE_OFFSET;

        setAdjustedPosition({ top: adjustedTop, left: adjustedLeft });
      } catch (error) {
        console.warn("Tooltip positioning error:", error);
        setAdjustedPosition({ top, left });
      }
    };

    // Initial update
    updatePosition();

    // Use requestAnimationFrame to avoid ResizeObserver loop errors
    const setupResizeObserver = () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      try {
        if (containerRef?.current) {
          const observer = new ResizeObserver(() => {
            window.requestAnimationFrame(() => {
              if (document.contains(containerRef.current)) {
                updatePosition();
              }
            });
          });

          observer.observe(containerRef.current);
          resizeObserverRef.current = observer;
        }
      } catch (error) {
        console.warn("ResizeObserver error:", error);
      }
    };

    const timeoutId = setTimeout(setupResizeObserver, 0);

    return () => {
      clearTimeout(timeoutId);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [top, left, isVisible, containerRef]);

  if (!isVisible || !data || data.length === 0) return null;

  const toolTipContent = (
    <VisxTooltip
      top={adjustedPosition.top}
      left={adjustedPosition.left}
      style={{
        position: "fixed",
        backgroundColor: theme.colors.tooltip.background,
        color: theme.colors.tooltip.text,
        padding: "8px",
        borderRadius: "6px",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
        border: `1px solid ${theme.colors.tooltip.border}`,
        pointerEvents: "none",
        transform: "translate(-50%, -100%)",
        whiteSpace: "pre-line",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        zIndex: DEFAULT_Z_INDEX,
        minWidth: `${MIN_TOOLTIP_WIDTH}px`,
        maxWidth: `${MAX_TOOLTIP_WIDTH}px`,
        minHeight: `${MIN_TOOLTIP_HEIGHT}px`,
        transition: "opacity 0.2s ease-in-out",
        opacity: isVisible ? 1 : 0,
      }}
      ref={tooltipRef}
      role="tooltip"
      aria-hidden={!isVisible}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {data.map((item) => (
          <Box
            key={`${item.label}-${item.value}`}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: "12px",
                height: "12px",
                backgroundColor: item.color,
                borderRadius: "50%",
                marginRight: "8px",
                aspectRatio: "1 / 1",
                flexShrink: 0,
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                width: "100%",
                columnGap: "16px",
                rowGap: "2px",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: theme.colors.tooltip.text,
                  fontFeatureSettings: "'liga' off, 'clig' off",
                  fontFamily: "Roboto",
                  fontSize: "12px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "143%",
                  letterSpacing: "0.4px",
                  flexGrow: 1,
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: theme.colors.tooltip.text,
                  fontFeatureSettings: "'liga' off, 'clig' off",
                  fontFamily: "Roboto",
                  fontSize: "13px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "150%",
                  letterSpacing: "0.25px",
                  flexShrink: 0,
                }}
              >
                {formatNumberWithCommas(item.value)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </VisxTooltip>
  );

  return createPortal(toolTipContent, document.body);
}

// Export the Tooltip component wrapped with withBoundingRects
export const Tooltip = withBoundingRects(TooltipBase);
