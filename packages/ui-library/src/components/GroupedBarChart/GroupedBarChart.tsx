import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { Bar } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { capitalize, cloneDeep, lowerCase } from 'lodash-es';
import { default as React, useMemo, useState } from 'react';
import { ChartWrapper, TooltipData } from '../ChartWrapper/ChartWrapper';
import { Title } from '../Title/Title';

interface GroupedBarChartProps {
  data: {
    label: string;
    data: { [key: string]: number };
  }[];
  groupKeys: string[];
  margin?: { top: number; right: number; bottom: number; left: number };
  colors?: string[];
  title?: string;
  timestamp?: string;
  titleProps?: Parameters<typeof Title>[0];
}

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data,
  groupKeys,
  margin = { top: 20, right: 30, bottom: 30, left: 40 },
  colors = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'],
  title,
  timestamp,
  titleProps,
}) => {
  if (!data || data.length === 0) {
    return <div>No data to display.</div>;
  }

  const { parentRef, width, height } = useParentSize({
    debounceTime: 150,
  });
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const legendData = useMemo(() => {
    return groupKeys.map((key, index) => ({
      label: capitalize(lowerCase(key)),
      value: data.reduce(
        (total, categoryData) => total + Number(categoryData.data[key]),
        0,
      ),
      color: colors[index] || '#000',
    }));
  }, [groupKeys, colors, data]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData>();
  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);

  const filteredData = useMemo(() => {
    return data.reduce((acc, categoryData, index) => {
      const d = cloneDeep(categoryData);

      if (hideIndex.length) {
        groupKeys.forEach((groupKey, index) => {
          if (hideIndex.includes(index)) {
            if (d.data) delete d.data[groupKey];
          }
        });
      }
      return [...acc, d];
    }, []);
  }, [data, hideIndex, groupKeys]);

  const maxValue = React.useMemo(
    () =>
      Math.max(
        0,
        ...filteredData.reduce((maxValues, categoryData) => {
          if (categoryData.data) {
            groupKeys.forEach((groupKey) => {
              const value = Number(categoryData.data[groupKey]); // Ensure values are numbers
              if (!isNaN(value)) {
                maxValues.push(value);
              }
            });
          }
          return maxValues;
        }, [] as number[]),
      ),
    [filteredData, groupKeys],
  );

  const categoryScale = React.useMemo(
    () =>
      scaleBand<string>({
        domain: filteredData.map((d) => String(d.label)), // Ensure categoryKey is treated as string
        range: [0, innerWidth],
        padding: 0.2, // Space between category groups
      }),
    [filteredData, innerWidth],
  );

  const groupScale = React.useMemo(
    () =>
      scaleBand<string>({
        domain: groupKeys.filter(
          (key) => !hideIndex.includes(groupKeys.indexOf(key)),
        ),
        range: [0, categoryScale.bandwidth()], // Each group takes a part of category band
        padding: 0.1, // Space between bars within a group
      }),
    [groupKeys, categoryScale, hideIndex],
  );

  const valueScale = React.useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue * 1.2], // Add some padding to the top of the chart
        range: [innerHeight, 0],
      }),
    [innerHeight, maxValue],
  );

  const groupColorScale = useMemo(
    () =>
      scaleOrdinal<string, string>({
        domain: groupKeys,
        range: colors.slice(0, groupKeys.length), // Use colors based on group keys
      }),
    [groupKeys, colors],
  );

  return (
    <ChartWrapper
      ref={parentRef}
      title={title}
      timestamp={timestamp}
      legendData={legendData}
      colorScale={groupColorScale}
      hideIndex={hideIndex}
      setHideIndex={setHideIndex}
      setHovered={setHoveredGroupKey}
      tooltipOpen={tooltipOpen}
      tooltipTop={tooltipTop}
      tooltipLeft={tooltipLeft}
      tooltipData={tooltipData}
      titleProps={titleProps}>
      <svg width={width} height={height}>
        <Group
          top={margin.top}
          left={margin.left}
          style={{
            transition: 'all 0.250s ease-in-out',
          }}>
          {/* Y-Axis */}
          {hideIndex.length !== groupKeys.length && (
            <AxisLeft
              scale={valueScale}
              tickFormat={(value) => `${value}`}
              numTicks={5}
            />
          )}

          {/* X-Axis */}
          <AxisBottom
            scale={categoryScale}
            top={innerHeight}
            tickFormat={(value) =>
              hideIndex.length !== groupKeys.length ? `${value}` : ``
            }
            hideTicks={hideIndex.length === groupKeys.length}
          />

          {/* Bars */}
          {filteredData.map((categoryData, index) => {
            const category = String(categoryData.label); // Ensure category is string
            const categoryX = categoryScale(category) || 0; // Fallback to 0 if undefined category
            return groupKeys.map((groupKey, groupIndex) => {
              const value = Number(categoryData.data?.[groupKey]); // Ensure value is a number
              if (isNaN(value)) return null; // Skip if value is not a number

              const barX = categoryX + (groupScale(groupKey) || 0); // Fallback to 0 if undefined groupKey
              const barWidth = groupScale.bandwidth();
              const barHeight = innerHeight - valueScale(value);
              const barY = valueScale(value);
              const isHoveredGroup =
                hoveredGroupKey && hoveredGroupKey === groupKey;
              const barOpacity = hoveredGroupKey && !isHoveredGroup ? 0.3 : 1;
              const barFill = hideIndex.includes(groupIndex)
                ? '#eee'
                : groupColorScale(groupKey);

              return (
                <Bar
                  key={`${category}-${groupKey}-${index}-${groupIndex}`}
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={barFill}
                  opacity={barOpacity}
                  rx={'5'}
                  onMouseMove={(event) => {
                    showTooltip({
                      tooltipData: {
                        label: capitalize(lowerCase(groupKey)),
                        value,
                        color: barFill,
                      },
                      tooltipLeft: event.clientX,
                      tooltipTop: event.clientY,
                    });
                    setHoveredGroupKey(groupKey);
                  }}
                  onMouseLeave={() => {
                    hideTooltip();
                    setHoveredGroupKey(null);
                  }}
                  style={{
                    transition: 'all 250ms ease-in-out',
                  }}
                />
              );
            });
          })}
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export { GroupedBarChart };
