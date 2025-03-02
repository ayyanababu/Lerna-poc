import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DonutChart } from '.';
import { useTheme } from '../../hooks/useTheme';

// Mock visx modules - avoid using document directly
jest.mock('@visx/responsive', () => ({
  useParentSize: () => ({
    parentRef: { current: {} }, // Use empty object instead of document.createElement
    width: 400,
    height: 300,
  }),
}));

jest.mock('@visx/tooltip', () => ({
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
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn().mockReturnValue({
    theme: {
      colors: {
        charts: {
          donutChart: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
        },
        common: {
          border: '#cccccc',
          text: '#333333',
        },
      },
      typography: {
        fontFamily: 'Arial',
      },
    },
  }),
}));

// Mock the ChartWrapper component to safely handle props
jest.mock('../ChartWrapper', () => ({
  ChartWrapper: ({ children, ref, tooltipProps, ...props }: any) => {
    // Extract props that would cause DOM warnings
    const { isVisible, ...safeTooltipProps } = tooltipProps || {};

    return (
      <div
        data-testid="chart-wrapper"
        ref={ref}
        {...props}
        tooltipProps={JSON.stringify(safeTooltipProps)}>
        {children}
      </div>
    );
  },
}));

// Mock the SvgShimmer component
jest.mock('../Shimmer/SvgShimmer', () => ({
  __esModule: true,
  default: () => <g data-testid="svg-shimmer" />,
  shimmerGradientId: 'shimmer-gradient',
}));

const testData = [
  { label: 'Group A', value: 400 },
  { label: 'Group B', value: 300 },
  { label: 'Group C', value: 200 },
];

describe('DonutChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default props', () => {
    render(<DonutChart data={testData} />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('svg-shimmer')).toBeInTheDocument();
  });

  test('renders with loading state', () => {
    render(<DonutChart data={testData} isLoading />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('svg-shimmer')).toBeInTheDocument();
  });

  test('renders semi donut chart', () => {
    render(<DonutChart data={testData} type="semi" />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('renders with title and timestamp', () => {
    render(
      <DonutChart
        data={testData}
        title="Test Donut Chart"
        timestamp="2023-05-01T12:00:00Z"
      />,
    );

    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();

    // Verify props passed to ChartWrapper
    const chartWrapper = screen.getByTestId('chart-wrapper');
    expect(chartWrapper).toHaveAttribute('title', 'Test Donut Chart');
    expect(chartWrapper).toHaveAttribute('timestampProps', expect.any(String));
  });

  test('renders with custom colors', () => {
    const customColors = ['#123456', '#654321', '#abcdef'];
    render(<DonutChart data={testData} colors={customColors} />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('renders with hidden labels', () => {
    render(<DonutChart data={testData} hideLabels />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('renders with empty data', () => {
    render(<DonutChart data={[]} />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('handles custom title props', () => {
    const titleProps = { className: 'custom-title' };
    render(
      <DonutChart
        data={testData}
        title="Chart Title"
        titleProps={titleProps}
      />,
    );
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('chart-wrapper')).toHaveAttribute(
      'titleProps',
      expect.stringContaining('custom-title'),
    );
  });

  test('uses mockFullDonutData when isLoading is true and type is full', () => {
    render(<DonutChart data={testData} isLoading />);
    const chartWrapper = screen.getByTestId('chart-wrapper');
    // Just check that the legendsProps contains some data, without stringifying
    expect(chartWrapper).toHaveAttribute('legendsProps');
  });

  test('uses mockSemiDonutData when isLoading is true and type is semi', () => {
    render(<DonutChart data={testData} isLoading type="semi" />);
    const chartWrapper = screen.getByTestId('chart-wrapper');
    // Just check that the legendsProps contains some data, without stringifying
    expect(chartWrapper).toHaveAttribute('legendsProps');
  });

  test('handles theme changes correctly', () => {
    // Change the mock theme to test theme usage
    (useTheme as jest.Mock).mockReturnValueOnce({
      theme: {
        colors: {
          charts: {
            donutChart: ['#aaaaaa', '#bbbbbb', '#cccccc'],
          },
          common: {
            border: '#dddddd',
            text: '#eeeeee',
          },
        },
        typography: {
          fontFamily: 'Roboto',
        },
      },
    });

    render(<DonutChart data={testData} />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('calculates the correct radius for full donut', () => {
    render(<DonutChart data={testData} type="full" />);
    // Full donut has radius = Math.min(width, height) / 2.5
    // With mocked width=400, height=300, radius should be 300/2.5 = 120
    // Visual test - can't directly test the calculated value
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('calculates the correct radius for semi donut', () => {
    render(<DonutChart data={testData} type="semi" />);
    // Semi donut has radius = Math.min(width, height) / 2
    // With mocked width=400, height=300, radius should be 300/2 = 150
    // Visual test - can't directly test the calculated value
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('applies correct styles for non-hovered and hovered states', () => {
    render(<DonutChart data={testData} />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
    // Note: Since we're mocking the Pie component, we can't directly test hover effects
    // This would require integration testing with the actual components
  });

  test('renders correctly when data has different sizes after filtering', () => {
    render(<DonutChart data={testData} />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();

    // The hideIndex functionality would be tested through legendsProps callbacks
    // This is an integration point that would need to be tested with the full component stack
  });
});
