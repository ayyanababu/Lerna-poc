import { AxisLeft, AxisRight } from '@visx/axis';
import React from 'react';

import useTheme from '../../hooks/useTheme';
import { shimmerClassName } from '../Shimmer/Shimmer';
import { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { YAxisProps } from './types';

function YAxis({
    scale,
    numTicks = 5,
    showTicks = false,
    showAxisLine = true,
    isLoading = false,
    hideAllTicks = false,
    textAnchor = 'end',
    isVisible = true,
    isRightYAxis = false,
    ...props
}: YAxisProps) {
    const { theme } = useTheme();
    const AxisComponent = isRightYAxis ? AxisRight : AxisLeft;

    const renderAxisLabel = (
        formattedValue: string | number | undefined,
        tickProps: React.SVGProps<SVGTextElement>,
    ) => {
        const label =
            typeof formattedValue === 'string' && formattedValue.length > 6
                ? `${formattedValue.substring(0, 6)}...`
                : formattedValue;

        return (
            <text
                {...tickProps}
                className={`${isLoading ? shimmerClassName : ''}`}
                fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
                style={{
                    fontSize: '12px',
                }}
            >
                {isLoading ? '' : label}
            </text>
        );
    };

    if (!isVisible) {
        return null;
    }

    return (
        <AxisComponent
            scale={scale}
            stroke={theme.colors.axis.line}
            tickStroke={theme.colors.axis.line}
            tickLabelProps={() => ({
                fill: theme.colors.axis.label,
                fontSize: '12px',
                textAnchor,
                dy: '0.33em',
            })}
            hideAxisLine={!showAxisLine}
            hideTicks={hideAllTicks || !showTicks}
            numTicks={numTicks}
            tickComponent={({ formattedValue, ...tickProps }) =>
                renderAxisLabel(formattedValue, tickProps)
            }
            {...props}
        />
    );
}

export default YAxis;
