import { BarLineData } from "./types";

/**
 * Mock data for the VerticalBarChart component
 * Used when the chart is in loading state
 */
const mockVerticalBarChartData: BarLineData = {
  xAxislabel: "Corporate Action",
  yAxisLeftLabel: "Number of Actions",
  yAxisRightLabel: "Positions Impacted",
  chartData: [
    {
      xAxis: "Priced",
      yAxisLeft: 20,
      yAxisRight: undefined,
    },
    {
      xAxis: "Priced",
      yAxisLeft: 15,
      yAxisRight: 22,
    },
    {
      xAxis: "Priced",
      yAxisLeft: 18,
      yAxisRight: 45,
    },
    {
      xAxis: "Priced",
      yAxisLeft: 22,
      yAxisRight: 28,
    },
    {
      xAxis: "Rights Issue (NCA)",
      yAxisLeft: 30,
      yAxisRight: 40,
    },
    {
      xAxis: "Merger (NEA)",
      yAxisLeft: 35,
      yAxisRight: 25,
    },
    {
      xAxis: "Tender Offer (NCA)",
      yAxisLeft: 42,
      yAxisRight: 55,
    },
  ],
};

export default mockVerticalBarChartData;
