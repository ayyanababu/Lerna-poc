import { BarLineData } from "./types";

/**
 * Mock data for the HorizontalBarChart component
 * Used when the chart is in loading state
 */
const mockBarLineChartData: BarLineData = {
  xAxislabel: "Corporate Action",
  yAxisLeftLabel: "Number of Actions",
  yAxisRightLabel: "Positions Impacted",
  chartData: [
    {
      xAxis: "Dividend (NNA)",
      yAxisLeft: 25,
      yAxisRight: 35,
    },
    {
      xAxis: "Dividend (NCA)",
      yAxisLeft: 15,
      yAxisRight: 22,
    },
    {
      xAxis: "Dividend (NEA)",
      yAxisLeft: 18,
      yAxisRight: 45,
    },
    {
      xAxis: "Stock Split (NCA)",
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

export default mockBarLineChartData;
