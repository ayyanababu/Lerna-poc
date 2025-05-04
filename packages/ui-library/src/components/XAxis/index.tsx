import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AxisBottom } from "@visx/axis";
import * as d3 from "d3";

import useTheme from "../../hooks/useTheme";
import { formatNumberWithSuffix, isNumeric } from "../../utils/number";
import { shimmerClassName } from "../Shimmer/Shimmer";
import { shimmerGradientId } from "../Shimmer/SvgShimmer";
import { XAxisProps } from "./types";

//const MAX_LABEL_CHARS = 15;
const FIXED_CLASSNAME_XLABELS = "fixed-classname-xlabels";
const BASE_ADJUST_WIDTH = 0;
const ADD_ADJUST_WIDTH = 0;

function XAxis({
  availableWidth = 0,
  rotated,
  hideAllTicks = false,
  isLoading = false,
  labels: providedLabels,
  numTicks = 5,
  scale,
  showAxisLine = false,
  showTicks = false,
  top,
  addGap,
  wrapped,
  barWidth,
  isVisible = true,
  labelProps: externalLabelProps,
  tickLabelProps: externalTickLabelProps,
  tickLength = 5,
  labelOffset = 8,
  ...props
}: XAxisProps): JSX.Element | null {
  const { theme } = useTheme();
  const axisRef = useRef<SVGGElement>(null);
  const [isOverlapping, setIsOverlapping] = useState(false);
  const [averageWidthPerChar, setAverageWidthPerChar] = useState(6);
  const [isWrapped, setWrapped] = useState(false);
  const [wrappedMaxHeight, setwrappedMaxHeight] = useState(0);

  const calculateLabelWidths = useCallback(
    (ref: React.RefObject<SVGGElement>) => {
      setIsOverlapping(false);
      requestAnimationFrame(() => {
        if (!ref.current) return;

        const nodeList = ref.current.querySelectorAll(
          `.${FIXED_CLASSNAME_XLABELS}`,
        );

        if (!nodeList.length) {
          calculateLabelWidths(ref);
          return;
        }

        //   let lastRight = 0;
        //   let overlapping = false;
        //    let widthSum = 0;
        //    let totalChars = 0;
        const usedRects: { x1: number; x2: number }[] = [];
        nodeList.forEach((node: SVGTextElement) => {
          console.log(node);
          const bbox = node.getBBox();
          const pnode = node.parentNode as Element;
          let x = 0;
          if (pnode.getAttribute("transform")) {
            x =
              +pnode
                .getAttribute("transform")
                .split("translate(")[1]
                .split(",")[0] + bbox.x;
          } else {
            x = +bbox.x;
          }
          const rect = {
            x1: x - BASE_ADJUST_WIDTH,
            x2: x + bbox.width + BASE_ADJUST_WIDTH,
          };
          usedRects.push(rect);
        });
        console.log("xaxisused", usedRects);
        const nodeIndices = Array.from(
          { length: nodeList.length },
          (_, i) => i,
        );
        let isOverlappings = false;
        nodeIndices.forEach((index: number) => {
          nodeList.forEach((node: SVGTextElement, nindex: number) => {
            console.log(node.textContent);
            if (index !== nindex) {
              const bbox = node.getBBox();
              let x = 0;
              const pnode = node.parentNode as Element;
              if (pnode.getAttribute("transform")) {
                x =
                  +pnode
                    .getAttribute("transform")
                    .split("translate(")[1]
                    .split(",")[0] + bbox.x;
              } else {
                x = +bbox.x;
              }
              const us = usedRects.filter(
                (r: { x1: number; x2: number }, i: number) => i !== index,
              );
              const rect = {
                x1: x - ADD_ADJUST_WIDTH,
                x2: x + bbox.width + ADD_ADJUST_WIDTH,
              };
              const isOverlapping = us.some(
                (r: { x1: number; x2: number }) =>
                  !(rect.x2 >= r.x1 && rect.x2 <= r.x2),
              );
              if (isOverlapping) {
                isOverlappings = isOverlapping;
              }
            }
          });
        });
        console.log("overlaps", isOverlappings);
        if (isOverlappings) {
          setIsOverlapping(true);
        } else {
          setIsOverlapping(false);
        }
        //        nodeList.forEach((node) => {
        //          const { width, left, right } = node.getBoundingClientRect();
        //          const chars = node.innerHTML.length;
        //
        //          if (lastRight > left) overlapping = true/;
        //
        //          lastRight = right;
        //          widthSum += width;
        //          totalChars += chars;
        //        });

        //        if (overlapping) {
        //          setIsOverlapping(true);
        //          setAverageWidthPerChar(Math.ceil(widthSum / totalChars));
        //        }
      });
    },
    [],
  );

  useLayoutEffect(() => {
    if (axisRef.current) calculateLabelWidths(axisRef);
  }, [calculateLabelWidths]);

  useLayoutEffect(() => {
    if (axisRef.current) {
      const resizeObserver = new ResizeObserver(() =>
        calculateLabelWidths(axisRef),
      );

      if (axisRef.current) resizeObserver.observe(axisRef.current);

      return resizeObserver.unobserve(axisRef.current);
    }
  }, []);

  const overLineStyles = {
    fontSize: "10px",
    fontWeight: "normal",
    lineHeight: "165%",
    letterSpacing: "0.4px",
  };

  const tickFormat = (value: number | string) => {
    if (isNumeric(value)) {
      return formatNumberWithSuffix(Number(value));
    }
    return String(value);
  };

  const dynamicNumTicks = useMemo(() => {
    if (availableWidth <= 0) return numTicks;

    let scaleLabels: string[] = [];

    if (providedLabels?.length) {
      scaleLabels = [...providedLabels];
    } else if (scale.domain && typeof scale.domain === "function") {
      scaleLabels = scale.domain().map(String);
    }

    while (
      scaleLabels.length > 0 &&
      availableWidth / (scaleLabels.join(" ").length * averageWidthPerChar) <
        0.9
    ) {
      scaleLabels.pop();
    }

    return Math.max(4, scaleLabels.length);
  }, [availableWidth, numTicks, scale, providedLabels, averageWidthPerChar]);

  const {
    angle,
    evenPositionsMap,
    formatLabel,
    rotate,
    textAnchor,
    tickValues,
  } = useMemo(() => {
    const scaleLabels =
      providedLabels ||
      (scale.domain && typeof scale.domain === "function"
        ? scale.domain().map(String)
        : []);
    // Calculate available width per label
    const availableWidthPerLabel = availableWidth / scaleLabels.length;
    //    const maxLabelChars = Math.floor(
    //     availableWidthPerLabel / averageWidthPerChar,
    //   );
    const maxLabelLength = Math.max(
      ...scaleLabels.map((label) => String(label).length),
    );
    const estimatedMaxLabelWidth = maxLabelLength * averageWidthPerChar;

    if (scaleLabels.length <= 1) {
      return {
        angle: 0,
        evenPositionsMap: null,
        formatLabel: (label: string): string => {
          return String(label);
          //              if (typeof label !== "string") return String(label);
          //             return label.length > MAX_LABEL_CHARS
          //               ? `${label.substring(0, MAX_LABEL_CHARS - 3)}...`
          //               : label;
        },
        rotate: false,
        textAnchor: "middle",
        tickValues: [],
      };
    }
    //  console.log(dynamicNumTicks, "dynamicNumTicks");
    //  console.log(scaleLabels.length,"scale")
    if (scaleLabels.length < dynamicNumTicks || isOverlapping) {
      return {
        angle: 0,
        evenPositionsMap: null,
        formatLabel: (label: string): string => {
          return String(label);
          //          if (typeof label !== "string") return String(label);

          //          return label.length > maxLabelChars && isOverlapping
          //            ? `${label.substring(0, maxLabelChars - 3)}...`
          //            : label;
        },
        rotate: false,
        textAnchor: "middle",
        tickValues: null,
      };
    }
    if (
      scaleLabels.length <= dynamicNumTicks * 2 ||
      availableWidthPerLabel > estimatedMaxLabelWidth * 0.6
    ) {
      //      const rotatedCharLimit = Math.min(
      //        MAX_LABEL_CHARS,
      //        Math.floor((availableWidthPerLabel * 3.5) / averageWidthPerChar),
      //     );

      return {
        angle: -45,
        evenPositionsMap: null,
        formatLabel: (label: string): string => {
          return String(label);
          //     if (typeof label !== "string") return String(label);
          //      return label.length > rotatedCharLimit
          //        ? `${label.substring(0, rotatedCharLimit - 3)}...`
          //        : label;
        },
        rotate: true,
        textAnchor: "end",
        tickValues: null,
      };
    }

    const indicesToShow: number[] = [0, scaleLabels.length - 1]; // Always show first and last

    const optimalLabelCount = Math.min(dynamicNumTicks, scaleLabels.length);
    const middleLabelsToShow = optimalLabelCount - 2;

    if (middleLabelsToShow > 0 && scaleLabels.length > 2) {
      const step = (scaleLabels.length - 2) / (middleLabelsToShow + 1);
      for (let i = 1; i <= middleLabelsToShow; i += 1) {
        const index = Math.round(step * i);
        if (index > 0 && index < scaleLabels.length - 1) {
          indicesToShow.push(index);
        }
      }
    }

    indicesToShow.sort((a, b) => a - b);

    const positions = new Map();
    const labelCount = indicesToShow.length;

    if (labelCount > 1) {
      const spacing = availableWidth / labelCount;
      indicesToShow.forEach((index, i) => {
        positions.set(scaleLabels[index], i * spacing);
      });
    } else if (labelCount === 1) {
      positions.set(scaleLabels[indicesToShow[0]], availableWidth / 2);
    }

    // Calculate how many characters we can show based on available space

    //const rotatedSpaceFactor = 1.8;
    //    const maxCharsPerLabel = Math.floor(
    //      (availableWidthPerLabel * rotatedSpaceFactor) / averageWidthPerChar,
    //    );

    //    const charLimit = Math.min(MAX_LABEL_CHARS, Math.max(8, maxCharsPerLabel));

    return {
      angle: -45,
      evenPositionsMap: positions,
      formatLabel: (label: string): string => {
        return String(label);
        //    if (typeof label !== "string") return String(label);

        //       return label.length > charLimit
        //         ? `${label.substring(0, charLimit - 3)}...`
        //         : label;
      },
      rotate: true,
      textAnchor: "end",
      tickValues: indicesToShow.map((i) => scaleLabels[i]),
    };
  }, [
    availableWidth,
    providedLabels,
    scale,
    dynamicNumTicks,
    averageWidthPerChar,
    isOverlapping,
  ]);

  const wrap = (textNodes: NodeListOf<SVGTextElement>, width: number) => {
    textNodes.forEach((textNode, index) => {
      const text = d3.select(textNode);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line: string[] = [];
      let lineNumber = 0;
      const lineHeight = 1.1; // ems
      const y = 1;
      const dy = 1;

      let x = 0;
      if (index === 0 || index === textNodes.length - 1) {
        if (index === 0) {
          x = x - addGap;
        }
        if (index === textNodes.length - 1) {
          x = x + addGap * 1.5;
        }
      } else {
        x = x + addGap / 2;
      }

      let tspan = text
        .text(null)
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", dy + "em");

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node()!.getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          let x = 0;
          if (index === 0 || index === textNodes.length - 1) {
            if (index === 0) {
              x = x - addGap;
            }
            if (index === textNodes.length - 1) {
              x = x + addGap * 1.5;
            }
          } else {
            x = x + addGap / 2;
          }
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
    setWrapped(false);
    if (typeof wrapped === "function") {
      wrapped(false);
    }
    textNodes.forEach((textNode, index) => {
      const tspans = [];
      textNode.querySelectorAll("tspan").forEach((tspan) => {
        if (tspan.textContent) {
          tspans.push(tspan);
        } else {
          textNode.removeChild(tspan);
        }
      });
      let start = 0;
      tspans.forEach((tspn) => {
        tspn.setAttribute("dy", `${start}em`);
        start += 1.1;
      });
    });
    let wrapheight = 0;
    textNodes.forEach((textNode, index) => {
      const tlength = textNode.querySelectorAll("tspan").length;
      if (tlength > 1) {
        setWrapped(true);
        if (typeof wrapped === "function") {
          wrapped(true);
        }
        wrapheight =
          textNode.getBBox().height > wrapheight
            ? textNode.getBBox().height
            : wrapheight;
      }
    });
    if (wrapheight) {
      setwrappedMaxHeight(wrapheight);
    }
  };

  useLayoutEffect(() => {
    if (isOverlapping && axisRef.current) {
      const textNodes = axisRef.current.querySelectorAll(
        `.${FIXED_CLASSNAME_XLABELS}`,
      ) as NodeListOf<SVGTextElement>;
      if (textNodes.length > 0) {
        wrap(textNodes, barWidth); // 50 = approximate max width per label before wrapping
      }
    }
  }, [isOverlapping, axisRef.current, calculateLabelWidths]);

  const renderAxisLabel = (
    formattedValue: string | undefined,
    tickProps: React.SVGProps<SVGTextElement>,
  ): JSX.Element => {
    let label = "";
    if (!isLoading) {
      label = formatLabel
        ? formatLabel(formattedValue || "")
        : formattedValue || "";

      if (isNumeric(label)) {
        label = formatNumberWithSuffix(Number(label));
      }
    }

    const textStyle = { ...overLineStyles };

    const xPos =
      evenPositionsMap &&
      tickValues &&
      formattedValue &&
      evenPositionsMap.get(formattedValue) !== undefined
        ? evenPositionsMap.get(formattedValue)
        : tickProps.x;

    const yOffset = showAxisLine ? labelOffset : labelOffset / 2;

    /*     if (rotate) {
      console.log("rotate", rotate);
      console.log("label", label);
      if (typeof rotated === "function") {
        rotated(true);
      }
      return (
        <g transform={`translate(${xPos},${tickProps.y})`}>
          <text
            className={isLoading ? shimmerClassName : ""}
            fill={
              isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label
            }
            style={textStyle}
            textAnchor={textAnchor}
            transform={`rotate(${angle})`}
            dy="0.5em"
            dx="0.32em"
          >
            {label}
          </text>
        </g>
      );
    }
    if (typeof rotated === "function") {
      rotated(false);
    } */
    return (
      <g transform={`translate(${xPos},${tickProps.y})`}>
        <text
          className={isLoading ? shimmerClassName : FIXED_CLASSNAME_XLABELS}
          fill={
            isLoading ? `url(#${shimmerGradientId})` : theme.colors.axis.label
          }
          style={textStyle}
          textAnchor="middle"
          dy={`${yOffset}px`}
        >
          {label}
        </text>
      </g>
    );
  };

  const mergedLabelProps = {
    ...externalLabelProps,
    ...overLineStyles,
    color: theme.colors.axis.title,
    fill: theme.colors.axis.title,
    //  dy: showAxisLine
    //    ? `${labelOffset + 4}px`
    //    : `${labelOffset + (!rotate ? 10 : 62)}px`,
    dy: isWrapped ? wrappedMaxHeight : 10,
  };

  const mergedTickLabelProps = {
    ...externalTickLabelProps,
    ...overLineStyles,
    color: theme.colors.axis.label,
    fill: theme.colors.axis.label,
  };

  if (!isVisible) {
    return null;
  }

  return (
    <g ref={axisRef} id="axis">
      <AxisBottom
        scale={scale}
        top={top}
        stroke={ `${theme.colors.axis.line}${showAxisLine ? "4D" : ""}`}
        tickStroke={theme.colors.axis.line}
        tickValues={tickValues === null ? undefined : tickValues}
        tickLabelProps={mergedTickLabelProps}
        numTicks={dynamicNumTicks}
        hideAxisLine={!showAxisLine}
        hideTicks={hideAllTicks || !showTicks}
        tickLength={showTicks ? tickLength : 0}
        tickComponent={({ formattedValue, ...tickProps }) =>
          renderAxisLabel(formattedValue, tickProps)
        }
        tickFormat={tickFormat}
        labelProps={mergedLabelProps}
        {...props}
      />
    </g>
  );
}

export default XAxis;
