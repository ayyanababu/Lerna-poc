import { CSSProperties } from 'react';
import { LegendsProps } from '../Legends/types';
import { TimestampProps } from '../Timestamp/types';
import { TitleProps } from '../Title/types';
import { TooltipProps } from '../Tooltip/types';

export interface TreeMapNode {
    id: string;
    name: string;
    value: number;
    children?: TreeMapNode[];
    color?: string;
}

export interface TreeMapChartProps {
    /**
     * Root node data for the treemap
     */
    data: TreeMapNode;

    /**
     * Chart title
     */
    title?: string;

    /**
     * Chart timestamp
     */
    timestamp?: string;

    /**
     * Margin around the chart
     */
    margin?: { top: number; right: number; bottom: number; left: number };

    /**
     * Width of the chart
     */
    width?: number;

    /**
     * Height of the chart
     */
    height?: number;

    /**
     * Custom colors for the chart
     */
    colors?: string[];

    /**
     * Loading state
     */
    isLoading?: boolean;

    /**
     * Title props
     */
    titleProps?: TitleProps;

    /**
     * Legend props
     */
    legendsProps?: Partial<LegendsProps>;

    /**
     * Tooltip props
     */
    tooltipProps?: Partial<TooltipProps>;

    /**
     * Timestamp props
     */
    timestampProps?: Partial<TimestampProps>;

    /**
     * Chart container style
     */
    style?: CSSProperties;

    /**
     * Padding between tiles
     * @default 1
     */
    tilePadding?: number;

    /**
     * Round the corners of tiles
     * @default 4
     */
    borderRadius?: number;

    /**
     * Show node labels inside tiles
     * @default true
     */
    showLabels?: boolean;

    /**
     * Function to handle click events on nodes
     */
    onClick?: (index: number, node: TreeMapNode, data: TreeMapNode) => void;
}
