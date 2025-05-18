export interface BarLineDataItem {
  xAxis: string;
  yAxisLeft: number;
  yAxisRight: number | undefined;
  barColor?: string;
}

export interface BarLineData {
  xAxislabel: string;
  yAxisLeftLabel: string;
  yAxisRightLabel?: string | undefined;
  chartData: BarLineDataItem[];
}

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarsList {
  x: number;
  width: number;
  label: string;
}

export enum ChartVariant {
  VerticalBar = "VERTICAL_BAR",
  BarAndLine = "BAR_AND_LINE",
}
