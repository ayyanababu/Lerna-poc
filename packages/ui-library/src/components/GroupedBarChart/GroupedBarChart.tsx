import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { BarGroup } from '@visx/shape';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';
import React, { useMemo, useState } from 'react';
import { TimeStamp } from '../TimeStamp/TimeStamp';
import { Title } from '../Title/Title';
// import './GroupedBarChart.css';

const BAR_WIDTH = 20;

const GroupedBarChart = ({
  data,
  colors,
  title = '',
  timestamp,
}: {
  data: {
    label: string;
    data: {
      [key: string]: number;
    };
  }[];
  colors: {
    [key: string]: string;
  };
  title?: string;
  timestamp?: string;
}) => {
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<{
    label: string;
    key: string;
    value: number;
  }>();
  const [, setHoveredArc] = useState<string | null>();

  const margin = { top: 40, right: 20, bottom: 40, left: 40 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Extract keys dynamically from the first data object
  const keys = Object.keys(data[0]?.data || {});

  // X Scale for categories
  const xScale = useMemo(
    () =>
      scaleBand({
        range: [0, xMax],
        round: true,
        domain: data.map((d) => d.label),
        padding: 0.2,
      }),
    [xMax, data],
  );

  // Y Scale for values
  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...data.flatMap((d) => Object.values(d.data)))],
      }),
    [yMax, data],
  );

  // Color scale using provided colors
  const colorScale = scaleOrdinal<string, string>({
    domain: keys,
    range: keys.map((key) => colors[key] || '#ccc'), // Default gray if missing
  });

  // Accessor function
  const getLabel = (d: { label: string }) => {
    console.log(d);
    return d.label;
  };

  return (
    <div className="grouped-bar-chart">
      <Title title={title} />
      <div className="grouped-bar-chart-container" ref={parentRef}>
        <svg width={width} height={height}>
          <Group top={margin.top} left={margin.left}>
            <BarGroup
              data={data}
              keys={keys}
              height={yMax}
              x0={getLabel}
              x0Scale={xScale}
              x1Scale={scaleBand({ domain: keys, padding: 0.1 })}
              yScale={yScale}
              color={colorScale}>
              {(barGroups) =>
                barGroups.map((barGroup, index) => (
                  <Group
                    key={`bar-group-${barGroup.index}-${barGroup.x0}`}
                    left={barGroup.x0}>
                    {barGroup.bars.map((bar, idx) => (
                      <g
                        key={`bar-${bar.key}-${bar.index}`}
                        onMouseEnter={(event) => {
                          showTooltip({
                            // @ts-expect-error TODO: fix this
                            tooltipData: bar,
                            tooltipLeft: event.clientX,
                            tooltipTop: event.clientY,
                          });
                          // @ts-expect-error TODO: fix this
                          setHoveredArc(bar.data.label);
                        }}
                        onMouseLeave={() => {
                          hideTooltip();
                          setHoveredArc(null);
                        }}>
                        <rect
                          x={bar.x + BAR_WIDTH * idx}
                          y={yMax - data?.[index]?.data?.[bar.key]}
                          width={BAR_WIDTH}
                          height={data?.[index]?.data?.[bar.key]}
                          fill={bar.color}
                          rx={BAR_WIDTH / 7}
                        />
                        {JSON.stringify(
                          data?.[index]?.data?.[bar.key],
                          null,
                          2,
                        )}
                        {JSON.stringify(bar, null, 2)}
                        {JSON.stringify(barGroups, null, 2)}
                        <text
                          x={bar.x + BAR_WIDTH * idx}
                          y={yMax - data?.[index]?.data?.[bar.key]}>
                          {data?.[index]?.data?.[bar.key]}
                        </text>
                      </g>
                    ))}
                  </Group>
                ))
              }
            </BarGroup>
          </Group>
        </svg>
        {tooltipOpen && tooltipData && (
          <TooltipWithBounds
            top={tooltipTop}
            left={tooltipLeft}
            style={{
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
              {tooltipData.key}: {tooltipData.value}
            </div>
          </TooltipWithBounds>
        )}
      </div>
      <TimeStamp date={timestamp} />
    </div>
  );
};

export { GroupedBarChart };
