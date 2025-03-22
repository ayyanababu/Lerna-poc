import Typography from '@mui/material/Typography';
import React from 'react';
import { shimmerClassName } from '../Shimmer/Shimmer';
import { TimestampProps } from './types';

function Timestamp({ timestamp, isVisible = true, isLoading = false }: TimestampProps) {
    if (!timestamp || !isVisible) return null;

    return (
        <Typography
            variant="caption"
            sx={{
                marginLeft: 'auto',
                marginRight: '10px',
                marginBottom: '10px',
                color: '#aaa',
            }}
            className={isLoading ? shimmerClassName : ''}
        >
            Last Update: {new Date(timestamp).toLocaleString('en-US', { timeZone: 'UTC' })}
        </Typography>
    );
}

export default Timestamp;
