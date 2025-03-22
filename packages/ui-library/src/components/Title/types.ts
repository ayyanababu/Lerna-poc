import Typography from '@mui/material/Typography';
import { ComponentProps } from 'react';

export interface TitleProps extends ComponentProps<typeof Typography> {
    title?: string;
}
