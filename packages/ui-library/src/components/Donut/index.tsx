import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleOrdinal } from '@visx/scale';
import { Pie } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { PieArcDatum, arc as d3Arc } from 'd3-shape';
import React, { useMemo, useState } from 'react';

import useTheme from '../../hooks/useTheme';
import { ChartWrapper } from '../ChartWrapper';
import SvgShimmer, { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { TooltipData } from '../Tooltip/types';
import { mockFullDonutData, mockSemiDonutData } from './ShimmerMock';
import { DonutChartProps, DonutData } from './types';

function DonutChart({
    data: _data,
    type = 'full',
    hideLabels = true,
    title = '',
    timestamp,
    colors = [],
    isLoading,
    titleProps,
    legendsProps,
    tooltipProps,
    arcGap = 0,
    arcRadius = 0,
}: DonutChartProps) {
    const { parentRef, width, height } = useParentSize({
        debounceTime: 150,
    });

    const { theme } = useTheme();

    const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
        useTooltip<TooltipData>();
    const [hoveredArc, setHoveredArc] = useState<string | null>();
    const [hideIndex, setHideIndex] = useState<number[]>([]);
    const radius = useMemo(
        () => Math.min(width, height) / (type === 'semi' ? 2 : 2.5),
        [type, width, height],
    );
    const innerRadius = useMemo(() => radius * 0.6, [radius]);

    const data = useMemo(() => {
        if (!isLoading) return _data;
        if (type === 'semi') return mockSemiDonutData;
        return mockFullDonutData;
    }, [isLoading, _data, type]);

    const filteredData = useMemo(
        () => data.filter((_, i) => !hideIndex.includes(i)),
        [hideIndex, data],
    );

    const colorScale = scaleOrdinal<string, string>({
        domain: data.map((d) => d.label),
        range: colors?.length ? colors : theme.colors.charts.donut,
    });

    return (
        <ChartWrapper
            ref={parentRef}
            title={title}
            titleProps={titleProps}
            legendsProps={{
                data,
                colorScale,
                hideIndex,
                setHideIndex,
                hovered: hoveredArc,
                setHovered: setHoveredArc,
                isLoading,
                ...legendsProps,
            }}
            tooltipProps={{
                data: tooltipData,
                top: tooltipTop,
                left: tooltipLeft,
                isVisible: !isLoading && tooltipOpen,
                ...tooltipProps,
            }}
            timestampProps={{ timestamp, isLoading }}
        >
            <svg width={width} height={height}>
                {isLoading ? <SvgShimmer /> : null}

                <Group top={height / (type === 'semi' ? 1.5 : 2)} left={width / 2}>
                    <Pie
                        data={filteredData}
                        pieValue={(d: { value: number }) => d.value}
                        outerRadius={radius}
                        innerRadius={innerRadius}
                        padAngle={arcGap}
                        pieSortValues={(a, b) => a - b}
                        startAngle={type === 'semi' ? -Math.PI / 2 : 0}
                        endAngle={type === 'semi' ? Math.PI / 2 : 360}
                    >
                        {(pie) =>
                            pie.arcs.map((_arc) => {
                                const arc = _arc as unknown as PieArcDatum<DonutData[0]>;
                                const [centroidX, centroidY] = pie.path.centroid(arc);

                                const isHovered = hoveredArc === arc.data.label || !hoveredArc;

                                const arcGenerator = d3Arc()
                                    .innerRadius(innerRadius)
                                    .outerRadius(radius)
                                    .cornerRadius(arcRadius)
                                    .padAngle(arcGap) as unknown as (
                                    d: PieArcDatum<{
                                        label: string;
                                        value: number;
                                    }>,
                                ) => string;

                                const shadowArcGenerator = d3Arc()
                                    .cornerRadius(arcRadius)
                                    .innerRadius(innerRadius * 1.7)
                                    .outerRadius(
                                        isHovered ? radius + 10 : radius + 15,
                                    ) as unknown as (
                                    d: PieArcDatum<{
                                        label: string;
                                        value: number;
                                    }>,
                                ) => string;

                                return (
                                    <g
                                        key={`arc-${arc.data.label}`}
                                        onMouseMove={(
                                            event: React.MouseEvent<SVGGElement, MouseEvent>,
                                        ) => {
                                            showTooltip({
                                                tooltipData: arc.data,
                                                tooltipLeft: event.clientX,
                                                tooltipTop: event.clientY,
                                            });
                                            setHoveredArc(arc.data.label);
                                        }}
                                        onMouseLeave={() => {
                                            hideTooltip();
                                            setHoveredArc(null);
                                        }}
                                        style={{
                                            opacity: isHovered ? 1 : 0.5,
                                            scale: hoveredArc === arc.data.label ? 1.1 : 1,
                                            cursor: 'pointer',
                                            transition: 'all 250ms ease-in-out',
                                        }}
                                    >
                                        <path
                                            d={arcGenerator(arc)}
                                            fill={
                                                isLoading
                                                    ? `url(#${shimmerGradientId})`
                                                    : arc.data?.color || colorScale(arc.data.label)
                                            }
                                            stroke={theme.colors.common.border}
                                            strokeWidth={2}
                                            style={{
                                                filter:
                                                    hoveredArc === arc.data.label
                                                        ? 'saturate(150%)'
                                                        : 'saturate(100%)',
                                            }}
                                        />
                                        {hoveredArc === arc.data.label && (
                                            <path
                                                d={shadowArcGenerator(arc)}
                                                fill={arc.data?.color || colorScale(arc.data.label)}
                                                opacity={0.2}
                                            />
                                        )}
                                        {!isLoading && !hideLabels && (
                                            <text
                                                x={centroidX}
                                                y={centroidY}
                                                dy=".33em"
                                                fill={theme.colors.common.text}
                                                fontSize={10}
                                                textAnchor="middle"
                                                fontWeight={
                                                    hoveredArc === arc.data.label
                                                        ? 'bold'
                                                        : 'normal'
                                                }
                                            >
                                                {arc.data.label}
                                            </text>
                                        )}
                                    </g>
                                );
                            })
                        }
                    </Pie>
                </Group>
            </svg>
        </ChartWrapper>
    );
}

export default DonutChart;
