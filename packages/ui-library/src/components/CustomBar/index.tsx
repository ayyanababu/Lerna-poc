import React from "react";
import { Bar } from "@visx/shape";

import { shimmerGradientId } from "../Shimmer/SvgShimmer";
import { CustomBarProps } from "./types";

const CustomBar = ({
  fill,
  isVisible = true,
  isLoading = false,
  rx,
  ry,
  pathProps,
  style,
  ...props
}: CustomBarProps) => {
  if (!isVisible) {
    return null;
  }

  const barFill = isLoading ? `url(#${shimmerGradientId})` : fill;

  if (pathProps && pathProps.d) {
    return <path {...pathProps} fill={barFill} {...props} />;
  }

  return <Bar {...props} rx={rx} ry={ry} fill={barFill} style-{...style} />;
};

export default CustomBar;
