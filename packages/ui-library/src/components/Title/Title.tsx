import Typography from '@mui/material/Typography';
import React from 'react';

export interface TitleProps extends React.ComponentProps<typeof Typography> {
  title?: string;
}

export function Title({ title, ...props }: TitleProps) {
  if (!title) return null;
  return (
    <Typography variant="subtitle1" gutterBottom fontWeight={'bold'} {...props}>
      {title}
    </Typography>
  );
}