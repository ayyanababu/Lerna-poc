import { Box, Typography } from '@mui/material';
import { capitalize, lowerCase } from 'lodash-es';
import React from 'react';
import useTheme from '../../hooks/useTheme';
import { shimmerClassName } from '../Shimmer/Shimmer';
import { LegendItemProps } from './types';

export default function LegendItem({
    label,
    index,
    data,
    isHidden,
    isHoveredOther,
    isLoading,
    doStrike,
    variant,
    onToggle,
    onMouseOver,
    onMouseLeave,
}: LegendItemProps) {
    const { theme } = useTheme();
    const itemStyles = {
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        userSelect: 'none',
        opacity: isHoveredOther ? 0.5 : 1,
        transition: 'all 0.3s ease',
        filter: !doStrike && isHidden ? 'grayscale(100%) opacity(0.5)' : 'none',
    };

    const markerColor = data?.[index]?.color || label.value || '#fff';
    const displayText = isLoading ? 'loading' : capitalize(lowerCase(label.datum));
    const valueText = data?.[label.index]?.value;

    const renderMarker = () => (
        <Box
            sx={{
                backgroundColor: markerColor,
                borderRadius: '20px',
                width: '12px',
                height: '12px',
            }}
            className={isLoading ? shimmerClassName : ''}
        />
    );

    const renderCompactItem = () => (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexDirection: 'row',
            }}
        >
            {renderMarker()}
            <Typography
                variant="body2"
                sx={{
                    margin: 0,
                    fontWeight: 400,
                    textDecoration: doStrike && isHidden ? 'line-through' : 'none',
                    color: theme.colors.legend.text,
                    fontSize: '12px',
                    lineHeight: '1',
                    letterSpacing: '0.4px',
                }}
                className={isLoading ? shimmerClassName : ''}
            >
                {displayText}
                {valueText && (isLoading ? 'loadingloading' : ` (${valueText})`)}
            </Typography>
        </Box>
    );

    const renderExpandedItem = () => (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexDirection: 'row',
                }}
            >
                {renderMarker()}
                <Typography
                    variant="body2"
                    sx={{
                        margin: 0,
                        fontWeight: 400,
                        textDecoration: doStrike && isHidden ? 'line-through' : 'none',
                        color: theme.colors.legend.text,
                        fontSize: '12px',
                        lineHeight: '1',
                        letterSpacing: '0.4px',
                    }}
                    className={isLoading ? shimmerClassName : ''}
                >
                    {displayText}
                </Typography>
            </Box>
            {valueText && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginTop: '4px',
                        alignItems: 'start',
                        marginLeft: '20px',
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            margin: 0,
                            fontWeight: 700,
                            color: theme.colors.legend.text,
                            fontSize: '16px',
                        }}
                        className={isLoading ? shimmerClassName : ''}
                    >
                        {isLoading ? 'loadingloading' : valueText}
                    </Typography>
                </Box>
            )}
        </>
    );

    return (
        <Box
            onClick={onToggle}
            tabIndex={0}
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseLeave}
            sx={itemStyles}
        >
            {variant === 'compact' ? renderCompactItem() : renderExpandedItem()}
        </Box>
    );
}
