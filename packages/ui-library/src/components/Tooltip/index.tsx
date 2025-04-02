import { Typography } from '@mui/material';
import { Tooltip as VisxTooltip } from '@visx/tooltip';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { withBoundingRects } from '@visx/bounds';
import useTheme from '../../hooks/useTheme';
import { TooltipProps } from './types';

function Tooltip({ top, left, data, isVisible = true, containerRef }: TooltipProps) {
    const { theme } = useTheme();
    const [adjustedPosition, setAdjustedPosition] = useState({ top, left });

    useEffect(() => {
        if (!isVisible || top === undefined || left === undefined) {
            setAdjustedPosition({ top, left });
            return;
        }

        let adjustedTop = top;
        let adjustedLeft = left;

        if (containerRef?.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const tooltipWidth = 100;
            const tooltipHeight = 80;

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

            const MOUSE_TOP_ADJUSTMENT = 10;
            adjustedTop -= MOUSE_TOP_ADJUSTMENT;
        }

        setAdjustedPosition({ top: adjustedTop, left: adjustedLeft });
    }, [top, left, isVisible, containerRef]);

    if (!isVisible) return null;

    const tooltipContent = (
        <VisxTooltip
            top={adjustedPosition.top}
            left={adjustedPosition.left}
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
                width: '100px',
                zIndex: 9999,
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

export default withBoundingRects(Tooltip);
