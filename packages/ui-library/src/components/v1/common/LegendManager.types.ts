import { Dispatch, SetStateAction } from "react";
import { scaleOrdinal } from "@visx/scale";
import { LegendPosition, LegendsProps } from "../Legends/types";
import { DataPoint } from "./Data.types";

export interface LegendDataItem {
  label: string | undefined;
  value: number;
  color?: string | null;
}

export interface LegendManagerProps {
  legendsProps?: LegendsProps;
  position: LegendPosition | "top" | "bottom" | "left" | "right";
  legendData: LegendDataItem[];
  colorScale?: ReturnType<typeof scaleOrdinal<string, string>>;
  hideIndex: number[];
  setHideIndex: Dispatch<SetStateAction<number[]>>;
  hovered: string | null | number | undefined;
  setHovered: (label: string | number | null) => void;
  isLoading: boolean;
  isLegendRendered: (status: boolean) => void;
  generatedLegendHeight: (height: number) => void;
  generateAxis: (selectedLegends: number[]) => void;
  legendLeft: number;
  legendTopPosition: number;
  innerWidth: number;
  legendBoxHeight: number;
  calculatedLegendHeight: number;
  legendBoxWidth: number;
  chart?: string | undefined;
  eachLegendGap:number | undefined;
  onArrowClick?: (event: React.MouseEvent, data: DataPoint, legend:string | undefined, index: number) => void;  
}
