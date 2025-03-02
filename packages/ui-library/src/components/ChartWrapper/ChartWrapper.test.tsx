import '@testing-library/jest-dom'; // Import this to fix toBeInTheDocument
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ChartWrapper } from '.';

// Mock the Title component
jest.mock('../Title', () => ({
  Title: ({ title, ...props }: any) => (
    <div data-testid="title" {...props}>
      {title}
    </div>
  ),
}));

// Mock the Legends component
jest.mock('../Legends', () => ({
  Legends: (props: any) => <div data-testid="legends">Mocked Legends</div>,
}));

// Mock the Tooltip component
jest.mock('../Tooltip', () => ({
  Tooltip: ({ data, isVisible, ...props }: any) => (
    // Removing isVisible from DOM props by not spreading it directly to div
    <div data-testid="tooltip" data-is-visible={isVisible} {...props}>
      {data && `${data.label}: ${data.value}`}
    </div>
  ),
}));

// Mock the Timestamp component
jest.mock('../Timestamp', () => ({
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

describe('ChartWrapper', () => {
  // Set up mocks before each test
  beforeEach(() => {
    // Setup default parent element with valid size
    Object.defineProperty(HTMLDivElement.prototype, 'parentElement', {
      configurable: true,
      value: mockParentElement,
    });

    // Setup ResizeObserver
    window.ResizeObserver =
      mockResizeObserver as unknown as typeof ResizeObserver;
  });

  // Reset mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders title when provided', () => {
    render(<ChartWrapper title="Test Chart">Chart content</ChartWrapper>);
    expect(screen.getByTestId('title')).toHaveTextContent('Test Chart');
  });

  test('renders children content', () => {
    render(<ChartWrapper>Chart content</ChartWrapper>);
    expect(screen.getByText('Chart content')).toBeInTheDocument();
  });

  test('renders "Cannot Render" message when container is too small', () => {
    // Mock parent element with small dimensions
    Object.defineProperty(HTMLDivElement.prototype, 'parentElement', {
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
      screen.getByText('Cannot Render the chart under this size'),
    ).toBeInTheDocument();
  });

  test('renders Legends when legendsProps are provided', () => {
    const legendsProps = {
      data: [{ label: 'Test Legend', value: 100 }],
    };
    render(
      <ChartWrapper legendsProps={legendsProps}>Chart content</ChartWrapper>,
    );
    expect(screen.getByTestId('legends')).toBeInTheDocument();
  });

  test('renders Tooltip when tooltipProps are provided', () => {
    const tooltipProps = {
      data: { label: 'Test Tooltip', value: 100 },
    };
    render(
      <ChartWrapper tooltipProps={tooltipProps}>Chart content</ChartWrapper>,
    );
    expect(screen.getByTestId('tooltip')).toHaveTextContent(
      'Test Tooltip: 100',
    );
  });

  test('renders Timestamp when timestampProps are provided', () => {
    const timestampProps = {
      timestamp: '2023-05-01T12:00:00Z',
    };
    render(
      <ChartWrapper timestampProps={timestampProps}>
        Chart content
      </ChartWrapper>,
    );
    const timestampElement = screen.getByTestId('timestamp');
    expect(timestampElement).toBeInTheDocument();
    expect(timestampElement).toHaveTextContent(
      'Last Update: 2023-05-01T12:00:00Z',
    );
  });

  test('renders chart content when container is large enough', () => {
    // Already configured with large parent in beforeEach
    render(<ChartWrapper>Chart content</ChartWrapper>);

    expect(screen.getByText('Chart content')).toBeInTheDocument();
    expect(
      screen.queryByText('Cannot Render the chart under this size'),
    ).not.toBeInTheDocument();
  });

  test('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();

    // Need to render with large parent to avoid "Cannot Render" message
    render(<ChartWrapper ref={ref}>Chart content</ChartWrapper>);

    // The ref should be populated since we're rendering the chart content
    expect(ref.current).not.toBeNull();
  });

  test('responds to window resize events', () => {
    // Setup spy on addEventListener
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<ChartWrapper>Chart content</ChartWrapper>);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );

    // Cleanup
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('applies default colorScale when legendsProps has no colorScale', () => {
    const legendsProps = {
      data: [{ label: 'Test Legend', value: 100 }],
      // No colorScale provided
    };

    render(
      <ChartWrapper legendsProps={legendsProps}>Chart content</ChartWrapper>,
    );

    expect(screen.getByTestId('legends')).toBeInTheDocument();
    // The default colorScale is applied internally
  });

  test('handles all props being passed together', () => {
    const props = {
      title: 'Complete Chart',
      titleProps: { className: 'test-title' },
      legendsProps: {
        data: [
          { label: 'Series A', value: 100 },
          { label: 'Series B', value: 200 },
        ],
      },
      tooltipProps: {
        data: { label: 'Hover Data', value: 150 },
        top: 100,
        left: 100,
        isVisible: true,
      },
      timestampProps: {
        timestamp: '2023-06-15T14:30:00Z',
      },
    };

    render(
      <ChartWrapper {...props}>
        <div data-testid="chart-visualization">Chart Visualization</div>
      </ChartWrapper>,
    );

    expect(screen.getByTestId('title')).toHaveTextContent('Complete Chart');
    expect(screen.getByTestId('legends')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveTextContent('Hover Data: 150');
    expect(screen.getByTestId('timestamp')).toHaveTextContent(
      'Last Update: 2023-06-15T14:30:00Z',
    );
    expect(screen.getByTestId('chart-visualization')).toBeInTheDocument();
  });

  test('handles null tooltipData gracefully', () => {
    const tooltipProps = {
      // No data property
      top: 100,
      left: 100,
    };

    render(
      <ChartWrapper tooltipProps={tooltipProps}>Chart content</ChartWrapper>,
    );

    // The component should handle this gracefully and not render tooltip content
    // Since we don't want to test implementation details like internal conditionals,
    // we just verify that the component renders without errors
    expect(screen.getByText('Chart content')).toBeInTheDocument();
  });
});
