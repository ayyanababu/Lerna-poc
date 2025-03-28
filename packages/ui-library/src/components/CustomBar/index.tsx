import { Bar } from '@visx/shape';
import React from 'react';

import { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { CustomBarProps } from './types';

const CustomBar = ({ fill, isVisible = true, isLoading = false, ...props }: CustomBarProps) => {
    if (!isVisible) {
        return null;
    }

    return <Bar {...props} fill={isLoading ? `url(#${shimmerGradientId})` : fill} />;
};

export default CustomBar;