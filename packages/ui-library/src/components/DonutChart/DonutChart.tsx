import { TooltipProps } from '@mui/material';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleOrdinal } from '@visx/scale';
import { Pie } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { arc as d3Arc, PieArcDatum } from 'd3-shape';
import React, { useMemo, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ChartWrapper } from '../ChartWrapper/ChartWrapper';
import { LegendData, LegendsProps } from '../Legends/Legends';
import SvgShimmer, { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { TitleProps } from '../Title/Title';
import { mockFullDonutData, mockSemiDonutData } from './mockdata';
import { TooltipData } from '../Tooltip/Tooltip';

interface DonutChartProps {
  data: LegendData;
  type?: 'full' | 'semi';
  hideLabels?: boolean;
  title?: string;
  timestamp?: string;
  titleProps?: TitleProps;
  legendsProps?: LegendsProps;
  tooltipProps?: TooltipProps;
  isLoading?: boolean;
}

const DonutChart = ({
  data: _data,
  type = 'full',
  hideLabels,
  title = '',
  timestamp,
  titleProps,
  legendsProps,
  tooltipProps,
  isLoading,
}: DonutChartProps) => {
  const { parentRef, width, height } = useParentSize({
    debounceTime: 150,
  });

  const { theme } = useTheme();

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData>();
  const [hoveredArc, setHoveredArc] = useState<string | null>();
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const radius = useMemo(
    () => Math.min(width, height) / (type === 'semi' ? 2 : 2.5),
    [type, width, height],
  );
  const innerRadius = useMemo(() => radius * 0.6, [radius]);
  const cornerRadius = 6;
  const padAngle = 0;

  const data = useMemo(() => {
    if (!isLoading) return _data;
    if (type === 'semi') return mockSemiDonutData;
    return mockFullDonutData;
  }, [isLoading, _data, type]);

  const filteredData = useMemo(() => {
    return data.filter((_, i) => !hideIndex.includes(i));
  }, [hideIndex, data]);

  const colorScale = scaleOrdinal<string, string>({
    domain: data.map((d) => d.label),
    range: theme.colors.categorical,
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
      timestampProps={{ timestamp, isLoading }}>
      <svg width={width} height={height}>
        <SvgShimmer />

        <Group top={height / (type === 'semi' ? 1.5 : 2)} left={width / 2}>
          <Pie
            data={filteredData}
            pieValue={(d) => d.value}
            outerRadius={radius}
            innerRadius={innerRadius}
            padAngle={padAngle}
            pieSortValues={(a, b) => a - b}
            startAngle={type === 'semi' ? -Math.PI / 2 : 0}
            endAngle={type === 'semi' ? Math.PI / 2 : 360}>
            {(pie) =>
              pie.arcs.map((arc, index) => {
                const [centroidX, centroidY] = pie.path.centroid(arc);

                const isHovered = hoveredArc === arc.data.label || !hoveredArc;

                const arcGenerator = d3Arc()
                  .innerRadius(innerRadius)
                  .outerRadius(radius)
                  .cornerRadius(cornerRadius)
                  .padAngle(padAngle) as unknown as (
                  d: PieArcDatum<{
                    label: string;
                    value: number;
                  }>,
                ) => string;

                const shadowArcGenerator = d3Arc()
                  .innerRadius(innerRadius * 1.7)
                  .outerRadius(isHovered ? radius + 10 : radius + 15)
                  .cornerRadius(cornerRadius) as unknown as (
                  d: PieArcDatum<{
                    label: string;
                    value: number;
                  }>,
                ) => string;

                return (
                  <g
                    key={`arc-${index}`}
                    onMouseEnter={(event) => {
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
                    }}>
                    <path
                      d={arcGenerator(arc)}
                      fill={
                        isLoading
                          ? `url(#${shimmerGradientId})`
                          : colorScale(arc.data.label)
                      }
                      stroke={'white'}
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
                        fill={colorScale(arc.data.label)}
                        opacity={0.2}
                      />
                    )}
                    {!isLoading && !hideLabels && (
                      <text
                        x={centroidX}
                        y={centroidY}
                        dy=".33em"
                        fill="white"
                        fontSize={10}
                        textAnchor="middle"
                        fontWeight={
                          hoveredArc === arc.data.label ? 'bold' : 'normal'
                        }>
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
};

export { DonutChart };
