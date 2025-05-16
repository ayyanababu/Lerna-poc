import React,{useMemo} from 'react'
import Bar from "../v1/Bar/"
import mockBarLineChartData from "./mockData";
import { BarLineChartProps,BarLineData  } from "./types";
import useTheme from "../../hooks/useTheme";
import { colors } from '@mui/material';


const DEFAULT_MAX_BAR_WIDTH = 16;

const BarLineChart: React.FC<BarLineChartProps> = ({
  data: _data,
  title,
  colors:_colors,
  isLoading = false,
  titleProps,
  legendsProps,
  tooltipProps,
  xAxisProps,
  yAxisProps,
  gridProps,
  timestampProps,
  barProps,
  maxBarWidth = DEFAULT_MAX_BAR_WIDTH,
  showTicks = false,
  showGrid = true,
  showXAxis = false,
  showYAxis = false,
  chartProps
}) => {
  const data = useMemo<BarLineData>(
    () => (isLoading ? mockBarLineChartData : _data),
    [isLoading, _data],
  );
  const { chartData } = data;
  if (!isLoading && (!chartData || chartData.length === 0)) {
     return <div>No data to display.</div>;
  }
  const theme = useTheme();
  if (theme && theme.theme.colors){
    const colors = _colors ?? {
      line: theme.theme.colors.charts.bar[2],
      bar: theme.theme.colors.charts.line[0],
    };  
  }  
   return(
     <Bar 
        data={data}
        mockdata={mockBarLineChartData} 
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
        maxBarWidth={maxBarWidth}
        showGrid={showGrid}
        showTicks={showTicks}
        showXAxis={showXAxis}
        showYAxis={showYAxis}   
        theme={useTheme()}    
        chartProps={chartProps}  
     />
   )
}
export default BarLineChart