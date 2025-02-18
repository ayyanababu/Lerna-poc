import Typography from '@mui/material/Typography';
import React from 'react';
// import './title.css';

export function Title({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <Typography variant="h6" gutterBottom style={{ fontSize: '0.875rem' }}>
      {title}
    </Typography>
  );
}