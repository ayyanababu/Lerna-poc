import React, { useCallback, useMemo, useState } from "react";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { stack } from "@visx/shape";
import { useTooltip } from "@visx/tooltip";
import { capitalize, cloneDeep, lowerCase } from "lodash-es";

import useTheme from "../../hooks/useTheme";
import ChartWrapper from "../ChartWrapper";
import CustomBar from "../CustomBar";
import SvgShimmer, { shimmerGradientId } from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import XAxis from "../XAxis";
import YAxis from "../YAxis";
import { mockVerticalGroupedBarChartData } from "./mockdata";
import { DataPoint, VerticalGroupedBarChartProps } from "./types";

interface CustomBarProps {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
  rx?: number;
  value: number;
  label: string;
  onMouseMove: (event: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

const DEFAULT_MARGIN = {
  top: 20,
  right: 30,
  bottom: 30,
  left: 40,
};
const DEFAULT_BAR_RADIUS = 5;
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;
const SCALE_PADDING = 1.2;

/**
 * VerticalGroupedBarChart component that renders either grouped or stacked bar charts vertically
 */
const VerticalGroupedBarChart: React.FC<VerticalGroupedBarChartProps> = ({
  data: _data,
  groupKeys: _groupKeys,
  type = "grouped",
  margin = DEFAULT_MARGIN,
  title,
  timestamp,
  colors = [],
  isLoading,
  titleProps,
  legendsProps,
  tooltipProps,
  showTicks = false,
}) => {
  const { theme } = useTheme();
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // State hooks
  const [hoveredGroupKey, setHoveredGroupKey] = useState<
    string | null | undefined
  >(null);
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
  }>(
    () =>
      isLoading
        ? mockVerticalGroupedBarChartData
        : { data: _data, groupKeys: _groupKeys },
    [isLoading, _data, _groupKeys],
  );

  // Filter data based on hidden groups
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
    [data, hideIndex, groupKeys],
  );

  // Prepare legend data
  const legendData = useMemo(
    () =>
      groupKeys.map((key) => ({
        label: capitalize(lowerCase(key)),
        value: data.reduce(
          (total, categoryData) => total + Number(categoryData.data[key] || 0),
          0,
        ),
      })),
    [groupKeys, data],
  );

  // Get active keys (not hidden)
  const activeKeys = useMemo(
    () => groupKeys.filter((_, index) => !hideIndex.includes(index)),
    [groupKeys, hideIndex],
  );

  // Generate stacked data if chart type is stacked
  const stackedData = useMemo(() => {
    if (type !== "stacked") return null;

    try {
      // Convert data to the format expected by stack generator
      const prepared = filteredData.map((item) => {
        const result: { label: string; [key: string]: string | number } = {
          label: item.label,
        };
        activeKeys.forEach((key) => {
          result[key] = Number(item.data[key]) || 0;
        });
        return result;
      });

      // Create stack generator with the active keys
      const stackGenerator = stack({ keys: activeKeys });
      return stackGenerator(prepared);
    } catch (error) {
      console.error("Error generating stack data:", error);
      return [];
    }
  }, [type, activeKeys, filteredData]);

  // Calculate max value for y-axis scale
  const maxValue = useMemo(() => {
    if (type === "stacked") {
      // For stacked charts, sum all values in each category
      return Math.max(
        0,
        ...filteredData.map((d) =>
          Object.entries(d.data)
            .filter(([key]) => activeKeys.includes(key))
            .reduce((sum, [, value]) => sum + Number(value || 0), 0),
        ),
      );
    }

    // For grouped charts, find max individual value
    return Math.max(
      0,
      ...filteredData.reduce((values, categoryData) => {
        activeKeys.forEach((key) => {
          const value = Number(categoryData.data?.[key]);
          if (!Number.isNaN(value)) {
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
        padding: 0.4, // Increased padding for thinner bars
      }),
    [filteredData, innerWidth],
  );

  const groupScale = useMemo(
    () =>
      scaleBand<string>({
        domain: activeKeys,
        range: [0, categoryScale.bandwidth()],
        padding: 0.3, // Increased padding for thinner bars
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
        range: colors?.length ? colors : theme.colors.charts.bar,
      }),
    [groupKeys, colors, theme.colors.charts.bar],
  );

  // Helper function to create bars
  const renderBar = (props: CustomBarProps) => <CustomBar {...props} />;

  // Handler for mouse events
  const handleMouseMove = useCallback(
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
    },
    [isLoading, showTooltip],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isLoading) {
      hideTooltip();
      setHoveredGroupKey(null);
    }
  }, [isLoading, hideTooltip]);

  // Render stacked bars
  const renderStackedBars = useCallback(() => {
    if (!stackedData) return null;

    return filteredData.map((categoryData, categoryIndex) => {
      const category = String(categoryData.label);
      const barX = categoryScale(category) || 0;
      const barWidth = categoryScale.bandwidth();

      return activeKeys.map((groupKey) => {
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
          rx: 0, // Always set to 0 for stacked bars
          value,
          label: groupKey,
          onMouseMove: handleMouseMove(groupKey, value),
          onMouseLeave: handleMouseLeave,
        });
      });
    });
  }, [
    stackedData,
    filteredData,
    categoryScale,
    activeKeys,
    valueScale,
    hoveredGroupKey,
    isLoading,
    groupColorScale,
    handleMouseMove,
    handleMouseLeave,
  ]);

