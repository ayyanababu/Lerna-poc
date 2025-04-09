import React, { useMemo, useState } from "react";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";

import useTheme from "../../hooks/useTheme";
import { ChartWrapper } from "../ChartWrapper";
import CustomBar from "../CustomBar";
import Grid from "../Grid";
import SvgShimmer from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import XAxis from "../XAxis";
import YAxis from "../YAxis";
import { mockHorizontalBarChartData } from "./mockdata";
import { DataPoint, HorizontalBarChartProps } from "./types";

const DEFAULT_MARGIN = {
  top: 20,
  right: 20, // Reduced from 50 to 20
  bottom: 20,
  left: 70 // Increased from 50 to 70
};
const DEFAULT_BAR_RADIUS = 4;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.02; // Reduced from 1.1 to 1.02
const MAX_BAR_HEIGHT = 16; // Bar thickness

interface DynamicMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Helper: measure the widest label in pixels using a hidden <canvas>
 */
function getMaxLabelWidth(labels: string[], font = '10px sans-serif') {
  if (labels.length === 0) return 0;
  // Create an offscreen canvas to measure text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  ctx.font = font;
  let maxWidth = 0;
  labels.forEach((label) => {
    const { width } = ctx.measureText(label);
    if (width > maxWidth) maxWidth = width;
  });
  return maxWidth;
}

/**
 * Truncate label to 15 chars (same logic as YAxis uses),
 * so we measure the same truncated version.
 */
function truncateLabel(rawLabel: string, maxChars = 15) {
  if (rawLabel.length <= maxChars) return rawLabel;
  return `${rawLabel.substring(0, maxChars)}…`;
}

/**
 * HorizontalBarChart component that renders a simple horizontal bar chart
 */
const HorizontalBa
