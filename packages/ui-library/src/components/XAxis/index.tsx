import { AxisBottom } from '@visx/axis';
import { default as React, useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { shimmerClassName } from '../Shimmer/Shimmer';
import { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { XAxisProps } from './types';

function XAxis({
    scale,
    top,
    isLoading = false,
    showTicks = false,
    showAxisLine = true,
    labels: providedLabels,
    availableWidth,
    autoRotate = false,
    numTicks = 5,
    hideAllTicks = false,
    ...props
}: XAxisProps) {
    const { theme } = useTheme();
    // Calculate optimal label display settings if autoRotate is enabled
    const { tickValues, formatLabel, rotate, angle, textAnchor, evenPositionsMap } = useMemo(() => {
        // Extract labels from scale if not provided
        const scaleLabels =
            providedLabels ||
            (scale.domain && typeof scale.domain === 'function' ? scale.domain().map(String) : []);

        // Handle special cases
        if (scaleLabels.length <= 1) {
            return {
                tickValues: [],
                formatLabel: (label: string) => label,
                rotate: false,
                angle: 0,
                textAnchor: 'middle',
                evenPositionsMap: null,
            };
        }

        const optimalLabelCount = Math.max(2, Math.floor(availableWidth / 15));

        // Always show first and last labels, then distribute the rest evenly
        const averageCharWidth = 7; // estimated width per character
        const totalLabelWidth = scaleLabels.join('').length * averageCharWidth;

        if (scaleLabels.length > optimalLabelCount || totalLabelWidth >= availableWidth) {
            let indicesToShow = [];
            if (scaleLabels.length > optimalLabelCount) {
                // Create array to hold indices of labels to show
                indicesToShow = [0, scaleLabels.length - 1]; // Always include first and last

                // Calculate how many middle labels we can show
                const middleLabelsToShow = optimalLabelCount - 2; // Subtract 2 for first and last

                if (middleLabelsToShow > 0 && scaleLabels.length > 2) {
                    // Calculate step size for even distribution between first and last
                    const step = (scaleLabels.length - 2) / (middleLabelsToShow + 1);

                    // Add evenly spaced indices
                    for (let i = 1; i <= middleLabelsToShow; i++) {
                        const index = Math.round(step * i); // +1 to skip the first label
                        if (index > 0 && index < scaleLabels.length - 1) {
                            // Ensure we don't duplicate first/last
                            indicesToShow.push(index);
                        }
                    }
                }

                // Sort indices to maintain order
                indicesToShow.sort((a, b) => a - b);
            } else {
                indicesToShow = scaleLabels.map((_, i) => i);
            }

            // Create a map of label to position for even spacing
            const positions = new Map();
            const labelCount = indicesToShow.length;

            // Calculate spacing between labels
            if (labelCount > 1) {
                const spacing = availableWidth / labelCount;
                indicesToShow.forEach((index, i) => {
                    positions.set(scaleLabels[index], i * spacing);
                });
            } else if (labelCount === 1) {
                positions.set(scaleLabels[indicesToShow[0]], availableWidth / 2);
            }

            return {
                tickValues: indicesToShow.map((i) => scaleLabels[i]),
                formatLabel: (label: string) => {
                    if (typeof label !== 'string') return label;
                    // Allow longer labels
                    if (label.length > 12) {
                        return `${label.substring(0, 12)}...`;
                    }
                    return label;
                },
                rotate: true,
                angle: -45,
                textAnchor: 'end',
                evenPositionsMap: positions,
            };
        }

        // For fewer labels, we can show all of them
        if (scaleLabels.length <= optimalLabelCount) {
            return {
                tickValues: null, // Show all ticks
                formatLabel: (label: string) => {
                    if (typeof label !== 'string') return label;
                    // Allow longer labels
                    if (label.length > 12) {
                        return `${label.substring(0, 12)}...`;
                    }
                    return label;
                },
                rotate: false,
                angle: 0,
                textAnchor: 'middle',
                evenPositionsMap: null,
            };
        }

        // For moderate number of labels
        const indicesToShow = [0, scaleLabels.length - 1]; // Always include first and last
        const middleLabelsToShow = optimalLabelCount - 2;

        if (middleLabelsToShow > 0) {
            const step = (scaleLabels.length - 2) / (middleLabelsToShow + 1);
            for (let i = 1; i <= middleLabelsToShow; i++) {
                const index = Math.round(step * i) + 1;
                if (index > 0 && index < scaleLabels.length - 1) {
                    indicesToShow.push(index);
                }
            }
        }

        indicesToShow.sort((a, b) => a - b);

        // Create a map of label to position for even spacing
        const positions = new Map();
        const labelCount = indicesToShow.length;

        // Calculate spacing between labels
        if (labelCount > 1) {
            const spacing = availableWidth / labelCount;
            indicesToShow.forEach((index, i) => {
                positions.set(scaleLabels[index], i * spacing);
            });
        } else if (labelCount === 1) {
            positions.set(scaleLabels[indicesToShow[0]], availableWidth / 2);
        }

        return {
            tickValues: indicesToShow.map((i) => scaleLabels[i]),
            formatLabel: (label: string) => {
                if (typeof label !== 'string') return label;
                // More generous truncation
                if (label.length > 12) {
                    return `${label.substring(0, 12)}...`;
                }
                return label;
            },
            rotate: true,
            angle: -30,
            textAnchor: 'end',
            evenPositionsMap: positions,
        };
    }, [autoRotate, availableWidth, providedLabels, scale]);

    // Render axis label with loading state handling
    const renderAxisLabel = (formattedValue: string | undefined, tickProps: any) => {
        // Compute label and common style
        const label = isLoading
            ? ''
            : formatLabel
              ? formatLabel(formattedValue || '')
              : formattedValue;
        const textStyle = { fontSize: theme.typography.fontSize.small };
        // Determine x-position using even spacing if available
        const xPos =
            evenPositionsMap &&
            tickValues &&
            formattedValue &&
            evenPositionsMap.get(formattedValue) !== undefined
                ? evenPositionsMap.get(formattedValue)
                : tickProps.x;

        // Render rotated or non-rotated labels
        if (rotate) {
            return (
                <g transform={`translate(${xPos},${tickProps.y})`}>
                    <text
                        className={isLoading ? shimmerClassName : ''}
                        fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
                        style={textStyle}
                        textAnchor={textAnchor}
                        transform={`rotate(${angle})`}
                        dy="0.5em"
                        dx="0.32em"
                    >
                        {label}
                    </text>
                </g>
            );
        }
        return (
            <g transform={`translate(${tickProps.x},${tickProps.y})`}>
                <text
                    className={isLoading ? shimmerClassName : ''}
                    fill={isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label}
                    style={textStyle}
                    textAnchor="middle"
                    dy="0.71em"
                >
                    {label}
                </text>
            </g>
        );
    };

    return (
        <AxisBottom
            scale={scale}
            top={top}
            stroke={theme.colors.axis.line}
            tickStroke={theme.colors.axis.line}
            tickValues={tickValues}
            tickLabelProps={() => ({
                fill: theme.colors.axis.label,
                fontSize: theme.typography.fontSize.small,
            })}
            numTicks={numTicks}
            hideAxisLine={!showAxisLine}
            hideTicks={hideAllTicks || !showTicks}
            tickComponent={({ formattedValue, ...tickProps }) =>
                renderAxisLabel(formattedValue, tickProps)
            }
            tickFormat={(value) => value.toString()}
            {...props}
        />
    );
}

export default XAxis;