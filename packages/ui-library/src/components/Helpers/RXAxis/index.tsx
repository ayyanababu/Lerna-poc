import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AxisBottom } from "@visx/axis";
import * as d3 from "d3";

import useTheme from "../../../hooks/useTheme";
import { formatNumberWithSuffix, isNumeric } from "../../../utils/number";
import { shimmerClassName } from "../../Shimmer/Shimmer";
import { shimmerGradientId } from "../../Shimmer/SvgShimmer";
import { XAxisProps } from "./types";

//const MAX_LABEL_CHARS = 15;
const FIXED_CLASSNAME_XLABELS = "fixed-classname-xlabels";
const BASE_ADJUST_WIDTH = 0;
const ADD_ADJUST_WIDTH = 0;

function XAxis({
  availableWidth = 0,
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
  refreshAxis,
  barsList,
  chartWidth,
  ...props
}: XAxisProps): JSX.Element | null {
  const { theme } = useTheme();
  const axisRef = useRef<SVGGElement>(null);
  const [isOverlapping, setIsOverlapping] = useState(false);
  const averageWidthPerChar = 6;
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
        const usedRects: { x1: number; x2: number }[] = [];
        nodeList.forEach((node: Element) => {
          const textNode = node as SVGTextElement;
          const pnode = textNode.parentNode as SVGElement;
          let x = 0;
          if (pnode && pnode.getAttribute("transform")) {
            const bbox = textNode.getBBox();
            const transform = pnode.getAttribute("transform");
            if (transform) {
              const translateX = parseFloat(
                transform.split("translate(")[1].split(",")[0],
              );
              x = translateX + bbox.x;
            }
          } else {
            const bbox = textNode.getBBox();
            x = +bbox.x;
          }
          const bbox = textNode.getBBox();
          const rect = {
            x1: x - BASE_ADJUST_WIDTH,
            x2: x + bbox.width + BASE_ADJUST_WIDTH,
          };
          usedRects.push(rect);
        });
        const nodeIndices = Array.from(
          { length: nodeList.length },
          (_, i) => i,
        );
        let isOverlappings = false;
        nodeIndices.forEach((index: number) => {
          nodeList.forEach((node: Element, nindex: number) => {
            if (index !== nindex) {
              const textNode = node as SVGTextElement;
              const bbox = textNode.getBBox();
              let x = 0;
              const pnode = node.parentNode as SVGElement;
              if (pnode && pnode.getAttribute("transform")) {
                const transform = pnode.getAttribute("transform");
                if (transform) {
                  const translateX = parseFloat(
                    transform.split("translate(")[1].split(",")[0],
                  );
                  x = translateX + bbox.x;
                }
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
              const isOverLapping = us.some(
                (r: { x1: number; x2: number }) =>
                  !(rect.x2 >= r.x1 && rect.x2 <= r.x2),
              );
              if (isOverLapping) {
                isOverlappings = isOverLapping;
              }
            }
          });
        });
        if (isOverlappings) {
          setIsOverlapping(true);
        } else {
          setIsOverlapping(false);
        }
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
    return () => {};
  }, []);

  useLayoutEffect(() => {
    if (isOverlapping && axisRef.current) {
      const textNodes = axisRef.current.querySelectorAll(
        `.${FIXED_CLASSNAME_XLABELS}`,
      ) as NodeListOf<SVGTextElement>;
      if (textNodes.length > 0) {
        wrap(textNodes); // 50 = approximate max width per label before wrapping
      }
    }
  }, [isOverlapping, axisRef.current, calculateLabelWidths]);

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
    //    angle,
    evenPositionsMap,
    formatLabel,
    //    rotate,
    //    textAnchor,
    tickValues,
  } = useMemo(() => {
    const scaleLabels =
      providedLabels ||
      (scale.domain && typeof scale.domain === "function"
        ? scale.domain().map(String)
        : []);
    const availableWidthPerLabel = availableWidth / scaleLabels.length;
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
        },
        rotate: false,
        textAnchor: "middle",
        tickValues: [],
      };
    }
    if (scaleLabels.length < dynamicNumTicks || isOverlapping) {
      return {
        angle: 0,
        evenPositionsMap: null,
        formatLabel: (label: string): string => {
          return String(label);
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
      return {
        angle: -45,
        evenPositionsMap: null,
        formatLabel: (label: string): string => {
          return String(label);
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

    return {
      angle: -45,
      evenPositionsMap: positions,
      formatLabel: (label: string): string => {
        return String(label);
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

  const wrap = (textNodes: NodeListOf<SVGTextElement>) => {
    const widths: number[] = [];
    interface DomainCheck {
      name: string;
      status: boolean;
    }
    const domainCheck: DomainCheck[] = [];
    scale.domain().forEach((dmn) => {
      domainCheck.push({ name: dmn, status: false });
    });
    console.log(barsList);
    barsList?.forEach((barw, index) => {
      if (index === barsList.length - 1) {
        const x: number = barw.x;
        widths.push(chartWidth - x);
      } else {
        let domainfound = true;
        domainCheck.map((dmn) => {
          const dmns = dmn;
          if (dmn.name === barw.label && !dmn.status) {
            if (index > 1) {
              if (barsList[index].x === barsList[index - 1].x) {
                domainfound = true;
              } else {
                domainfound = false;
              }
              dmns.status = true;
            } else {
              domainfound = false;
              dmns.status = true;
            }
          }
          return dmns;
        });
        if (!domainfound) {
          const x1: number = barw.x;
          const x2: number = barsList[index + 1].x;
          const diffwidth = x2 - x1;
          widths.push(diffwidth);
        }
      }
    });
    let windex = -1;
    textNodes.forEach((textNode, index) => {
      windex++;
      const text = d3.select(textNode);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line: string[] = [];
      let lineNumber = 0;
      const lineHeight = 1.1; // ems
      const y = 1;
      const dy = 1;
      let xwrap: number = 0;
      if (windex === 0 || windex === textNodes.length - 1) {
        if (windex === 0) {
          xwrap -= addGap;
        }
        if (windex === textNodes.length - 1) {
          xwrap += addGap * 1.5;
        }
      } else {
        xwrap += addGap / 2;
      }

      let tspan = text
        .text(null)
        .append("tspan")
        .attr("x", xwrap)
        .attr("y", y)
        .attr("dy", dy + "em");

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node()!.getComputedTextLength() > widths[windex]) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          xwrap = 0;
          if (index === 0 || index === textNodes.length - 1) {
            if (index === 0) {
              xwrap -= addGap;
            }
            if (index === textNodes.length - 1) {
              xwrap += addGap * 1.5;
            }
          } else {
            xwrap += addGap / 2;
          }
          tspan = text
            .append("tspan")
            .attr("x", xwrap)
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
    textNodes.forEach((textNode) => {
      const tspans: SVGTSpanElement[] = [];
      textNode.querySelectorAll("tspan").forEach((tspan) => {
        if (tspan.textContent) {
          tspans.push(tspan as SVGTSpanElement);
        } else {
          textNode.removeChild(tspan);
        }
      });
      let start = 0;
      tspans.forEach((tspn: SVGTSpanElement) => {
        tspn?.setAttribute("dy", `${start}em`);
        start += 1.1;
      });
    });
    let wrapheight = 0;
    textNodes.forEach((textNode) => {
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
        stroke={theme.colors.axis.line}
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
