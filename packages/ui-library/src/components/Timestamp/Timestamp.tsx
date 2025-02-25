import Typography from '@mui/material/Typography';
import React, { FC } from 'react';
import { shimmerClassName } from '../Shimmer/Shimmer';

export interface TimestampProps {
  timestamp?: string;
  isLoading?: boolean;
}

export const Timestamp: FC<TimestampProps> = ({
  timestamp,
  isLoading = false,
}) => {
  if (!timestamp) return null;

  return (
    <Typography
      variant="caption"
      sx={{
        marginLeft: 'auto',
        marginRight: '10px',
        marginBottom: '10px',
        color: '#aaa',
      }}
      className={isLoading ? shimmerClassName : ''}>
      Last Update:{' '}
      {new Date(timestamp).toLocaleString('en-US', { timeZone: 'UTC' })}
    </Typography>
  );
};
