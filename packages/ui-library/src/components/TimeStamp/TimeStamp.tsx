import Typography from '@mui/material/Typography';
import React from 'react';

export function TimeStamp({ date }: { date?: string }) {
  if (!date) return null;

  return (
    <Typography
      variant="caption"
      sx={{
        marginLeft: 'auto',
        marginRight: '10px',
        marginBottom: '10px',
        color: '#aaa',
      }}
    >
      Last Update: {new Date(date).toLocaleString('en-US', { timeZone: 'UTC' })}
    </Typography>
  );
}