export interface BarLineDataPoint {
  xAxis: string;
  yAxisLeft: number;
  yAxisRight: number;
  barColor?: string;
}

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
  xAxis?: string;
  xAxislabel?: string;
  yAxisLeftLabel?: string;
  yAxisRightLabel?: string;
  chartData?: BarLineDataPoint[];
}
}
export interface BarsList {
  x: number;
  width: number;
  label: string;
}
