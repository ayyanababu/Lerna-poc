import Typography from '@mui/material/Typography';
import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export interface TitleProps extends React.ComponentProps<typeof Typography> {
  title?: string;
}

export function Title({ title, ...props }: TitleProps) {
  const { theme } = useTheme();

  if (!title) return null;
  return (
    <Typography
      variant="subtitle1"
      gutterBottom
      fontWeight={'bold'}
      color={theme.colors.common.text}
      {...props}>
      {title}
    </Typography>
  );
}