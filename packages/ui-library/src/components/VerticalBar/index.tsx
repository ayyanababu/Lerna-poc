import React,{useMemo} from 'react'
import Bar from "../v1/Bar/"
import mockVerticalBarChartData from "./mockdata";
import { VerticalBarChartProps, BarLineData } from "./types";
import useTheme from "../../hooks/useTheme";
const DEFAULT_MAX_BAR_WIDTH = 16;

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data: _data,
  title,
  colors = [],
  isLoading = false,
  titleProps,
  chartProps,
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
}) => {
   const data = useMemo<BarLineData[]>(
     () => (isLoading ? mockVerticalBarChartData : _data),
     [isLoading, _data],
   );
console.log("cdata",data)
  const { chartData } = data;
  if (!isLoading && (!chartData || chartData.length === 0)) {
     return <div>No data to display.</div>;
  }

   console.log("mock2",data)
   return(
     <Bar 
        data={data}
        title={title}
        colors={colors}
        isLoading={isLoading}
        titleProps={titleProps}
        legendsProps={legendsProps}
        tooltipProps={tooltipProps}
        xAxisProps={xAxisProps}
        yAxisProps={yAxisProps}
        gridProps={gridProps}
        timestampProps={timestampProps}
        barProps={barProps}
        onClick={onClick}
        maxBarWidth={maxBarWidth}
        theme={useTheme()}
        showGrid={showGrid}
        showTicks={showTicks}
        showXAxis={showXAxis}
        showYAxis={showYAxis}  
        chartProps={chartProps}      
     />
   )
}
export default VerticalBarChart
