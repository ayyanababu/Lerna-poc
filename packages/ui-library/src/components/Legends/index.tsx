import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LegendOrdinal } from '@visx/legend';
import { capitalize, lowerCase } from 'lodash-es';
import React from 'react';
import useTheme from '../../hooks/useTheme';
import { shimmerClassName } from '../Shimmer/Shimmer';
import { LegendsProps } from './types';

export default function Legends({
    colorScale,
    data,
    hideIndex,
    setHideIndex,
    hovered,
    setHovered,
    position = 'top',
    onClick = () => {},
    isLoading = false,
    doStrike = false,
    isVisible = true,
    variant = 'compact',
}: LegendsProps) {
    const { theme } = useTheme();

    if (!data || !colorScale || !setHideIndex || !setHovered || !isVisible) return null;

    const getFlexDirection = () => {
        if (position === 'left' || position === 'right') return 'column';
        return 'row';
    };

    const getPosition = () => {
        switch (position) {
            case 'left':
                return {
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    maxWidth: '150px',
                };
            case 'right':
                return {
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    maxWidth: '150px',
                };
            case 'bottom':
                return {};
            default: // top
                return {};
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: getFlexDirection(),
                flexWrap: 'wrap',
                gap: variant === 'compact' ? '8px' : '12px',
                backgroundColor: theme.colors.legend.background,
                borderRadius: '4px',
                ...getPosition(),
            }}
        >
            <LegendOrdinal scale={colorScale} direction={getFlexDirection()} labelMargin="0 0 0 0">
                {(labels) => (
                    <>
                        {labels.map((label, index) => {
                            if (index > data.length - 1) {
                                return null;
                            }

                            return (
                                <Box
                                    key={label.index}
                                    onClick={() => {
                                        setHideIndex((prev) =>
                                            prev.includes(index)
                                                ? prev.filter((idx) => idx !== index)
                                                : [...prev, index],
                                        );

                                        if (onClick) {
                                            onClick(data, label.text, index);
                                        }
                                    }}
                                    tabIndex={0}
                                    onMouseOver={() => {
                                        setHovered(label.text);
                                    }}
                                    onMouseLeave={() => {
                                        setHovered(null);
                                    }}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        opacity:
                                            hovered && !hovered?.includes(label.text) ? 0.5 : 1,
                                        transition: 'all 0.3s ease',
                                        filter:
                                            !doStrike && hideIndex.includes(index)
                                                ? 'grayscale(100%) opacity(0.5)'
                                                : 'none',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: variant === 'compact' ? '4px' : '8px',
                                            flexDirection: 'row',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                backgroundColor:
                                                    data?.[index]?.color || label.value || '#fff',

                                                borderRadius: '20px',
                                                width: '12px',
                                                height: '12px',
                                            }}
                                            className={`${isLoading ? shimmerClassName : ''}`}
                                        />

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                margin: 0,
                                                fontWeight: 400,
                                                textDecoration:
                                                    doStrike && hideIndex.includes(index)
                                                        ? 'line-through'
                                                        : 'none',
                                                color: theme.colors.legend.text,
                                                fontSize: '12px',
                                                lineHeight: '1',
                                                letterSpacing: '0.4px',
                                            }}
                                            className={`${isLoading ? shimmerClassName : ''}`}
                                        >
                                            {isLoading
                                                ? `${'loading'.repeat(1)}`
                                                : capitalize(lowerCase(label.datum))}

                                            {variant === 'compact' &&
                                                data?.[label.index]?.value &&
                                                (isLoading
                                                    ? `${'loading'.repeat(2)}`
                                                    : ` (${data?.[label?.index]?.value})`)}
                                        </Typography>
                                    </Box>

                                    {variant === 'expanded' && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                marginTop: '4px',
                                                alignItems: 'start',
                                                marginLeft: '20px',
                                            }}
                                        >
                                            {data?.[label.index]?.value && (
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        margin: 0,
                                                        fontWeight: 700,
                                                        color: theme.colors.legend.text,
                                                        fontSize: '16px',
                                                    }}
                                                    className={`${isLoading ? shimmerClassName : ''}`}
                                                >
                                                    {isLoading
                                                        ? `${'loading'.repeat(2)}`
                                                        : data?.[label?.index]?.value}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </>
                )}
            </LegendOrdinal>
        </Box>
    );
}
