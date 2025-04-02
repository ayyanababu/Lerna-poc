import { Typography } from '@mui/material';
import { Tooltip as VisxTooltip } from '@visx/tooltip';
import React from 'react';
import ReactDOM from 'react-dom';

import useTheme from '../../hooks/useTheme';
import { TooltipProps } from './types';

export default function Tooltip({ top, left, data, isVisible = true }: TooltipProps) {
    const { theme } = useTheme();

    if (!isVisible) return null;

    const tooltipContent = (
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
                width: '100px',
                zIndex: 9999, // Ensure tooltip is above other elements
            }}
        >
            <Typography
                sx={{
                    marginBottom: '5px',
                    textAlign: 'center',
                    color: theme.colors.tooltip.text,
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
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
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {data?.value}
            </Typography>
        </VisxTooltip>
    );

    return ReactDOM.createPortal(tooltipContent, document.body);
}
