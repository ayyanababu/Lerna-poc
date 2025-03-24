import Box from '@mui/material/Box';
import { LegendOrdinal } from '@visx/legend';
import React, { useCallback, useMemo } from 'react';
import useTheme from '../../hooks/useTheme';
import LegendItem from './LegendItem';
import { LegendsProps, LegendVariant } from './types';

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
    variant = LegendVariant.COMPACT,
}: LegendsProps) {
    const { theme } = useTheme();

    const positionStyles = useMemo(() => {
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
            case 'top':
            default:
                return {};
        }
    }, [position]);

    const flexDirection = position === 'left' || position === 'right' ? 'column' : 'row';

    const handleToggleItem = useCallback(
        (index, labelText) => {
            setHideIndex((prev) =>
                prev.includes(index) ? prev.filter((idx) => idx !== index) : [...prev, index],
            );

            if (onClick) {
                onClick(data, labelText, index);
            }
        },
        [data, onClick, setHideIndex],
    );

    const handleMouseOver = useCallback(
        (labelText) => {
            setHovered(labelText);
        },
        [setHovered],
    );

    const handleMouseLeave = useCallback(() => {
        setHovered(null);
    }, [setHovered]);

    if (!data || !colorScale || !setHideIndex || !setHovered || !isVisible) {
        return null;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection,
                flexWrap: 'wrap',
                gap: variant === 'compact' ? '8px' : '12px',
                backgroundColor: theme.colors.legend.background,
                borderRadius: '4px',
                ...positionStyles,
            }}
        >
            <LegendOrdinal scale={colorScale} direction={flexDirection} labelMargin="0 0 0 0">
                {(labels) => (
                    <>
                        {labels.map((label, index) => {
                            if (index > data.length - 1) {
                                return null;
                            }

                            const isHidden = hideIndex.includes(index);
                            const isHoveredOther = hovered && !hovered.includes(label.text);

                            return (
                                <LegendItem
                                    key={`legend-${label.text}-${label.value}`}
                                    label={label}
                                    index={index}
                                    data={data}
                                    isHidden={isHidden}
                                    isHoveredOther={isHoveredOther}
                                    isLoading={isLoading}
                                    doStrike={doStrike}
                                    variant={variant}
                                    onToggle={() => handleToggleItem(index, label.text)}
                                    onMouseOver={() => handleMouseOver(label.text)}
                                    onMouseLeave={handleMouseLeave}
                                />
                            );
                        })}
                    </>
                )}
            </LegendOrdinal>
        </Box>
    );
}
