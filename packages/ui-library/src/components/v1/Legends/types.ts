import { Dispatch, SetStateAction } from "react";
import { scaleOrdinal } from "@visx/scale";

import { DataPoint } from "../common/Data.types";
import { LegendDataItem } from "../common/LegendManager.types";

export enum LegendVariant {
  COMPACT = "compact",
  EXPANDED = "expanded",
}

export enum LegendPosition {
  TOP = "top",
  BOTTOM = "bottom",
  LEFT = "left",
  RIGHT = "right",
}

export type LegendVariantType = LegendVariant | "compact" | "expanded";
export type LegendPositionType =
  | LegendPosition
  | "top"
  | "bottom"
  | "left"
  | "right";

export type LegendData = LegendDataItem[];

export interface LegendLabel {
  text: string | undefined;
  value?: string;
  datum: string | undefined;
  index: number;
}

export interface LegendsProps {
  colorScale?: ReturnType<typeof scaleOrdinal<string, string>>;
  data?: LegendData;
  hideIndex?: number[];
  setHideIndex?: Dispatch<SetStateAction<number[]>>;
  hovered?: string | null | number | undefined;
  setHovered?: (label: string | number | null) => void;
  position?: LegendPositionType;
  onArrowClick?: (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>,
    data: DataPoint,
    legend: string | undefined,
    index: number,
  ) => void;
  isLoading?: boolean;
  doStrike?: boolean;
  isVisible?: boolean;
  variant?: LegendVariantType;
  hideValues?: boolean;
  isLegendRendered?: (renderedStautus: boolean) => void;
  eachLegendGap?: number;
  scrollbarAfter?: number;
  legendsHeight?: number;
  generatedLegendHeight?: (height: number) => void;
  generateAxis?: (selectedLegends: number[]) => void;
  legendBoxWidth?: number;
  hideLegendLableClick?: boolean;
  showArrow?: boolean;
  chart?: string | undefined;
}

export interface LegendItemProps {
  label?: LegendLabel;
  index?: number;
  data?: LegendData;
  isHidden?: boolean;
  isHoveredOther?: boolean;
  isLoading?: boolean;
  doStrike?: boolean;
  variant?: LegendVariantType;
  onToggle?: () => void;
  onMouseOver?: () => void;
  onMouseLeave?: () => void;
  hideValues?: boolean;
  onArrowClick?: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  markerColor: string;
  eachLegendGap?: number;
  generateAxis?: (selectedLegends: number[]) => void;
  showArrow?: boolean;
  showIcon?: boolean;
  hideLegendLableClick?: boolean;
}
