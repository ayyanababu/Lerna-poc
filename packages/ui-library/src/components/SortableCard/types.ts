import { ReactNode } from 'react';

export interface SortableCardProps {
    children: ReactNode;
    title?: string;
    height: number | string;
    width: number | string;
}
