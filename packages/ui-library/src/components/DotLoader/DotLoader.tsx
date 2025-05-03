import React from 'react';
import { Box } from '@mui/material';
import useTheme from '../../hooks/useTheme';

interface DotLoaderProps {
    color?: string;
    size?: number;
    speed?: number;
}

const DotLoader = ({
    color = 'gray',
    size = 8,
    speed = 1.4,
}: DotLoaderProps) => {
    const { theme } = useTheme();

    const containerStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${size / 2}px`,
    };

    const dotBaseStyle: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: color ?color : `${theme.colors.common.text}a0`,
        animation: `dotSequence ${speed}s ease-in-out infinite`,
    };

    const dot1Style: React.CSSProperties = {
        ...dotBaseStyle,
        animationDelay: '0s',
    };

    const dot2Style: React.CSSProperties = {
        ...dotBaseStyle,
        animationDelay: `-${speed * 0.66}s`,
    };

    const dot3Style: React.CSSProperties = {
        ...dotBaseStyle,
        animationDelay: `-${speed * 0.33}s`,
    };

    const keyframes = `
        @keyframes dotSequence {
            0%, 100% {
                opacity: 1;
            }
            33% {
                opacity: 0.3;
            }
            66% {
                opacity: 0.3;
            }
        }
    `;

    return (
        <Box sx={containerStyle}>
            <style>{keyframes}</style>
            <Box sx={dot1Style} />
            <Box sx={dot2Style} />
            <Box sx={dot3Style} />
        </Box>
    );
};

export default DotLoader;
