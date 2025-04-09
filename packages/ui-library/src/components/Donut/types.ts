import { OmittedTooltipProps } from "../ChartWrapper/types";
import { LegendData, LegendsProps } from "../Legends/types";
import { TitleProps } from "../Title/types";

export interface DonutData extends LegendData {
  _donutSpecific?: never;
}

export interface DonutTooltipProps extends OmittedTooltipProps {
  _tooltipSpecific?: never;
}

export interface DonutChartProps {
  data: DonutData;
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
}
