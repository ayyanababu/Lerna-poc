import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { stack } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { capitalize, cloneDeep, lowerCase } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';

import useTheme from '../../../hooks/useTheme';
import { ChartWrapper } from '../../ChartWrapper';
import CustomBar from '../../CustomBar';
import Grid from '../../Grid';
import SvgShimmer, { shimmerGradientId } from '../../Shimmer/SvgShimmer';
import { TooltipData } from '../../Tooltip/types';
import XAxis from '../../XAxis';
import YAxis from '../../YAxis';
import { mockVerticalStackedBarChartData } from './mockdata';
import { VerticalStackedBarChartProps } from './types';

const DEFAULT_MARGIN = {
  top: 20,
  right: 30,
  bottom: 100,
  left: 50
};

const DEFAULT_BAR_RADIUS = 4; // Top bar radius
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;
const MAX_BAR_WIDTH = 16;

function VerticalStackedBar({
  data: _data,
  groupKeys: _groupKeys,
  margin = DEFAULT_MARGIN,
  title,
  timestamp,
  colors = [],
  isLoading,
  titleProps,
  legendsProps,
  tooltipProps,
  showTicks = false,
  yAxisProps,
  xAxisProps,
  gridProps,
  barProps,
  timestampProps,
  showYAxis = true,
  showXAxis = true
}: VerticalStackedBarChartProps) {
  const { theme } = useTheme();
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);

  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
    useTooltip<TooltipData>();

  const { data, groupKeys } = useMemo(
    () => (isLoading ? mockVerticalStackedBarChartData : { data: _data, groupKeys: _groupKeys }),
    [isLoading, _data, _groupKeys]
  );

  const filteredData = useMemo(
    () =>
      data.map((categoryData) => {
        const d = cloneDeep(categoryData);
        if (hideIndex.length > 0) {
          groupKeys.forEach((groupKey, index) => {
            if (hideIndex.includes(index) && d.data) {
              delete d.data[groupKey];
            }
          });
        }
        return d;
      }),
    [data, hideIndex, groupKeys]
  );

  const legendData = useMemo(
    () =>
      groupKeys.map((key) => ({
        label: capitalize(lowerCase(key)),
        value: data.reduce((total, categoryData) => total + Number(categoryData.data[key] || 0), 0)
      })),
    [groupKeys, data]
  );

  const activeKeys = useMemo(
    () => groupKeys.filter((_, index) => !hideIndex.includes(index)),
    [groupKeys, hideIndex]
  );

  const stackedData = useMemo(() => {
    try {
      const prepared = filteredData.map((item) => {
        const result: Record<string, number | string> = { label: item.label };
        activeKeys.forEach((key) => {
          result[key] = Number(item.data[key]) || 0;
        });
        return result;
      });
      const stackGenerator = stack({ keys: activeKeys });
      return stackGenerator(prepared);
    } catch (error) {
      console.error('Error generating stack data:', error);
      return [];
    }
  }, [activeKeys, filteredData]);

  const maxValue = useMemo(
    () =>
      Math.max(
        0,
        ...filteredData.map((d) =>
          Object.entries(d.data)
            .filter(([key]) => activeKeys.includes(key))
            .reduce((sum, [_, value]) => sum + Number(value || 0), 0)
        )
      ),
    [filteredData, activeKeys]
  );

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: filteredData.map((d) => String(d.label)),
        range: [0, innerWidth],
        padding: 0.4
      }),
    [filteredData, innerWidth]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue * SCALE_PADDING],
        range: [innerHeight, 0]
      }),
    [innerHeight, maxValue]
  );

  const colorScale = useMemo(
    () =>
      scaleOrdinal<string, string>({
        domain: groupKeys,
        range: colors?.length ? colors : theme.colors.charts.bar
      }),
    [groupKeys, colors, theme.colors.charts.bar]
  );

  const handleMouseMove = useCallback(
    (groupKey: string, value: number) => (event: React.MouseEvent) => {
      if (!isLoading) {
        showTooltip({
          tooltipData: {
            label: capitalize(lowerCase(groupKey)),
            value
          },
          tooltipLeft: event.clientX,
          tooltipTop: event.clientY
        });
        setHoveredGroupKey(groupKey);
      }
    },
    [isLoading, showTooltip, setHoveredGroupKey]
  );

  const handleMouseLeave = useCallback(() => {
    if (!isLoading) {
      hideTooltip();
      setHoveredGroupKey(null);
    }
  }, [isLoading, hideTooltip, setHoveredGroupKey]);

  const renderStackedBars = useCallback(
    () =>
      filteredData.map((categoryData) => {
        const category = String(categoryData.label);
        // Calculate bar width with maximum limit
        const calculatedBarWidth = xScale.bandwidth();
        const barWidth = Math.min(calculatedBarWidth, MAX_BAR_WIDTH);

        // If the bar width is limited, center it
        const barX =
          barWidth < calculatedBarWidth
            ? (xScale(category) || 0) + (calculatedBarWidth - barWidth) / 2
            : xScale(category) || 0;

        // Calculate dynamic radius based on bar width
        const dynamicRadius = Math.min(DEFAULT_BAR_RADIUS, barWidth / 2);

        return activeKeys.map((groupKey) => {
          const seriesData = stackedData.find((s) => s.key === groupKey);
          if (!seriesData) return null;

          const categoryIndex = filteredData.findIndex((d) => d.label === categoryData.label);
          if (categoryIndex === -1) return null;

          const [y0, y1] = seriesData[categoryIndex];
          const barHeight = yScale(y0) - yScale(y1);
          const barY = yScale(y1);
          const value = y1 - y0;

          if (!value) return null;

          const isHoveredGroup = hoveredGroupKey === groupKey;
          const barOpacity = hoveredGroupKey && !isHoveredGroup ? REDUCED_OPACITY : DEFAULT_OPACITY;

          // Determine if this is the top bar in the stack
          const isTopBar =
            seriesData.key ===
            stackedData.reduce((topKey, current) => {
              const currentY1 = current[categoryIndex]?.[1] || 0;
              const topY1 = stackedData.find((s) => s.key === topKey)?.[categoryIndex]?.[1] || 0;
              return currentY1 > topY1 ? current.key : topKey;
            }, activeKeys[0]);

          return (
            <CustomBar
              key={`stacked-${category}-${groupKey}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill={isLoading ? `url(#${shimmerGradientId})` : colorScale(groupKey)}
              opacity={barOpacity}
              pathProps={
                isTopBar
                  ? {
                      d: `
                                    M ${barX},${barY + barHeight}
                                    L ${barX + barWidth},${barY + barHeight}
                                    L ${barX + barWidth},${barY + dynamicRadius}
                                    Q ${barX + barWidth},${barY} ${
                                      barX + barWidth - dynamicRadius
                                    },${barY}
                                    L ${barX + dynamicRadius},${barY}
                                    Q ${barX},${barY} ${barX},${barY + dynamicRadius}
                                    L ${barX},${barY + barHeight}
                                    Z
                                `
                    }
                  : undefined
              }
              rx={0}
              // value={value}
              // label={groupKey}
              onMouseMove={handleMouseMove(groupKey, value)}
              onMouseLeave={handleMouseLeave}
              {...barProps}
            />
          );
        });
      }),
    [
      filteredData,
      xScale,
      activeKeys,
      stackedData,
      yScale,
      hoveredGroupKey,
      isLoading,
      colorScale,
      handleMouseMove,
      handleMouseLeave,
      barProps
    ]
  );

  const renderBars = useCallback(() => renderStackedBars(), [renderStackedBars]);

  if (!_data || _data.length === 0) {
    return <div>No data to display.</div>;
  }
  return (
    <ChartWrapper
      ref={parentRef}
      title={title}
      titleProps={titleProps}
      legendsProps={{
        data: legendData,
        colorScale,
        hideIndex,
        setHideIndex,
        hovered: hoveredGroupKey,
        setHovered: setHoveredGroupKey,
        isLoading,
        ...legendsProps
      }}
      tooltipProps={{
        data: tooltipData,
        top: tooltipTop,
        left: tooltipLeft,
        isVisible: !isLoading && tooltipOpen,
        ...tooltipProps
      }}
      timestampProps={{ timestamp, isLoading, ...timestampProps }}
    >
      <svg width={width} height={height}>
        {isLoading && <SvgShimmer />}

        <Group top={margin.top} left={margin.left}>
          <YAxis
            scale={yScale}
            isLoading={isLoading}
            showTicks={showTicks}
            showAxisLine={showYAxis}
            {...yAxisProps}
          />

          <Grid
            width={innerWidth}
            yScale={yScale}
            numTicks={5}
            isLoading={isLoading}
            {...gridProps}
          />

          <XAxis
            scale={xScale}
            top={innerHeight}
            isLoading={isLoading}
            showTicks={showTicks}
            showAxisLine={showXAxis}
            labels={filteredData.map((d) => String(d.label))}
            availableWidth={innerWidth}
            autoRotate
            {...xAxisProps}
          />

          {renderBars()}
        </Group>
      </svg>
    </ChartWrapper>
  );
}

export default VerticalStackedBar;
