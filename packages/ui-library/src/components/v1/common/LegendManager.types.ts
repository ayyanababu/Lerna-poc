import { scaleOrdinal } from "d3";

import { LegendPosition, LegendsProps } from "../Legends/types";

export interface LegendDataItem {
  label: string;
  value: number;
}

export interface LegendManagerProps {
  legendsProps?: LegendsProps;
  position: LegendPosition | "top" | "bottom" | "left" | "right";
  legendData: LegendDataItem[];
  colorScale?: ReturnType<typeof scaleOrdinal<string, string>>;
  hideIndex: number[];
  setHideIndex: (indices: number[]) => void;
  hovered: string | null;
  setHovered?: (label: string) => void;
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
