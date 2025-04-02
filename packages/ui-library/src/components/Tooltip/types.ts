export interface TooltipData {
    label: string;
    value: number | string;
}

export interface TooltipProps {
    top?: number;
    left?: number;
    data?: TooltipData;
    isVisible?: boolean;
    containerRef?: React.RefObject<HTMLElement>;
}
