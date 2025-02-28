export interface TooltipData {
  label: string;
  value: number;
}

export interface TooltipProps {
  top: number;
  left: number;
  data: TooltipData;
  isVisible?: boolean;
}
