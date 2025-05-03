import React, { useMemo, useState } from "react";
import { Group } from "@visx/group";
import { hierarchy, Treemap, treemapSquarify } from "@visx/hierarchy";
import { useParentSize } from "@visx/responsive";
import { scaleOrdinal } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";
import type { HierarchyNode } from "d3-hierarchy";

import useTheme from "../../hooks/useTheme";
import ChartWrapper from "../ChartWrapper";
import SvgShimmer, { shimmerGradientId } from "../Shimmer/SvgShimmer";
import { TooltipData } from "../Tooltip/types";
import mockTreeMapChartData from "./mockdata";
import { TreeMapChartProps, TreeMapNode } from "./types";
import ErrorBoundary from "../ErrorBoundary";

type RectNode = HierarchyNode<TreeMapNode> & {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

const EPSILON = 2;
// const STROKE_WIDTH = 1;

const getStrokeWidth = (width: number, height: number) => {
  const size = Math.min(width, height);
  // Scale between 0.3 and 1 based on size
  return Math.max(0.3, Math.min(0.3, size / 500));
};

/* const DEFAULT_MARGIN = {
  top: 0, // Removed top margin
  right: 0, // Removed right margin
  bottom: 0, // Removed bottom margin
  left: 0, // Removed left margin
};
 */
const DEFAULT_OPACITY = 1;
const REDUCED_OPACITY = 0.3;

// Function to identify outer bounds of the treemap
const getOuterBounds = (nodes: RectNode[]) => {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  nodes.forEach((n) => {
    minX = Math.min(minX, n.x0);
    maxX = Math.max(maxX, n.x1);
    minY = Math.min(minY, n.y0);
    maxY = Math.max(maxY, n.y1);
  });

  return { minX, maxX, minY, maxY };
};

// Function to identify which node is at which corner
const getOuterCornerNodes = (nodes: RectNode[]) => {
  const { minX, maxX, minY, maxY } = getOuterBounds(nodes);

  return {
    isTopLeft: (n: RectNode) =>
      Math.abs(n.x0 - minX) < EPSILON && Math.abs(n.y0 - minY) < EPSILON,
    isTopRight: (n: RectNode) =>
      Math.abs(n.x1 - maxX) < EPSILON && Math.abs(n.y0 - minY) < EPSILON,
    isBottomLeft: (n: RectNode) =>
      Math.abs(n.x0 - minX) < EPSILON && Math.abs(n.y1 - maxY) < EPSILON,
    isBottomRight: (n: RectNode) =>
      Math.abs(n.x1 - maxX) < EPSILON && Math.abs(n.y1 - maxY) < EPSILON,
  };
};

// Function to identify which sides of a node are external
const getExternalSides = (node: RectNode, allNodes: RectNode[]) => {
  const { minX, maxX, minY, maxY } = getOuterBounds(allNodes);

  return {
    left: Math.abs(node.x0 - minX) < EPSILON,
    right: Math.abs(node.x1 - maxX) < EPSILON,
    top: Math.abs(node.y0 - minY) < EPSILON,
    bottom: Math.abs(node.y1 - maxY) < EPSILON,
  };
};

const TreeMapChart = ({
  data: _data,
  // margin = DEFAULT_MARGIN,
  title,
  colors = [],
  isLoading = false,
  titleProps,
  legendsProps,
  tooltipProps,
  timestampProps,
  // tilePadding = 0,
  borderRadius = 4,
  showLabels = false,
  onClick = () => {},
}: TreeMapChartProps) => {
  const { theme } = useTheme();
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const innerWidth = width; // Use full width
  const innerHeight = height; // Use full height
  const strokeColor = theme.colors.common.stroke;
  const strokeWidth = getStrokeWidth(width, height);

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hideIndex, setHideIndex] = useState<number[]>([]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipData[]>();

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
          tooltipData: [
            {
              label: node.name,
              value: node.value,
              color: node.color || colorScale(node.id),
            },
          ],
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
      {/* The outer SVG container needs to be rounded */}
      <svg
        width={width}
        height={height}
        rx={borderRadius}
        ry={borderRadius}
        style={{
          shapeRendering: "crispEdges",
          transform: "translateZ(0)",
        }}
      >
        {isLoading && <SvgShimmer />}

        <Group>
          {root && innerWidth > 0 && innerHeight > 0 && (
            <Treemap
              root={root}
              size={[innerWidth, innerHeight]}
              tile={treemapSquarify}
              paddingInner={0}
              round={false}
            >
              {(treemap) => {
                const treeMapNodes = treemap
                  .descendants()
                  .filter((node) => node.depth > 0);

                return (
                  <Group>
                    {treeMapNodes.map((node, i) => {
                      // Use exact coordinates
                      const x0 = node.x0;
                      const x1 = node.x1;
                      const y0 = node.y0;
                      const y1 = node.y1;

                      const nodeWidth = x1 - x0;
                      const nodeHeight = y1 - y0;
                      const isHovered = node.data.id === hoveredNode;
                      const nodeOpacity =
                        hoveredNode && !isHovered
                          ? REDUCED_OPACITY
                          : DEFAULT_OPACITY;

                      const nodeColor =
                        node.data.color || colorScale(node.data.id);

                      // Determine which sides are external
                      const externalSides = getExternalSides(
                        node,
                        treeMapNodes,
                      );

                      // Get corner information
                      const cornerInfo = getOuterCornerNodes(treeMapNodes);

                      // Determine border radius for each corner
                      const topLeftRadius = cornerInfo.isTopLeft(node)
                        ? borderRadius
                        : 0;
                      const topRightRadius = cornerInfo.isTopRight(node)
                        ? borderRadius
                        : 0;
                      const bottomLeftRadius = cornerInfo.isBottomLeft(node)
                        ? borderRadius
                        : 0;
                      const bottomRightRadius = cornerInfo.isBottomRight(node)
                        ? borderRadius
                        : 0;

                      // Calculate a small extension for each node
                      const extend = 0.5;

                      return (
                        <Group
                          key={`node-${node.data.id}`}
                          opacity={nodeOpacity}
                        >
                          {/* Background fill with rounded corners if needed */}
                          <path
                            d={`
                              M ${x0 + topLeftRadius} ${y0}
                              H ${x1 - topRightRadius}
                              ${
                                topRightRadius
                                  ? `Q ${x1} ${y0} ${x1} ${y0 + topRightRadius}`
                                  : `L ${x1} ${y0}`
                              }
                              V ${y1 - bottomRightRadius}
                              ${
                                bottomRightRadius
                                  ? `Q ${x1} ${y1} ${x1 - bottomRightRadius} ${y1}`
                                  : `L ${x1} ${y1}`
                              }
                              H ${x0 + bottomLeftRadius}
                              ${
                                bottomLeftRadius
                                  ? `Q ${x0} ${y1} ${x0} ${y1 - bottomLeftRadius}`
                                  : `L ${x0} ${y1}`
                              }
                              V ${y0 + topLeftRadius}
                              ${
                                topLeftRadius
                                  ? `Q ${x0} ${y0} ${x0 + topLeftRadius} ${y0}`
                                  : `L ${x0} ${y0}`
                              }
                              Z
                            `}
                            fill={
                              isLoading
                                ? `url(#${shimmerGradientId})`
                                : nodeColor
                            }
                            cursor="pointer"
                            onClick={() => onClick(i, node.data, data)}
                            onMouseMove={handleNodeMouseEnter(node.data)}
                            onMouseLeave={handleNodeMouseLeave}
                          />

                          {/* Draw internal borders only - not external borders */}
                          {!externalSides.top && (
                            <line
                              x1={x0 - extend}
                              y1={y0}
                              x2={x1 + extend}
                              y2={y0}
                              stroke={strokeColor}
                              strokeWidth={strokeWidth}
                              pointerEvents="none"
                            />
                          )}
                          {!externalSides.right && (
                            <line
                              x1={x1}
                              y1={y0 - extend}
                              x2={x1}
                              y2={y1 + extend}
                              stroke={strokeColor}
                              strokeWidth={strokeWidth}
                              pointerEvents="none"
                            />
                          )}
                          {!externalSides.bottom && (
                            <line
                              x1={x0 - extend}
                              y1={y1}
                              x2={x1 + extend}
                              y2={y1}
                              stroke={strokeColor}
                              strokeWidth={strokeWidth}
                              pointerEvents="none"
                            />
                          )}
                          {!externalSides.left && (
                            <line
                              x1={x0}
                              y1={y0 - extend}
                              x2={x0}
                              y2={y1 + extend}
                              stroke={strokeColor}
                              strokeWidth={strokeWidth}
                              pointerEvents="none"
                            />
                          )}

                          {/* Only render text if not loading and the node is large enough */}
                          {!isLoading &&
                            showLabels &&
                            shouldRenderText(nodeWidth, nodeHeight) && (
                              <text
                                x={x0 + nodeWidth / 2}
                                y={y0 + nodeHeight / 2}
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
                );
              }}
            </Treemap>
          )}
        </Group>
      </svg>
    </ChartWrapper>
  );
};

const TreeMapChartComponent = (props: TreeMapChartProps) => {
  return (
    <ErrorBoundary>
      <TreeMapChart {...props} />
    </ErrorBoundary>
  );
};

export default TreeMapChartComponent;
