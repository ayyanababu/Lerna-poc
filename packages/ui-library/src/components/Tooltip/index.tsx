import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Typography } from "@mui/material";
import { withBoundingRects } from "@visx/bounds";
import { Tooltip as VisxTooltip } from "@visx/tooltip";

import useTheme from "../../hooks/useTheme";
import { TooltipProps } from "./types";

const MOUSE_OFFSET = 10;
const DEFAULT_Z_INDEX = 9999;
const MIN_TOOLTIP_WIDTH = 100;
const MIN_TOOLTIP_HEIGHT = 80;

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

  if (!isVisible) return null;

  const toolTipContent = (
    <VisxTooltip
      top={adjustedPosition.top}
      left={adjustedPosition.left}
      style={{
        position: "fixed",
        backgroundColor: theme.colors.tooltip.background,
        color: theme.colors.tooltip.text,
        padding: "10px",
        borderRadius: "6px",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
        border: `1px solid ${theme.colors.tooltip.border}`,
        fontSize: "12px",
        fontWeight: "bold",
        pointerEvents: "none",
        transform: "translate(-50%, -100%)",
        whiteSpace: "pre-line",
        zIndex: DEFAULT_Z_INDEX, // ensure tooltip is above other elements
        minWidth: `${MIN_TOOLTIP_WIDTH}px`,
        minHeight: `${MIN_TOOLTIP_HEIGHT}px`,
      }}
      ref={tooltipRef}
      role="tooltip"
      aria-hidden={!isVisible}
    >
      <Typography
        sx={{
          marginBottom: "5px",
          textAlign: "center",
          color: theme.colors.tooltip.text,
          fontSize: "12px",
        }}
      >
        {data?.label}
      </Typography>
      <Typography
        sx={{
          fontSize: "16px",
          fontWeight: "bold",
          textAlign: "center",
          color: theme.colors.tooltip.text,
        }}
      >
        {data?.value}
      </Typography>
    </VisxTooltip>
  );

  return createPortal(toolTipContent, document.body);
}

// Export the Tooltip component wrapped with withBoundingRects
export const Tooltip = withBoundingRects(TooltipBase);
