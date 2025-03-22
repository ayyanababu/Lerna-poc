import { AxisLeft } from '@visx/axis';

type AxisLeftProps = Parameters<typeof AxisLeft>[0];

export interface YAxisProps extends AxisLeftProps {
    /**
     * Whether to show ticks
     */
    showTicks?: boolean;

    /**
     * Whether to show the axis line
     */
    showAxisLine?: boolean;

    /**
     * Whether the chart is in loading state
     */
    isLoading?: boolean;

    /**
     * Whether to hide all ticks when a condition is met
     */
    hideAllTicks?: boolean;

    /**
     * Custom text anchor for labels
     */
    textAnchor?: 'inherit' | 'end' | 'start' | 'middle';

    availableHeight?: number;
}
