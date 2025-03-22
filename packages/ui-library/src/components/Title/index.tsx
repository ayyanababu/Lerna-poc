import Typography from '@mui/material/Typography';
import React from 'react';
import useTheme from '../../hooks/useTheme';
import { TitleProps } from './types';

export default function Title({ title, isVisible = true, ...props }: TitleProps) {
    const { theme } = useTheme();

    if (!title || !isVisible) return null;

    return (
        <Typography
            variant="subtitle1"
            gutterBottom
            fontWeight="bold"
            color={theme.colors.common.text}
            {...props}
        >
            {title}
        </Typography>
    );
}
