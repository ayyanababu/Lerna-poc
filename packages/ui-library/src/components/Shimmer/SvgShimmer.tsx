import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export const shimmerGradientId = `my-lib-shimmer-gradient-${Math.random().toString(36).substring(2, 9)}`;

export default function SvgShimmer() {
  const { theme } = useTheme();

  return (
    <defs>
      <linearGradient
        id={shimmerGradientId}
        x1="-100%"
        y1="0"
        x2="100%"
        y2="0"
        gradientUnits="userSpaceOnUse">
        <stop offset="25%" stopColor={`${theme.colors.common.text}22`} />
        <stop offset="50%" stopColor={`${theme.colors.common.text}44`} />
        <stop offset="75%" stopColor={`${theme.colors.common.text}22`} />
        <animate
          attributeName="x1"
          from="-200%"
          to="200%"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="x2"
          from="-100%"
          to="300%"
          dur="2s"
          repeatCount="indefinite"
        />
      </linearGradient>
    </defs>
  );
}
