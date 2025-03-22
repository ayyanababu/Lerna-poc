import { Bar as VisxBar } from '@visx/shape';
import React from 'react';
import { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { CustomBarProps } from './types';

const CustomBar = ({ fill, isVisible, isLoading = false, ...props }: CustomBarProps) => {
    if (!isVisible) {
        return null;
    }

    return <VisxBar {...props} fill={isLoading ? `url(#${shimmerGradientId})` : fill} />;
};

export default CustomBar;
