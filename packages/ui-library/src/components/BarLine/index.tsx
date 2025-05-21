import React, { useMemo } from "react";

import useTheme from "../../hooks/useTheme";
import Bar from "../v1/Bar/";
import { BarLineChartProps } from "../v1/Bar/types";
import { BarLineData } from "../v1/common/Data.types";
import mockBarLineChartData from "./mockData";

const DEFAULT_MAX_BAR_WIDTH = 16;

const BarLineChart: React.FC<BarLineChartProps> = ({
  data: _data,
  title,
  colors: _colors,
  isLoading = false,
  titleProps,
  legendsProps,
  tooltipProps,
  xAxisProps,
  yAxisProps,
  gridProps,
  timestampProps,
  barProps,
  onClick,
  maxBarWidth = DEFAULT_MAX_BAR_WIDTH,
  showTicks = false,
  showGrid = true,
  showXAxis = false,
  showYAxis = false,
  onLineClick,
  onPointClick,
  onArrowClick,
}) => {
  const theme = useTheme();

  const data = useMemo<BarLineData>(
    () => (isLoading ? mockBarLineChartData : _data),
    [isLoading, _data],
  );
  const { chartData } = data;
  if (!isLoading && (!chartData || chartData.length === 0)) {
    return <div>No data to display.</div>;
  }
  const barColors = _colors ?? {
    line: theme.theme.colors.charts.bar[2],
    bar: theme.theme.colors.charts.line[0],
  };

  return (
    <Bar
      data={data}
      title={title}
      colors={barColors}
      isLoading={isLoading}
      titleProps={titleProps}
      legendsProps={legendsProps}
      tooltipProps={tooltipProps}
      xAxisProps={xAxisProps}
      yAxisProps={yAxisProps}
      gridProps={gridProps}
      timestampProps={timestampProps}
      barProps={barProps}
      maxBarWidth={maxBarWidth}
      showGrid={showGrid}
      showTicks={showTicks}
      showXAxis={showXAxis}
      showYAxis={showYAxis}
      theme={theme}
      onClick={onClick}
      variant={"BAR AND LINE"}
      onLineClick={onLineClick}
      onPointClick={onPointClick}
      onArrowClick={onArrowClick}
    />
  );
};
export default BarLineChart;
