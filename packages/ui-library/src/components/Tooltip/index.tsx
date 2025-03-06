import { Typography } from '@mui/material';
import { withBoundingRects } from '@visx/bounds';
import { Tooltip as VisxTooltip } from '@visx/tooltip';
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { TooltipProps } from './types.d';

function Tooltip({ top, left, data, isVisible = true }: TooltipProps) {
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
        fontSize: theme.typography.fontSize.small,
        fontWeight: theme.typography.fontWeight.bold,
        pointerEvents: 'none',
        transform: 'translate(-50%, -100%)',
        whiteSpace: 'nowrap',
        transition: 'all 0.250s ease-in-out',
      }}
    >
      <Typography
        sx={{
          marginBottom: '5px',
          textAlign: 'center',
          color: theme.colors.tooltip.text,
          fontSize: theme.typography.fontSize.small,
        }}
      >
        {data.label}
      </Typography>
      <Typography
        sx={{
          fontSize: theme.typography.fontSize.medium,
          fontWeight: theme.typography.fontWeight.bold,
          textAlign: 'center',
          color: theme.colors.tooltip.text,
        }}
      >
        {data.value}
      </Typography>
    </VisxTooltip>
  );
}

export default withBoundingRects(Tooltip);