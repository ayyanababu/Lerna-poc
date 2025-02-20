import Typography from '@mui/material/Typography';
import React from 'react';
// import './title.css';

export function Title({ title, ...props }: { title?: string }) {
  if (!title) return null;
  return (
    <Typography variant="subtitle1" gutterBottom fontWeight={'bold'} {...props}>
      {title}
    </Typography>
  );
}