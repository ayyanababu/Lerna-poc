import { Box, Typography } from '@mui/material';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Tooltip } from '@visx/tooltip';
import { capitalize, cloneDeep, lowerCase } from 'lodash-es';
import { default as React, useMemo, useState } from 'react';
import { Legends } from '../Legends/Legends';
import { TimeStamp } from '../TimeStamp/TimeStamp';
import { Title } from '../Title/Title';

interface GroupedBarChartProps {
  width: number;
  height: number;
  data: {
    label: string;
    data: { [key: string]: number };
  }[];
  groupKeys: string[];
  margin?: { top: number; right: number; bottom: number; left: number };
  colors?: string[];
  title?: string;
  timestamp?: string;
}

interface TooltipData {
  label: string;
  data: {
    future: number;
    options: number;
    forwards: number;
    fixedIncome: number;
    others: number;
  };
}

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data,
  groupKeys,
  margin = { top: 20, right: 30, bottom: 30, left: 40 },
  colors = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'],
  title,
  timestamp,
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

  // Tooltip State
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipLeft, setTooltipLeft] = useState<number | null>(null);
  const [tooltipTop, setTooltipTop] = useState<number | null>(null);
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

  const handleMouseOver = (
    event: React.MouseEvent<SVGRectElement>,
    dataPoint: TooltipData,
    groupKey: string,
  ) => {
    console.log(dataPoint, 'handleMouseOver');
    setTooltipOpen(true);
    setTooltipData(dataPoint);
    setTooltipLeft(event.clientX);
    setTooltipTop(event.clientY);
    setHoveredGroupKey(groupKey);
  };

  const handleMouseOut = () => {
    setTooltipOpen(false);
    setTooltipData(null);
    setTooltipLeft(null);
    setTooltipTop(null);
    setHoveredGroupKey(null);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
      <Title title={title} />

      {/* Legend */}
      <Legends
        colorScale={groupColorScale}
        data={legendData}
        hideIndex={hideIndex}
        setHideIndex={setHideIndex}
        setHovered={setHoveredGroupKey}
      />

      <Box
        
        ref={parentRef}
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
          flex: '1 1 100%',
        }}>
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
                    onMouseMove={(event) =>
                      handleMouseOver(event, categoryData, groupKey)
                    }
                    onMouseLeave={handleMouseOut}
                    style={{
                      transition: 'all 250ms ease-in-out',
                    }}
                  />
                );
              });
            })}
          </Group>
        </svg>
      </Box>

      {tooltipOpen &&
        tooltipData &&
        tooltipTop !== null &&
        tooltipLeft !== null && (
          <Tooltip
            top={tooltipTop}
            left={tooltipLeft}
            style={{
              position: 'fixed',
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
            <Typography sx={{ marginBottom: '5px', textAlign: 'center' }}>
              {capitalize(lowerCase(hoveredGroupKey))}
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              {tooltipData?.data?.[hoveredGroupKey]}
            </Typography>
          </Tooltip>
        )}

      <TimeStamp date={timestamp} />
    </Box>
  );
};

export { GroupedBarChart };
