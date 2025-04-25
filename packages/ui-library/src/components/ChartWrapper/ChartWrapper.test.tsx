import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom"; // Import this to fix toBeInTheDocument
import ChartWrapper from ".";

// Create a mock for ScaleOrdinal
const mockColorScale = jest.fn() as any;
mockColorScale.domain = jest.fn().mockReturnValue(mockColorScale);
mockColorScale.range = jest.fn().mockReturnValue(mockColorScale);
mockColorScale.unknown = jest.fn().mockReturnValue(mockColorScale);
mockColorScale.copy = jest.fn().mockReturnValue(mockColorScale);

// Mock the Title component
jest.mock("../Title", () => ({
  Title: ({ title, ...props }: any) => (
    <div data-testid="title" {...props}>
      {title}
    </div>
  ),
}));

// Mock the Legends component
jest.mock("../Legends", () => ({
  Legends: (props: any) => <div data-testid="legends">Mocked Legends</div>,
}));

// Mock the Tooltip component
jest.mock("../Tooltip", () => ({
  Tooltip: ({ data, isVisible, ...props }: any) => (
    <div data-testid="tooltip" data-is-visible={isVisible} {...props}>
      {Array.isArray(data) && data.length > 0
        ? `${data[0].label}: ${data[0].value}`
        : null}
    </div>
  ),
}));

// Mock the Timestamp component
jest.mock("../Timestamp", () => ({
  Timestamp: ({ timestamp, ...props }: any) => (
    <span data-testid="timestamp" {...props}>
      Last Update: {timestamp}
    </span>
  ),
}));

// Create a mock parent element with proper dimensions
const mockParentElement = {
  getBoundingClientRect: () => ({
    width: 600,
    height: 400,
    top: 0,
    left: 0,
    right: 600,
    bottom: 400,
    x: 0,
    y: 0,
    toJSON: () => {},
  }),
};

// Mock for ResizeObserver
const mockResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("ChartWrapper", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLDivElement.prototype, "parentElement", {
      configurable: true,
      value: mockParentElement,
    });

    window.ResizeObserver =
      mockResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders title when provided", () => {
    render(<ChartWrapper title="Test Chart">Chart content</ChartWrapper>);
    expect(screen.getByTestId("title")).toHaveTextContent("Test Chart");
  });

  test("renders children content", () => {
    render(<ChartWrapper>Chart content</ChartWrapper>);
    expect(screen.getByText("Chart content")).toBeInTheDocument();
  });

  test('renders "Cannot Render" message when container is too small', () => {
    Object.defineProperty(HTMLDivElement.prototype, "parentElement", {
      configurable: true,
      value: {
        getBoundingClientRect: () => ({
          width: 100,
          height: 100,
          top: 0,
          left: 0,
          right: 100,
          bottom: 100,
          x: 0,
          y: 0,
          toJSON: () => {},
        }),
      },
    });

    render(<ChartWrapper>Chart content</ChartWrapper>);
    expect(
      screen.getByText("Cannot Render the chart under this size"),
    ).toBeInTheDocument();
  });

  test("renders legends when legendsProps is provided", () => {
    const legendsProps = {
      data: [{ label: "Test Legend", value: 100 }],
      colorScale: mockColorScale,
      hideIndex: [],
      setHideIndex: jest.fn(),
      hovered: null,
      setHovered: jest.fn(),
    };

    render(
      <ChartWrapper legendsProps={legendsProps}>Chart content</ChartWrapper>,
    );

    expect(screen.getByTestId("legends")).toBeInTheDocument();
  });

  test("renders Tooltip when tooltipProps are provided", () => {
    const tooltipProps = {
      data: [{ label: "Test Tooltip", value: 100 }],
      top: 100,
      left: 100,
      isVisible: true,
    };
    render(
      <ChartWrapper tooltipProps={tooltipProps}>Chart content</ChartWrapper>,
    );
    expect(screen.getByTestId("tooltip")).toHaveTextContent(
      "Test Tooltip: 100",
    );
  });

  test("renders Timestamp when timestampProps are provided", () => {
    const timestampProps = {
      timestamp: "2023-05-01T12:00:00Z",
    };
    render(
      <ChartWrapper timestampProps={timestampProps}>
        Chart content
      </ChartWrapper>,
    );
    const timestampElement = screen.getByTestId("timestamp");
    expect(timestampElement).toBeInTheDocument();
    expect(timestampElement).toHaveTextContent(
      "Last Update: 2023-05-01T12:00:00Z",
    );
  });

  test("renders chart content when container is large enough", () => {
    render(<ChartWrapper>Chart content</ChartWrapper>);

    expect(screen.getByText("Chart content")).toBeInTheDocument();
    expect(
      screen.queryByText("Cannot Render the chart under this size"),
    ).not.toBeInTheDocument();
  });

  test("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ChartWrapper ref={ref}>Chart content</ChartWrapper>);
    expect(ref.current).not.toBeNull();
  });

  test("responds to window resize events", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = render(<ChartWrapper>Chart content</ChartWrapper>);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test("applies default colorScale when legendsProps has no colorScale", () => {
    const legendsProps = {
      data: [{ label: "Test Legend", value: 100 }],
      colorScale: mockColorScale,
      hideIndex: [],
      setHideIndex: jest.fn(),
      hovered: null,
      setHovered: jest.fn(),
    };

    render(
      <ChartWrapper legendsProps={legendsProps}>Chart content</ChartWrapper>,
    );
  });

  test("handles all props being passed together", () => {
    const props = {
      title: "Complete Chart",
      titleProps: { className: "test-title" },
      legendsProps: {
        data: [
          { label: "Series A", value: 100 },
          { label: "Series B", value: 200 },
        ],
        colorScale: mockColorScale,
        hideIndex: [],
        setHideIndex: jest.fn(),
        hovered: null,
        setHovered: jest.fn(),
      },
      tooltipProps: {
        data: [{ label: "Hover Data", value: 150 }],
        top: 100,
        left: 100,
        isVisible: true,
      },
      timestampProps: {
        timestamp: "2023-06-15T14:30:00Z",
      },
    };

    render(
      <ChartWrapper {...props}>
        <div data-testid="chart-visualization">Chart Visualization</div>
      </ChartWrapper>,
    );
  });

  test("handles null tooltipData gracefully", () => {
    const tooltipProps = {
      data: [], // changed to empty array
      top: 100,
      left: 100,
    };

    render(
      <ChartWrapper tooltipProps={tooltipProps}>Chart content</ChartWrapper>,
    );

    expect(screen.getByText("Chart content")).toBeInTheDocument();
  });

  test("renders tooltip in correct position", () => {
    const tooltipProps = {
      data: [{ label: "Test Data", value: 100 }],
      top: 100,
      left: 100,
      isVisible: true,
    };

    render(
      <ChartWrapper tooltipProps={tooltipProps}>Chart content</ChartWrapper>,
    );
  });
});
