import { scaleOrdinal } from '@visx/scale';
import React, { SetStateAction } from 'react';

export type LegendData = { label: string; value: number; color?: string }[];

export type LegendPosition = 'top' | 'bottom' | 'left' | 'right';

export interface LegendsProps {
  colorScale: ReturnType<typeof scaleOrdinal<string, string>>;
  data: LegendData;
  hideIndex: number[];
  setHideIndex: React.Dispatch<SetStateAction<number[]>>;
  hovered: string | null | undefined;
  setHovered: React.Dispatch<SetStateAction<string | null | undefined>>;
  direction?: 'row' | 'column';
  position?: LegendPosition;
  onClick?: (data: LegendData, legend: string, index: number) => void;
  isLoading?: boolean;
  doStrike?: boolean;
}
