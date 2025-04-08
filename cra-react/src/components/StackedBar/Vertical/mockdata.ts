import { DataPoint } from "./types";

/**
 * Mock data for the VerticalStackedBarChart component
 * Used when the chart is in loading state
 */
export const mockVerticalStackedBarChartData: {
  data: DataPoint[];
  groupKeys: string[];
} = {
  data: [
    {
      label: "Jan",
      data: {
        series1: 45,
        series2: 30,
        series3: 15,
      },
    },
    {
      label: "Feb",
      data: {
        series1: 60,
        series2: 40,
        series3: 25,
      },
    },
    {
      label: "Mar",
      data: {
        series1: 35,
        series2: 50,
        series3: 20,
      },
    },
    {
      label: "Apr",
      data: {
        series1: 75,
        series2: 45,
        series3: 30,
      },
    },
    {
      label: "May",
      data: {
        series1: 55,
        series2: 35,
        series3: 40,
      },
    },
  ],
  groupKeys: ["series1", "series2", "series3"],
};

/**
 * Alternative mock data with different group keys
 * Can be used for different testing scenarios
 */
export const alternativeMockData: {
  data: DataPoint[];
  groupKeys: string[];
} = {
  data: [
    {
      label: "Product A",
      data: {
        revenue: 120,
        cost: 80,
        profit: 40,
      },
    },
    {
      label: "Product B",
      data: {
        revenue: 150,
        cost: 90,
        profit: 60,
      },
    },
    {
      label: "Product C",
      data: {
        revenue: 100,
        cost: 70,
        profit: 30,
      },
    },
    {
      label: "Product D",
      data: {
        revenue: 180,
        cost: 100,
        profit: 80,
      },
    },
  ],
  groupKeys: ["revenue", "cost", "profit"],
};
