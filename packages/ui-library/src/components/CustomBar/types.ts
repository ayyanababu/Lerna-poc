import { Bar as VisxBar } from '@visx/shape';

type VisxBarProps = Parameters<typeof VisxBar>[0];
export interface CustomBarProps extends VisxBarProps {
    /**
     * Whether the chart is in loading state
     */
    isLoading?: boolean;

    /**
     * Whether to show the bar
     * @default true
     */
    isVisible?: boolean;

    /**
     * Props for custom path element when you need more control over the bar shape
     */
    pathProps?: React.SVGProps<SVGPathElement>;
}
