import { WithBoundingRectsProps } from '@visx/bounds';

export interface TooltipData {
    label: string;
    value: number;
}

export interface TooltipProps extends WithBoundingRectsProps {
    top: number;
    left: number;
    data: TooltipData;
    /**
     * Whether to show the bar
     * @default true
     */
    isVisible?: boolean;
}
