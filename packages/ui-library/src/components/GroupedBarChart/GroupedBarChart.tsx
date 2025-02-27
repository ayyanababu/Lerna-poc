import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { Bar, stack } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { capitalize, cloneDeep, lowerCase } from 'lodash-es';
import { default as React, useMemo, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ChartWrapper } from '../ChartWrapper/ChartWrapper';
import { shimmerClassName } from '../Shimmer/Shimmer';
import SvgShimmer, { shimmerGradientId } from '../Shimmer/SvgShimmer';
import { TooltipData } from '../Tooltip/Tooltip';
import { mockGroupedBarChartData } from './mockdata';
import { BarProps, DataPoint, GroupedBarChartProps } from './types';

const DEFAULT_MARGIN = { top: 20, right: 30, bottom: 30, left: 40 };
const DEFAULT_BAR_RADIUS = 5;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;

/**
 * GroupedBarChart component that renders either grouped or stacked bar charts
 */
const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data: _data,
  groupKeys: _groupKeys,
  type = 'grouped',
  margin = DEFAULT_MARGIN,
  title,
  timestamp,
  titleProps,
  legendsProps,
  tooltipProps,
  isLoading,
}) => {
  if (!_data || _data.length === 0) {
    return <div>No data to display.</div>;
  }

  const { theme } = useTheme();
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // State hooks
  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData>();

  // Process data
  const { data, groupKeys } = useMemo<{
    data: DataPoint[];
    groupKeys: string[];
  }>(() => {
    return isLoading
      ? mockGroupedBarChartData
      : { data: _data, groupKeys: _groupKeys };
  }, [isLoading, _data, _groupKeys]);

  // Filter data based on hidden groups
  const filteredData = useMemo(() => {
    return data.map((categoryData) => {
      const d = cloneDeep(categoryData);

      if (hideIndex.length > 0) {
        groupKeys.forEach((groupKey, index) => {
          if (hideIndex.includes(index) && d.data) {
            delete d.data[groupKey];
          }
        });
      }

      return d;
    });
  }, [data, hideIndex, groupKeys]);

  // Prepare legend data
  const legendData = useMemo(() => {
    return groupKeys.map((key) => ({
      label: capitalize(lowerCase(key)),
      value: data.reduce(
        (total, categoryData) => total + Number(categoryData.data[key] || 0),
        0,
      ),
    }));
  }, [groupKeys, data]);

  // Get active keys (not hidden)
  const activeKeys = useMemo(() => {
    return groupKeys.filter((_, index) => !hideIndex.includes(index));
  }, [groupKeys, hideIndex]);

  // Generate stacked data if chart type is stacked
  const stackedData = useMemo(() => {
    if (type !== 'stacked') return null;

    try {
      // Convert data to the format expected by stack generator
      const prepared = filteredData.map((item) => {
        const result: Record<string, any> = { label: item.label };
        activeKeys.forEach((key) => {
          result[key] = Number(item.data[key]) || 0;
        });
        return result;
      });

      // Create stack generator with the active keys
      const stackGenerator = stack({ keys: activeKeys });
      return stackGenerator(prepared);
    } catch (error) {
      console.error('Error generating stack data:', error);
      return [];
    }
  }, [type, activeKeys, filteredData]);

  // Calculate max value for y-axis scale
  const maxValue = useMemo(() => {
    if (type === 'stacked') {
      // For stacked charts, sum all values in each category
      return Math.max(
        0,
        ...filteredData.map((d) =>
          Object.entries(d.data)
            .filter(([key]) => activeKeys.includes(key))
            .reduce((sum, [_, value]) => sum + Number(value || 0), 0),
        ),
      );
    }

    // For grouped charts, find max individual value
    return Math.max(
      0,
      ...filteredData.reduce((values, categoryData) => {
        activeKeys.forEach((key) => {
          const value = Number(categoryData.data?.[key]);
          if (!isNaN(value)) {
            values.push(value);
          }
        });
        return values;
      }, [] as number[]),
    );
  }, [filteredData, activeKeys, type]);

  // Create scales
  const categoryScale = useMemo(
    () =>
      scaleBand<string>({
        domain: filteredData.map((d) => String(d.label)),
        range: [0, innerWidth],
        padding: 0.2,
      }),
    [filteredData, innerWidth],
  );

  const groupScale = useMemo(
    () =>
      scaleBand<string>({
        domain: activeKeys,
        range: [0, categoryScale.bandwidth()],
        padding: 0.1,
      }),
    [activeKeys, categoryScale],
  );

  const valueScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue * SCALE_PADDING],
        range: [innerHeight, 0],
      }),
    [innerHeight, maxValue],
  );

  const groupColorScale = useMemo(
    () =>
      scaleOrdinal<string, string>({
        domain: groupKeys,
        range: theme.colors.charts.barChart,
      }),
    [groupKeys, theme.colors.charts.barChart],
  );

  // Helper function to create bars
  const renderBar = (props: BarProps) => (
    <Bar {...props} style={{ transition: 'all 250ms ease-in-out' }} />
  );

  // Handler for mouse events
  const handleMouseMove =
    (groupKey: string, value: number) => (event: React.MouseEvent) => {
      if (!isLoading) {
        showTooltip({
          tooltipData: {
            label: capitalize(lowerCase(groupKey)),
            value,
          },
          tooltipLeft: event.clientX,
          tooltipTop: event.clientY,
        });
        setHoveredGroupKey(groupKey);
      }
    };

  const handleMouseLeave = () => {
    if (!isLoading) {
      hideTooltip();
      setHoveredGroupKey(null);
    }
  };

  // Render bars based on chart type
  const renderBars = () => {
    if (type === 'stacked' && stackedData) {
      return renderStackedBars();
    }
    return renderGroupedBars();
  };

  // Render stacked bars
  const renderStackedBars = () => {
    if (!stackedData) return null;

    return filteredData.map((categoryData, categoryIndex) => {
      const category = String(categoryData.label);
      const barX = categoryScale(category) || 0;
      const barWidth = categoryScale.bandwidth();

      return activeKeys.map((groupKey, groupIndex) => {
        // Find the corresponding stack data
        const seriesData = stackedData.find((s) => s.key === groupKey);
        if (!seriesData || !seriesData[categoryIndex]) return null;

        const [y0, y1] = seriesData[categoryIndex];
        const barHeight = valueScale(y0) - valueScale(y1);
        const barY = valueScale(y1);
        const value = y1 - y0;

        if (!value) return null;

        const isHoveredGroup = hoveredGroupKey === groupKey;
        const barOpacity =
          hoveredGroupKey && !isHoveredGroup
            ? REDUCED_OPACITY
            : DEFAULT_OPACITY;

        return renderBar({
          key: `stacked-${category}-${groupKey}`,
          x: barX,
          y: barY,
          width: barWidth,
          height: barHeight,
          fill: isLoading
            ? `url(#${shimmerGradientId})`
            : groupColorScale(groupKey),
          opacity: barOpacity,

          /**
           * Since there is an implementation gap in visx library the rx is set to 0 as a workaround
           * https://github.com/airbnb/visx/issues/1475
           */
          rx: 0,
          // rx: activeKeys.length - 1 === groupIndex ? DEFAULT_BAR_RADIUS : 0,

          value,
          label: groupKey,
          onMouseMove: handleMouseMove(groupKey, value),
          onMouseLeave: handleMouseLeave,
        });
      });
    });
  };

  // Render grouped bars
  const renderGroupedBars = () => {
    return filteredData.map((categoryData, index) => {
      const category = String(categoryData.label);
      const categoryX = categoryScale(category) || 0;

      return groupKeys.map((groupKey, groupIndex) => {
        const value = Number(categoryData.data?.[groupKey]);
        if (isNaN(value)) return null;

        const barX = categoryX + (groupScale(groupKey) || 0);
        const barWidth = groupScale.bandwidth();
        const barHeight = innerHeight - valueScale(value);
        const barY = valueScale(value);

        const isHoveredGroup = hoveredGroupKey === groupKey;
        const barOpacity =
          hoveredGroupKey && !isHoveredGroup
            ? REDUCED_OPACITY
            : DEFAULT_OPACITY;

        const barFill = isLoading
          ? `url(#${shimmerGradientId})`
          : hideIndex.includes(groupIndex)
            ? '#eee'
            : groupColorScale(groupKey);

        return (
          <g key={`${category}-${groupKey}-${index}-${groupIndex}`}>
            {renderBar({
              key: `grouped-${category}-${groupKey}`,
              x: barX,
              y: barY,
              width: barWidth,
              height: barHeight,
              fill: barFill,
              opacity: barOpacity,
              rx: DEFAULT_BAR_RADIUS,
              value,
              label: groupKey,
              onMouseMove: handleMouseMove(groupKey, value),
              onMouseLeave: handleMouseLeave,
            })}
          </g>
        );
      });
    });
  };

  return (
    <ChartWrapper
      ref={parentRef}
      title={title}
      titleProps={titleProps}
      legendsProps={{
        data: legendData,
        colorScale: groupColorScale,
        hideIndex,
        setHideIndex,
        hovered: hoveredGroupKey,
        setHovered: setHoveredGroupKey,
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

        <Group
          top={margin.top}
          left={margin.left}
          style={{ transition: 'all 0.250s ease-in-out' }}>
          {/* Y-Axis */}
          {hideIndex.length !== groupKeys.length && (
            <AxisLeft
              scale={valueScale}
              tickFormat={(value) => `${value}`}
              tickComponent={({ formattedValue, ...tickProps }) => (
                <text
                  {...tickProps}
                  className={`${isLoading ? shimmerClassName : ''}`}
                  fill={
                    isLoading ? `url(#${shimmerGradientId})` : 'currentColor'
                  }
                  style={{
                    color: theme.colors.common.text,
                  }}>
                  {formattedValue}
                </text>
              )}
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
            tickComponent={({ formattedValue, ...tickProps }) => (
              <text
                {...tickProps}
                className={`${isLoading ? shimmerClassName : ''}`}
                fill="currentColor"
                style={{
                  opacity: isLoading ? 0 : 1,
                  color: theme.colors.common.text,
                }}>
                {formattedValue}
              </text>
            )}
            hideTicks={hideIndex.length === groupKeys.length}
          />

          {/* Bars */}
          {renderBars()}
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export { GroupedBarChart };
