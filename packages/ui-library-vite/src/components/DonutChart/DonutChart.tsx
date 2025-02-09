import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleOrdinal } from '@visx/scale';
import { Pie } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { arc as d3Arc, PieArcDatum } from 'd3-shape';
import { useMemo, useState } from 'react';
import { Legends } from '../Legends/Legends';
import { TimeStamp } from '../TimeStamp/TimeStamp';
import { Title } from '../Title/Title';
import './DonutChart.css';

const DonutChart = ({
  data,
  isHalf,
  hideLabels,
  title = '',
  timestamp,
}: {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  isHalf?: boolean;
  hideLabels?: boolean;
  title?: string;
  timestamp?: string;
}) => {
  const { parentRef, width, height } = useParentSize({
    debounceTime: 150,
  });
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<{
    label: string;
    value: number;
    color: string;
  }>();
  const [hoveredArc, setHoveredArc] = useState<string | null>();
  const [hideIndex, setHideIndex] = useState<number[]>([]);
  const radius = useMemo(
    () => Math.min(width, height) / (isHalf ? 2 : 2.5),
    [isHalf, width, height],
  );
  const innerRadius = useMemo(() => radius * 0.6, [radius]);
  const cornerRadius = 6;
  const padAngle = 0;

  const filteredData = useMemo(() => {
    return data.filter((_, i) => !hideIndex.includes(i));
  }, [hideIndex, data]);

  const colorScale = scaleOrdinal<string, string>({
    domain: data.map((d) => d.label),
    range: data.map((d) => d.color),
  });

  return (
    <div className="donut-chart">
      <Title title={title} />

      {/* Legend */}
      <Legends
        colorScale={colorScale}
        data={data}
        hideIndex={hideIndex}
        setHideIndex={setHideIndex}
        setHoveredArc={setHoveredArc}
      />

      <div className="donut-chart-container" ref={parentRef}>
        <svg width={width} height={height}>
          <Group top={height / (isHalf ? 1.5 : 2)} left={width / 2}>
            <Pie
              data={filteredData}
              pieValue={(d) => d.value}
              outerRadius={radius}
              innerRadius={innerRadius}
              padAngle={padAngle}
              pieSortValues={(a, b) => a - b}
              startAngle={isHalf ? -Math.PI / 2 : 0}
              endAngle={isHalf ? Math.PI / 2 : 360}>
              {(pie) =>
                pie.arcs.map((arc, index) => {
                  const [centroidX, centroidY] = pie.path.centroid(arc);

                  const isHovered =
                    hoveredArc === arc.data.label || !hoveredArc;

                  const arcGenerator = d3Arc()
                    .innerRadius(innerRadius)
                    .outerRadius(radius)
                    .cornerRadius(cornerRadius)
                    .padAngle(padAngle) as unknown as (
                    d: PieArcDatum<{
                      label: string;
                      value: number;
                      color: string;
                    }>,
                  ) => string;

                  const shadowArcGenerator = d3Arc()
                    .innerRadius(innerRadius * 1.7)
                    .outerRadius(isHovered ? radius + 10 : radius + 15)
                    .cornerRadius(cornerRadius) as unknown as (
                    d: PieArcDatum<{
                      label: string;
                      value: number;
                      color: string;
                    }>,
                  ) => string;

                  return (
                    <g
                      key={`arc-${index}`}
                      onMouseEnter={(event) => {
                        showTooltip({
                          tooltipData: arc.data,
                          tooltipLeft: event.clientX + 10,
                          tooltipTop: event.clientY - 10,
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
                      }}
                      className="cursor-pointer transition-all">
                      <path
                        d={arcGenerator(arc)}
                        fill={colorScale(arc.data.label)}
                        stroke={'white'}
                        strokeWidth={2}
                        style={{
                          filter:
                            hoveredArc === arc.data.label
                              ? 'saturate(150%)'
                              : 'saturate(100%)',
                        }}
                        className="transition-all"
                      />
                      {hoveredArc === arc.data.label && (
                        <path
                          d={shadowArcGenerator(arc)}
                          fill={colorScale(arc.data.label)}
                          opacity={0.2}
                          className="transition-all"
                        />
                      )}
                      {!hideLabels && (
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
      </div>

      {tooltipOpen && tooltipData && (
        <div
          style={{
            position: 'absolute',
            top: tooltipTop,
            left: tooltipLeft,
            backgroundColor: 'white',
            color: '#333',
            padding: '10px',
            borderRadius: '6px',
            boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
            border: '1px solid #ddd',
            fontSize: '12px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            transform: 'translate(-50%, -100%)',
            whiteSpace: 'nowrap',
            transition: 'all 0.250s ease-in-out',
          }}>
          <div style={{ marginBottom: '5px', textAlign: 'center' }}>
            {tooltipData.label}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {tooltipData.value}
          </div>
        </div>
      )}

      <TimeStamp date={timestamp} />
    </div>
  );
};

export { DonutChart };
