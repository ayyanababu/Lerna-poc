export enum ChartVariant {
  VERTICALBAR = "Vertiacal Bar",
  HORIZONTALBAR = "Horizontal Bar",
  VERTICALSTACKEDBAR = "Vertical Stacked Bar",
  HORIZONTALSTACKEDBAR = "Horizontal Stacked Bar",
  BARLINE = "Bar and Line"
}

export type ChartVariantType = ChartVariant | "Vertical Bar" | "Horizontal Bar" | "Verical Stacked Bar" | "Horizontal Stacked Bar" | "Bar and Line";


export interface ChartProps {
  variant?: ChartVariantType;
}  