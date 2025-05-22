import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { DataPoint } from "../common/Data.types";
import { LegendDataItem } from "../common/LegendManager.types";
import LegendItem from "./LegendItem";
import { LegendPosition, LegendsProps, LegendVariant } from "./types";
let stoprecurring = 0
function Legends({
  colorScale,
  data,
  hideIndex,
  setHideIndex,
  hovered,
  setHovered,
  position = LegendPosition.TOP,
  onArrowClick,
  isLoading = false,
  doStrike = false,
  isVisible = true,
  variant = LegendVariant.COMPACT,
  hideValues = false,
  isLegendRendered,
  eachLegendGap,
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
  }, [data, eachLegendGap, isLegendRendered]);

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
            let legendRowOffset: number;
            if (
              chart && chart.toUpperCase() === "BAR AND LINE" ||
              legendBoxWidth > 300
            ) {
              legendRowOffset = row - 1;
            } else {
              legendRowOffset = row - 2;
            }
            positions[row].push({
              object: gs[start],
              row,
              x: newwidth,
              y: legendRowOffset * eachLegendGap,              
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
        if (generatedLegendHeight) {
           generatedLegendHeight(legends_ref.current.getBBox().height + 10);
        }
      }
      Object.keys(positions).forEach((positionkey: string) => {
        positions[positionkey].forEach((rowitem) => {
          rowitem.object.setAttribute(
            "transform",
            `translate(${rowitem.x},${rowitem.y})`,
          );
        });
      });
    }
     isLegendRendered && isLegendRendered(true);
  };

  useEffect(()=>{
    if (legends_ref && legends_ref.current && stoprecurring < 35){
      if (legends_ref?.current?.querySelectorAll("#legends").length === data.length){
        wrapLegendsText();
        stoprecurring++; 
      } 
    }
  },[legends_ref,data,legends_ref?.current?.querySelectorAll("#legends").length,isLegendRendered]);

  return (
    <g ref={legends_ref} transform={positionStyles}>
      <>
        {data.map((label: LegendDataItem, index: number) => {
   //       if (index === data.length - 1 && isLegendRendered) {
   //         wrapLegendsText();
   //         isLegendRendered(true);
   //       }
          if (index > data.length - 1) {
            return null;
          }
          const dataClicked: DataPoint = {
            label: label.label,
            value: label.value,
          };
          const isHidden = hideIndex?.includes(index);
          const lb = {
            index: index,
            label: label.label,
            value: String(label.value),
            datum: label.label,
            text: label.label,
          };
          const isHoveredOther = hovered && !(hovered === lb.label);
          return (
            <LegendItem
              id={"legends"}
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
              onMouseOver={() => handleMouseOver(lb && lb.text ? lb.text : "")}
              onMouseLeave={handleMouseLeave}
              hideValues={hideValues}
              markerColor={
                label.color ||
                colorScale(label && label.label ? label.label : "")
              }
              onArrowClick={(
                event: React.MouseEvent<SVGSVGElement, MouseEvent>,
              ) => {
                if (onArrowClick && data) {
                  onArrowClick(event, dataClicked, lb.text, index);
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
