import { OmittedTooltipProps } from "../ChartWrapper/types";
import { LegendData, LegendItem, LegendsProps } from "../Legends/types";
import { TitleProps } from "../Title/types";

export type DonutDateItem = LegendItem;

export interface DonutData extends LegendData {
  _donutSpecific?: never;
}

export interface DonutTooltipProps extends OmittedTooltipProps {
  _tooltipSpecific?: never;
}

export interface DonutChartProps {
  data: DonutDateItem[];
  type?: "full" | "semi";
  hideLabels?: boolean;
  title?: string;
  timestamp?: string;
  colors?: string[];
  isLoading?: boolean;
  titleProps?: TitleProps;
  legendsProps?: LegendsProps;
  tooltipProps?: DonutTooltipProps;
  arcGap?: number;
  arcRadius?: number;
  onClick?: (
    event: React.MouseEvent<SVGGElement, MouseEvent>,
    data: DonutDateItem,
    index: number,
  ) => void;
}
