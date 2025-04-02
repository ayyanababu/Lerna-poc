import React from 'react';

import useTheme from '../../hooks/useTheme';
import { GridProps } from './types';

const Grid: React.FC<GridProps> = ({
    width = 0,
    height = 0,
    xScale,
    yScale,
    numTicks = 5,
    showHorizontal = true,
    showVertical = false,
    opacity = 0.3,
    isVisible = false,
}) => {
    const { theme } = useTheme();

    if (!isVisible) {
        return null;
    }

    return (
        <g>
            {/* Horizontal grid lines */}
            {showHorizontal && yScale && (
                <>
                    {yScale.ticks(numTicks).map((tick) => (
                        <line
                            key={`horizontal-${tick}`}
                            x1={0}
                            x2={width}
                            y1={yScale(tick)}
                            y2={yScale(tick)}
                            stroke={theme.colors.axis.grid}
                            strokeDasharray="2,2"
                            opacity={opacity}
                        />
                    ))}
                </>
            )}

            {/* Vertical grid lines */}
            {showVertical && xScale && (
                <>
                    {xScale.ticks(numTicks).map((tick) => (
                        <line
                            key={`vertical-${tick}`}
                            x1={xScale(tick)}
                            x2={xScale(tick)}
                            y1={0}
                            y2={height}
                            stroke={theme.colors.axis.grid}
                            strokeDasharray="2,2"
                            opacity={opacity}
                        />
                    ))}
                </>
            )}
        </g>
    );
};

export default Grid;
