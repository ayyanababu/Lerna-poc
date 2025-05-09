import { LegendPosition } from '../../components/RLegends/types';

export interface LegendDataItem {
  label: string;
  value: any;
}

export interface LegendManagerProps {
  legendsProps?: any;
  position: LegendPosition | "top" | "bottom" | "left" | "right";
  legendData: LegendDataItem[];
  colorScale: (index: string) => string;
  hideIndex: number[];
  setHideIndex: (indices: number[]) => void;
  hovered: string | null;
  setHovered: (label: string) => void;
  isLoading: boolean;
  isLegendRendered: (status: boolean) => void;
  generatedLegendHeight: (height: number) => void;
  generateAxis: (selectedLegends: number[]) => void;
  legendLeft: number;
  legendTopPosition: number;
  innerWidth: number;
  legendHeight: number;
  calculatedLegendHeight: number;
  legendBoxWidth: number;
}