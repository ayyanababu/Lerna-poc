import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Text } from '@visx/text';
import React from 'react';

interface GroupedBarChartProps {
  width: number;
  height: number;
  data: DataPoint[];
  groupKeys: string[]; // Keys for the groups within each category
  categoryKey: string; // Key for the category
  margin?: { top: number; right: number; bottom: number; left: number };
  colors?: string[]; // Optional colors for each group
}

interface DataPoint {
  [key: string]: string | number; // Flexible data structure
}

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  width,
  height,
  data,
  groupKeys,
  categoryKey,
  margin = { top: 20, right: 30, bottom: 30, left: 40 },
  colors = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'], // Default color palette
}) => {
  if (!data || data.length === 0) {
    return <div>No data to display.</div>;
  }

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const categoryScale = React.useMemo(
    () =>
      scaleBand<string>({
        domain: data.map((d) => String(d[categoryKey])), // Ensure categoryKey is treated as string
        range: [0, innerWidth],
        padding: 0.2, // Space between category groups
      }),
    [data, innerWidth, categoryKey]
  );

  const groupScale = React.useMemo(
    () =>
      scaleBand<string>({
        domain: groupKeys,
        range: [0, categoryScale.bandwidth()], // Each group takes a part of category band
        padding: 0.1, // Space between bars within a group
      }),
    [groupKeys, categoryScale]
  );

  const maxValue = React.useMemo(
    () =>
      Math.max(
        0,
        ...data.reduce((maxValues, categoryData) => {
          groupKeys.forEach((groupKey) => {
            const value = Number(categoryData[groupKey]); // Ensure values are numbers
            if (!isNaN(value)) {
              maxValues.push(value);
            }
          });
          return maxValues;
        }, [] as number[])
      ),
    [data, groupKeys]
  );

  const valueScale = React.useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue * 1.2], // Add some padding to the top of the chart
        range: [innerHeight, 0],
      }),
    [innerHeight, maxValue]
  );

  return (
    <svg width={width} height={height}>
      <Group top={margin.top} left={margin.left}>
        {/* Y-Axis */}
        <AxisLeft scale={valueScale} tickFormat={(value) => `${value}`} numTicks={5} />

        {/* X-Axis */}
        <AxisBottom
          scale={categoryScale}
          top={innerHeight}
          tickFormat={(value) => `${value}`}
        />

        {/* Bars */}
        {data.map((dataPoint, index) => {
          const category = String(dataPoint[categoryKey]); // Ensure category is string
          const categoryX = categoryScale(category) || 0; // Fallback to 0 if undefined category
          return groupKeys.map((groupKey, groupIndex) => {
            const value = Number(dataPoint[groupKey]); // Ensure value is a number
            if (isNaN(value)) return null; // Skip if value is not a number

            const barX = categoryX + (groupScale(groupKey) || 0); // Fallback to 0 if undefined groupKey
            const barWidth = groupScale.bandwidth();
            const barHeight = innerHeight - valueScale(value);
            const barY = valueScale(value);

            return (
              <Bar
                key={`${category}-${groupKey}-${index}-${groupIndex}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={colors[groupIndex % colors.length]} // Cycle through colors
              />
            );
          });
        })}

        {/* Chart Title (Optional) */}
        <Text
          x={innerWidth / 2}
          y={-margin.top / 2}
          textAnchor="middle"
          fontSize={16}
          fontWeight={600}
        >
          Grouped Bar Chart
        </Text>
      </Group>
    </svg>
  );
};

export { GroupedBarChart };
