import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export const shimmerClassName = `my-lib-shimmer-${Math.random().toString(36).substring(2, 9)}`;

export const Shimmer = () => {
  const { theme } = useTheme();

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }

          .${shimmerClassName} {
            animation: shimmer 2s linear infinite;
            background: linear-gradient(
              90deg,
              ${theme.colors.common.text}22 25%,
              ${theme.colors.common.text}44 50%,
              ${theme.colors.common.text}22 75%
            );
            background-size: 200% 100%;
            position: relative;
            contain: content;
            border-radius: 8px;
            color: transparent !important;
            width: fit-content;
          }

          .${shimmerClassName} * {
            color: transparent !important;
            pointer-events: none !important;
            opacity: 0 !important;
            border-color: transparent !important;
            background-color: transparent !important;
          }
        `}
      </style>
    </>
  );
};
