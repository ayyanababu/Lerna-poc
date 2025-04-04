import { Bar } from '@visx/shape';
import React from 'react';

import { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { CustomBarProps } from './types';

function CustomBar({
    fill,
    isVisible = true,
    isLoading = false,
    rx,
    ry,
    pathProps,
    ...props
}: CustomBarProps) {
    if (!isVisible) {
        return null;
    }

    const barFill = isLoading ? `url(#${shimmerGradientId})` : fill;

    if (pathProps) {
        return <path {...pathProps} fill={barFill} {...props} />;
    }

    return <Bar {...props} rx={rx} ry={ry} fill={barFill} />;
}

/**
 * Custom Bar Cap roundness generator
 */
function getRoundedTop({
    barX,
    barY,
    barHeight,
    barWidth,
    barRadius,
}: {
    barX: number;
    barY: number;
    barHeight: number;
    barWidth: number;
    barRadius: number;
}): string {
    return `
        M ${barX},${barY + barHeight}
        L ${barX + barWidth},${barY + barHeight}
        L ${barX + barWidth},${barY + barRadius}
        Q ${barX + barWidth},${barY} ${barX + barWidth - barRadius},${barY}
        L ${barX + barRadius},${barY}
        Q ${barX},${barY} ${barX},${barY + barRadius}
        L ${barX},${barY + barHeight}
        Z
    `;
}

function getRoundedRight({
    barX,
    barY,
    barHeight,
    barWidth,
    barRadius,
}: {
    barX: number;
    barY: number;
    barHeight: number;
    barWidth: number;
    barRadius: number;
}): string {
    return `
        M ${barX},${barY + barHeight}
        L ${barX + barWidth},${barY + barHeight}
        L ${barX + barWidth},${barY + barRadius}
        Q ${barX + barWidth},${barY} ${barX + barWidth - barRadius},${barY}
        L ${barX + barWidth - barRadius},${barY}
        Q ${barX + barWidth},${barY} ${barX + barWidth},${barY + barRadius}
        L ${barX},${barY + barHeight}
        Z
    `;
}

CustomBar.displayName = 'CustomBar';
CustomBar.PathProps = { getRoundedTop, getRoundedRight };

export default CustomBar;
