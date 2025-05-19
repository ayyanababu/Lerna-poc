import React, { useCallback, useEffect, useMemo, useRef } from "react";

import LegendItem from "./LegendItem";
import { LegendPosition, LegendsProps, LegendVariant } from "./types";


function Legends({
  colorScale,
  data,
  hideIndex,
  setHideIndex,
  hovered,
  setHovered,
  position = LegendPosition.TOP,
  onClick,
  isLoading = false,
  doStrike = false,
  isVisible = true,
  variant = LegendVariant.COMPACT,
  hideValues = false,
  isLegendRendered,
  eachLegendGap = 8,
  generatedLegendHeight,
  generateAxis,
  legendBoxWidth,
  hideLegendLableClick = true,
  showArrow = true,
  chart
}: LegendsProps) {
  const legends_ref = useRef<SVGGElement | null>(null);

  const positionStyles = useMemo(() => {
    switch (position) {
      case "left":
        return "translate(0, 50%)";
      case "right":
        return "translate(100%, 50%)";
      case "bottom":
        return "translate(8, 0)";
      case "top":
      default:
        return "translate(0, 0)";
    }
  }, [position]);

  useEffect(() => {
    if (generateAxis && hideIndex) {
      generateAxis(hideIndex);
    }
  }, [hideIndex]);

  useEffect(() => {
    if (
      eachLegendGap &&
      data &&
      generatedLegendHeight &&
      legends_ref &&
      legends_ref.current
    ) {
      generatedLegendHeight(legends_ref.current.getBBox().height + 10);
    }
  }, [data, generatedLegendHeight, eachLegendGap, isLegendRendered]);

  const handleToggleItem = useCallback(
    (index: number) => {
      if (setHideIndex && hideIndex) {
        setHideIndex((prev) =>
          prev.includes(index)
            ? prev.filter((idx) => idx !== index)
            : [...prev, index],
        );
      }
    },
    [setHideIndex, hideIndex],
  );

  const handleMouseOver = useCallback(
    (labelText: string) => {
      if (setHovered) {
        setHovered(labelText);
      }
    },
    [setHovered],
  );

  const handleMouseLeave = useCallback(() => {
    if (setHovered) {
      setHovered(null);
    }
  }, [setHovered]);

  if (!data || !colorScale || !setHideIndex || !setHovered || !isVisible) {
    return null;
  }

  const wrapLegendsText = () => {
    if (legends_ref.current && legendBoxWidth && legendBoxWidth > 0) {
      const gs = legends_ref.current.querySelectorAll(".legendItems");
      const donestatus: {
        [key: number]: { element: SVGGElement; status: boolean };
      } = {};
      gs.forEach((gt, index) => {
        donestatus[index] = {
          element: gt as SVGGElement,
          status: false,
        };
      });
      type Position = {
        object: Element;
        row: number;
        x: number;
        y: number;
        cwidth: number;
        width: number;
      };
      type Positions = Record<string, Position[]>;
      const positions: Positions = {};
      let start = 0;
      let row = 0;
      row = 1;
      let addwidth = 0;
      let newwidth = 0;
      while (start < gs.length) {
        if (legendBoxWidth > 600) {
          addwidth += (gs[start] as SVGGElement).getBBox().width - 20 + 8;
        } else {
          addwidth += (gs[start] as SVGGElement).getBBox().width + 8;
        }
        if (addwidth > legendBoxWidth) {
          row++;
          addwidth = 0;
          newwidth = 0;
          if (!positions[row]) {
            positions[row] = [];
          }
          if (eachLegendGap) {
            positions[row].push({
              object: gs[start],
              row: row,
              x: newwidth,
              y: (chart.toUpperCase() === "BAR AND LINE"?(row - 1):(legendBoxWidth > 300?(row-1):(row - 2))) * eachLegendGap,
              cwidth:
                newwidth +
                (gs[start] as SVGGElement).getBoundingClientRect().width,
              width: (gs[start] as SVGGElement).getBoundingClientRect().width,
            });
            newwidth += (gs[start] as SVGGElement).getBBox().width + 8;
            addwidth += (gs[start] as SVGGElement).getBBox().width + 8;
          }
        } else {
          if (!positions[row]) {
            positions[row] = [];
          }
          if (eachLegendGap) {
            positions[row].push({
              object: gs[start],
              row: row,
              x: newwidth,
              y: (row - 1) * eachLegendGap,
              cwidth:
                newwidth +
                (gs[start] as SVGGElement).getBoundingClientRect().width,
              width: (gs[start] as SVGGElement).getBoundingClientRect().width,
            });
            newwidth += (gs[start] as SVGGElement).getBBox().width + 8;
          }
        }
        start++;
      }
      Object.keys(positions).forEach((positionkey: string) => {
        positions[positionkey].forEach((rowitem) => {
          rowitem.object.setAttribute(
            "transform",
            `translate(${rowitem.x},${rowitem.y})`,
          );
        });
      });
      if (generatedLegendHeight) {
        generatedLegendHeight(legends_ref.current.getBBox().height + 10);
      }
    }
  };

  return (
    <g ref={legends_ref} transform={positionStyles}>
      <>
        {data.map((label, index) => {
          if (index === data.length - 1 && isLegendRendered) {
            wrapLegendsText();
            isLegendRendered(true);
          }
          if (index > data.length - 1) {
            return null;
          }
          const isHidden = hideIndex?.includes(index);
          const lb = {
            index: index,
            label: label.label,
            value: String(label.value),
            datum: label.label,
            text: label.label,
          };
          const isHoveredOther = hovered && !(hovered === lb.label);
          console.log(data)
          console.log("iiilabel",colorScale(label.label))
          console.log(label.label)
          return (
            <LegendItem
              key={`legend-${label.label}-${label.value}`}
              label={lb}
              index={index}
              data={data}
              isHidden={isHidden}
              isHoveredOther={!!isHoveredOther}
              isLoading={isLoading}
              doStrike={doStrike}
              variant={variant}
              onToggle={() => handleToggleItem(lb.index)}
              onMouseOver={() => handleMouseOver(lb.text)}
              onMouseLeave={handleMouseLeave}
              hideValues={hideValues}
              markerColor={label.color || colorScale(label.label)}
              onArrowClick={() => {
                if (onClick && data) {
                  onClick(data, lb.text, index);
                }
              }}
              eachLegendGap={eachLegendGap}
              generateAxis={generateAxis}
              hideLegendLableClick={hideLegendLableClick}
              showArrow={showArrow}
            />
          );
        })}
      </>
    </g>
  );
}

Legends.displayName = "Legends";
Legends.Position = LegendPosition;
Legends.Variant = LegendVariant;

export default Legends;
