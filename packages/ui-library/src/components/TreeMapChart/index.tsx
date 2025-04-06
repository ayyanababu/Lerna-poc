import React, { useMemo, useState } from "react";
import { Group } from "@visx/group";
import { hierarchy, Treemap, treemapSquarify } from "@visx/hierarchy";
import { useParentSize } from "@visx/responsive";
import { scaleOrdinal } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";

import useTheme from "../../hooks/useTheme";
import ChartWrapper from "../ChartWrapper";
import SvgShimmer, { shimmerGradientId } from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import mockTreeMapChartData from "./mockdata";
import { TreeMapChartProps, TreeMapNode } from "./types";

const DEFAULT_MARGIN = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
};

const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;

const TreeMapChart = ({
  data: _data,
  margin = DEFAULT_MARGIN,
  title,
  colors = [],
  isLoading = false,
  titleProps,
  legendsProps,
  tooltipProps,
  timestampProps,
  tilePadding = 1,
  borderRadius = 4,
  showLabels = false,
  onClick = () => {},
}: TreeMapChartProps) => {
  const { theme } = useTheme();
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData>();

  const data = useMemo<TreeMapNode>(
    () => (isLoading ? mockTreeMapChartData : _data),
    [isLoading, _data],
  );

  const root = useMemo(() => {
    if (!data || innerWidth <= 0 || innerHeight <= 0) return null;

    return hierarchy(data)
      .sum((d) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));
  }, [data, innerWidth, innerHeight]);

  const allNodes = useMemo(() => {
    if (!root) return [];

    const nodes: TreeMapNode[] = [];
    root.each((node) => {
      if (node.data && node.depth > 0) {
        nodes.push(node.data);
      }
    });

    return nodes;
  }, [root]);

  const legendData = useMemo(() => {
    if (!root) return [];

    return (
      root.children?.map((node) => ({
        label: node.data.name,
        value: node.value || 0,
      })) || []
    );
  }, [root]);

  const colorScale = useMemo(() => {
    if (colors?.length) {
      return (id: string) => {
        const index = allNodes.findIndex((node) => node.id === id);
        return colors[index % colors.length];
      };
    }

    return (id: string) => {
      const index = allNodes.findIndex((node) => node.id === id);
      return theme.colors.charts.treemap[
        index % theme.colors.charts.treemap.length
      ];
    };
  }, [colors, theme.colors.charts.treemap, allNodes]);

  const handleNodeMouseEnter =
    (node: TreeMapNode) => (event: React.MouseEvent) => {
      if (!isLoading) {
        showTooltip({
          tooltipData: {
            label: node.name,
            value: node.value,
          },
          tooltipLeft: event.clientX,
          tooltipTop: event.clientY,
        });
        setHoveredNode(node.id);
      }
    };

  const handleNodeMouseLeave = () => {
    if (!isLoading) {
      hideTooltip();
      setHoveredNode(null);
    }
  };

  const shouldRenderText = (nodeWidth: number, nodeHeight: number) =>
    nodeWidth > 40 && nodeHeight > 20;

  const getTextColor = (backgroundColor: string) => {
    const r = parseInt(backgroundColor.slice(1, 3), 16);
    const g = parseInt(backgroundColor.slice(3, 5), 16);
    const b = parseInt(backgroundColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  };

  if (!_data) {
    return <div>No data to display.</div>;
  }

  return (
    <ChartWrapper
      minRenderHeight={50}
      ref={parentRef}
      title={title}
      titleProps={titleProps}
      legendsProps={{
        data: legendData,
        colorScale: scaleOrdinal({
          domain: legendData.map((d) => d.label),
          range: legendData.map((_, i) => {
            if (!root || !root.children) return "#ccc";
            return (
              root.children[i]?.data.color ||
              colorScale(root.children[i]?.data.id || "")
            );
          }),
        }),
        isLoading,
        hideIndex,
        setHideIndex,
        hovered: hoveredNode,
        setHovered: setHoveredNode,
        isVisible: false,
        ...legendsProps,
      }}
      tooltipProps={{
        data: tooltipData,
        top: tooltipTop,
        left: tooltipLeft,
        isVisible: !isLoading && tooltipOpen,
        ...tooltipProps,
      }}
      timestampProps={{ isLoading, ...timestampProps }}
    >
      <svg width={width} height={height} rx={borderRadius} ry={borderRadius}>
        {isLoading && <SvgShimmer />}

        <Group top={margin.top} left={margin.left}>
          {root && innerWidth > 0 && innerHeight > 0 && (
            <Treemap
              root={root}
              size={[innerWidth, innerHeight]}
              tile={treemapSquarify}
              paddingInner={tilePadding}
              round
            >
              {(treemap) => (
                <Group>
                  {treemap
                    .descendants()
                    .filter((node) => node.depth > 0) // Skip the root node
                    .map((node, i) => {
                      const nodeWidth = node.x1 - node.x0;
                      const nodeHeight = node.y1 - node.y0;
                      const isHovered = node.data.id === hoveredNode;
                      const nodeOpacity =
                        hoveredNode && !isHovered
                          ? REDUCED_OPACITY
                          : DEFAULT_OPACITY;

                      const nodeColor =
                        node.data.color || colorScale(node.data.id);

                      return (
                        <Group
                          key={`node-${node.data.id}`}
                          opacity={nodeOpacity}
                        >
                          <rect
                            x={node.x0}
                            y={node.y0}
                            width={nodeWidth}
                            height={nodeHeight}
                            fill={
                              isLoading
                                ? `url(#${shimmerGradientId})`
                                : nodeColor
                            }
                            stroke={theme.colors.common.background}
                            strokeWidth={1}
                            cursor="pointer"
                            onClick={() => onClick(i, node.data, data)}
                            onMouseMove={handleNodeMouseEnter(node.data)}
                            onMouseLeave={handleNodeMouseLeave}
                          />

                          {/* Only render text if not loading and the node is large enough */}
                          {!isLoading &&
                            showLabels &&
                            shouldRenderText(nodeWidth, nodeHeight) && (
                              <text
                                x={node.x0 + nodeWidth / 2}
                                y={node.y0 + nodeHeight / 2}
                                dy=".33em"
                                fontSize={12}
                                fontFamily="Arial"
                                textAnchor="middle"
                                fill={getTextColor(nodeColor)}
                                style={{
                                  pointerEvents: "none",
                                  fontWeight: isHovered ? "bold" : "normal",
                                }}
                              >
                                {nodeWidth > 80
                                  ? node.data.name
                                  : `${node.data.name.slice(0, 8)}...`}
                              </text>
                            )}
                        </Group>
                      );
                    })}
                </Group>
              )}
            </Treemap>
          )}
        </Group>
      </svg>
    </ChartWrapper>
  );
};

export default TreeMapChart;
