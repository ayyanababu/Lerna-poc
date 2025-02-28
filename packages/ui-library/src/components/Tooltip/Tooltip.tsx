import { Typography } from '@mui/material';
import { Tooltip as VisxTooltip } from '@visx/tooltip';
import React from 'react';
import { TooltipProps } from './types';

export function Tooltip({ top, left, data, isVisible = true }: TooltipProps) {
  if (!isVisible) return null;

  return (
    <VisxTooltip
      top={top}
      left={left}
      style={{
        position: 'fixed',
        backgroundColor: 'white',
        color: '#333',
        padding: '10px',
        borderRadius: '6px',
        boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
        border: '1px solid #ddd',
        fontSize: '12px',
        fontWeight: 'bold',
        pointerEvents: 'none',
        transform: 'translate(-50%, -100%)',
        whiteSpace: 'nowrap',
        transition: 'all 0.250s ease-in-out',
      }}>
      <Typography sx={{ marginBottom: '5px', textAlign: 'center' }}>
        {data.label}
      </Typography>
      <Typography
        sx={{
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
        {data.value}
      </Typography>
    </VisxTooltip>
  );
}
