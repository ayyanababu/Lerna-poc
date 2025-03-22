import { ScaleLinear } from '@visx/vendor/d3-scale';

export interface GridProps {
    /**
     * Width for horizontal grid lines
     */
    width?: number;

    /**
     * Height for vertical grid lines
     */
    height?: number;

    /**
     * Scale for horizontal grid lines
     */
    xScale?: ScaleLinear<number, number>;

    /**
     * Scale for vertical grid lines
     */
    yScale?: ScaleLinear<number, number>;

    /**
     * Number of ticks for grid lines
     */
    numTicks?: number;

    /**
     * Whether to show horizontal grid lines
     */
    showHorizontal?: boolean;

    /**
     * Whether to show vertical grid lines
     */
    showVertical?: boolean;

    /**
     * Opacity of grid lines
     */
    opacity?: number;

    /**
     * Whether to show grid lines
     */
    isVisible?: boolean;
}
