import { TreeMapNode } from "./types";

/**
 * Mock data for the TreeMapChart component
 * Used when the chart is in loading state
 */
const mockTreeMapChartData: TreeMapNode = {
  id: "root",
  name: "Portfolio",
  value: 400,
  children: [
    {
      id: "equities",
      name: "Equities",
      value: 200,
      children: [
        { id: "tech", name: "Technology", value: 120 },
        { id: "health", name: "Healthcare", value: 80 },
      ],
    },
    {
      id: "fixed-income",
      name: "Fixed Income",
      value: 150,
      children: [
        { id: "gov", name: "Government", value: 90 },
        { id: "corp", name: "Corporate", value: 60 },
      ],
    },
    {
      id: "alternatives",
      name: "Alternatives",
      value: 50,
    },
  ],
};

export default mockTreeMapChartData;
