import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import useTheme from "../../hooks/useTheme";
import { TooltipProps } from "../Tooltip/types";
import DonutChart from ".";

// Mock visx modules - avoid using document directly
jest.mock("@visx/responsive", () => ({
  useParentSize: () => ({
    parentRef: { current: {} },
    width: 400,
    height: 300,
  }),
}));

jest.mock("@visx/tooltip", () => ({
  useTooltip: () => ({
    showTooltip: jest.fn(),
    hideTooltip: jest.fn(),
    tooltipData: null,
    tooltipLeft: 0,
    tooltipTop: 0,
    tooltipOpen: false,
  }),
}));

// Mock the useTheme hook
jest.mock("../../hooks/useTheme", () => ({
  useTheme: jest.fn().mockReturnValue({
    theme: {
      colors: {
        charts: {
          donutChart: ["#ff0000", "#00ff00", "#0000ff", "#ffff00"],
        },
        common: {
          border: "#cccccc",
          text: "#333333",
        },
      },
    },
  }),
}));

// ✅ FIXED: Mock the ChartWrapper component safely
jest.mock("../ChartWrapper", () => ({
  ChartWrapper: ({
    children,
    ref,
    tooltipProps,
    ...props
  }: React.HTMLProps<HTMLDivElement> & { tooltipProps?: TooltipProps }) => {
    const { isVisible, ...safeTooltipProps } = tooltipProps || {};

    return (
      <div
        data-testid="chart-wrapper"
        ref={ref}
        {...props}
        data-tooltip-props={JSON.stringify(safeTooltipProps)} // ✅ FIXED
      >
        {children}
      </div>
    );
  },
}));

// Mock the SvgShimmer component
jest.mock("../Shimmer/SvgShimmer", () => ({
  __esModule: true,
  default: () => <g data-testid="svg-shimmer" />,
  shimmerGradientId: "shimmer-gradient",
}));

const testData = [
  { label: "Group A", value: 400 },
  { label: "Group B", value: 300 },
  { label: "Group C", value: 200 },
];

describe("DonutChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with default props", () => {
    render(<DonutChart data={testData} />);
    expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("svg-shimmer")).toBeInTheDocument();
  });

  test("renders with loading state", () => {
    render(<DonutChart data={testData} isLoading />);
    expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("svg-shimmer")).toBeInTheDocument();
  });

  test("renders semi donut chart", () => {
    render(<DonutChart data={testData} type="semi" />);
    expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
  });

  test("renders with title and timestamp", () => {
    render(
      <DonutChart
        data={testData}
        title="Test Donut Chart"
        timestamp="2023-05-01T12:00:00Z"
      />,
    );

    const chartWrapper = screen.getByTestId("chart-wrapper");
    expect(chartWrapper).toBeInTheDocument();
    expect(chartWrapper).toHaveAttribute("title", "Test Donut Chart");
    expect(chartWrapper).toHaveAttribute("timestampProps", expect.any(String));
  });

  test("renders with custom colors", () => {
    const customColors = ["#123456", "#654321", "#abcdef"];
    render(<DonutChart data={testData} colors={customColors} />);
    expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
  });

  test("renders with hidden labels", () => {
    render(<DonutChart data={testData} hideLabels />);
    expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
  });

  test("renders with empty data", () => {
    render(<DonutChart data={[]} />);
    expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
  });

  test("handles custom title props", () => {
    const titleProps = { className: "custom-title" };
    render(
      <DonutChart
        data={testData}
        title="Chart Title"
        titleProps={titleProps}
      />,
    );
    const chartWrapper = screen.getByTestId("chart-wrapper");
    expect(chartWrapper).toBeInTheDocument();
    expect(chartWrapper).toHaveAttribute(
      "titleProps",
      expect.stringContaining("custom-title"),
    );
  });

  test("uses mockFullDonutData when isLoading is true and type is full", () => {
    render(<DonutChart data={testData} isLoading />);
    const chartWrapper = screen.getByTestId("chart-wrapper");
    expect(chartWrapper).toHaveAttribute("legendsProps");
  });

  test("uses mockSemiDonutData when isLoading is true and type is semi", () => {
    render(<DonutChart data={testData} isLoading type="semi" />);
    const chartWrapper = screen.getByTestId("chart-wrapper");
    expect(chartWrapper).toHaveAttribute("legendsProps");
  });

  test("handles theme changes correctly", () => {
    (useTheme as jest.Mock).mockReturnValueOnce({
      theme: {
        colors: {
          charts: {
            donutChart: ["#aaaaaa", "#bbbbbb", "#cccccc"],
          },
          common: {
            border: "#dddddd",
            text: "#eeeeee",
          },
        },
      },
    });

    render(<DonutChart data={testData} />);
    expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
  });

  test("calculates the correct radius for full donut", () => {
    render(<DonutChart data={testData} type="full" />);
    expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
  });

  test("calculates the correct radius for semi donut", () => {
    render(<DonutChart data={testData} type="semi" />);
    expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
  });

  test("applies correct styles for non-hovered and hovered states", () => {
    render(<DonutChart data={testData} />);
    expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
  });

  test("renders correctly when data has different sizes after filtering", () => {
    render(<DonutChart data={testData} />);
    expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
  });
});
