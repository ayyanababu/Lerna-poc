import { Bar } from '@visx/shape';
import React from 'react';

import { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { CustomBarProps } from './types';

const CustomBar = ({
    fill,
    isVisible = true,
    isLoading = false,
    rx,
    ry,
    pathProps,
    ...props
}: CustomBarProps) => {
    if (!isVisible) {
        return null;
    }

    const barFill = isLoading ? `url(#${shimmerGradientId})` : fill;

    if (pathProps) {
        return <path {...pathProps} fill={barFill} {...props} />;
    }

    return <Bar {...props} rx={rx} ry={ry} fill={barFill} />;
};

export default CustomBar;