  // Render grouped bars
  const renderGroupedBars = useCallback(
    () =>
      filteredData.map((categoryData) => {
        const category = String(categoryData.label);
        const categoryX = categoryScale(category) || 0;

        return groupKeys.map((groupKey, groupIndex) => {
          const value = Number(categoryData.data?.[groupKey]);
          if (Number.isNaN(value)) return null;

          const barX = categoryX + (groupScale(groupKey) || 0);
          const barWidth = groupScale.bandwidth();
          const barHeight = innerHeight - valueScale(value);
          const barY = valueScale(value);

          const isHoveredGroup = hoveredGroupKey === groupKey;
          const barOpacity =
            hoveredGroupKey && !isHoveredGroup
              ? REDUCED_OPACITY
              : DEFAULT_OPACITY;

          const getBarFill = () => {
            if (isLoading) return `url(#${shimmerGradientId})`;
            if (hideIndex.includes(groupIndex)) return "#eee";
            return groupColorScale(groupKey);
          };
          const barFill = getBarFill();

          return (
            <g key={`${category}-${groupKey}`}>
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
      }),
    [
      filteredData,
      categoryScale,
      groupKeys,
      groupScale,
      innerHeight,
      valueScale,
      hoveredGroupKey,
      isLoading,
      hideIndex,
      groupColorScale,
      handleMouseMove,
      handleMouseLeave,
    ],
  );

  // Render bars based on chart type
  const renderBars = useCallback(() => {
    if (type === "stacked" && stackedData) {
      return renderStackedBars();
    }
    return renderGroupedBars();
  }, [type, stackedData, renderStackedBars, renderGroupedBars]);

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
      timestampProps={{ timestamp, isLoading }}
    >
      <svg width={width} height={height}>
        {isLoading && <SvgShimmer />}

        <Group top={margin.top} left={margin.left}>
          {/* Y-Axis */}
          {hideIndex.length !== groupKeys.length && (
            <YAxis
              scale={valueScale}
              tickFormat={(value) => `${value}`}
              stroke={theme.colors.axis.line}
              tickStroke={theme.colors.axis.line}
              tickLabelProps={{
                fill: theme.colors.axis.label,
                fontSize: "12px",
                textAnchor: "end",
                dy: "0.33em",
              }}
              hideTicks={!showTicks}
            />
          )}

          {/* Grid Lines */}
          <g>
            {valueScale.ticks(5).map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={innerWidth}
                y1={valueScale(tick)}
                y2={valueScale(tick)}
                stroke={theme.colors.axis.grid}
                strokeDasharray="2,2"
                opacity={0.3}
              />
            ))}
          </g>

          {/* X-Axis */}
          <XAxis
            scale={categoryScale}
            top={innerHeight}
            stroke={theme.colors.axis.line}
            tickStroke={theme.colors.axis.line}
            tickFormat={(value) =>
              hideIndex.length !== groupKeys.length ? `${value}` : ""
            }
            tickLabelProps={{
              fill: theme.colors.axis.label,
              fontSize: "12px",
              textAnchor: "middle",
              dy: "0.33em",
            }}
            hideTicks={hideIndex.length === groupKeys.length || !showTicks}
          />

          {/* Bars */}
          {renderBars()}
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default VerticalGroupedBarChart;
