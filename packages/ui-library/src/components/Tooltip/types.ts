import { WithBoundingRectsProps } from "@visx/bounds";


export interface TooltipData {
  label: string;
  value: number | string;
  color?: string;
}

export interface TooltipProps extends WithBoundingRectsProps {
  top?: number;
  left?: number;
  data?: TooltipData[];
  isVisible?: boolean;
  containerRef?: React.RefObject<HTMLElement>; 
}
