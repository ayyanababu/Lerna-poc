import { Typography } from '@mui/material';
import { Tooltip as VisxTooltip } from '@visx/tooltip';
import React from 'react';

import { useTheme } from '../../hooks/useTheme';
import { TooltipProps } from './types';

export function Tooltip({
  top, left, data, isVisible = true,
}: TooltipProps) {
  const { theme } = useTheme();

  if (!isVisible) return null;

  return (
    <VisxTooltip
      top={top}
      left={left}
      style={{
        position: 'fixed',
        backgroundColor: theme.colors.tooltip.background,
        color: theme.colors.tooltip.text,
        padding: '10px',
        borderRadius: '6px',
        boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
        border: `1px solid ${theme.colors.tooltip.border}`,
        fontSize: '12px',
        fontWeight: 'bold',
        pointerEvents: 'none',
        transform: 'translate(-50%, -100%)',
        whiteSpace: 'pre-line',
        transition: 'all 0.250s ease-in-out',
      }}
    >
      <Typography
        sx={{
          marginBottom: '5px',
          textAlign: 'center',
          color: theme.colors.tooltip.text,
          fontSize: '12px',
        }}
      >
        {data?.label}
      </Typography>
      <Typography
        sx={{
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: theme.colors.tooltip.text,
        }}
      >
        {data?.value}
      </Typography>
    </VisxTooltip>
  );
}