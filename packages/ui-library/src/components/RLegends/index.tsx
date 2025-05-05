import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { SxProps, Theme } from '@mui/material';
import { LegendOrdinal } from '@visx/legend';
import { LegendPosition, LegendsProps, LegendVariant } from './types';
import LegendItem from './LegendItem';

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
  eachLegendGap,
  generatedLegendHeight,
  generateAxis,
  legendBoxWidth,
  hideLegendLableClick = true,
  showArrow = true,
}: LegendsProps) {
  const [showicon,setShowIcon] = useState(false);
  const legends_ref = useRef<SVGGElement | null>(null);

  const positionStyles = useMemo(() => {
    switch (position) {
      case 'left':
        return 'translate(0, 50%)';
      case 'right':
        return 'translate(100%, 50%)'; // or adjust based on container
      case 'bottom':
        return 'translate(0, 0)';
      case 'top':
      default:
        return 'translate(0, 0)';
    }
  }, [position]);
//  const flexDirection =
//    position === 'left' || position === 'right' ? 'column' : 'row';

  useEffect(()=>{
    console.log("hide index",hideIndex)
    if (generateAxis && hideIndex){
      generateAxis(hideIndex);
    }
  },[hideIndex])


  const handleToggleItem = useCallback(
    (index: number) => {
      console.log("indexa",index)
      if (setHideIndex && hideIndex) {
        console.log("hit index");
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
      setShowIcon(true)
      if (setHovered) {
        setHovered(labelText);
      }
    },
    [setHovered],
  );

  const handleMouseLeave = useCallback(() => {
    setShowIcon(false)
    if (setHovered) {
      setHovered(null);
    }
  }, [setHovered]);


  if (!data || !colorScale || !setHideIndex || !setHovered || !isVisible) {
    return null;
  }

  const wrapLegendsText = useCallback(() => {
    console.log("lref", legends_ref.current);

    if (legends_ref.current && legendBoxWidth) {
      const positions: { start: number; end: number; x1: number; y1: number; x2: number; y2: number; residue:number; status:string }[] = [];
      const gs = legends_ref.current.querySelectorAll("g");

      let start = 0;
      const nexted = 0;
      while (start < gs.length) {
        let reswidth: number = legendBoxWidth as number;
        console.log("leg",legendBoxWidth )
        let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
       // let end = start;
        if (start >= gs.length){
          break;
        }
        const gmain = gs[start].getBBox();
        let next = 0
        for (next = start+1; next < gs.length; next++) {
          const g = gs[next];
          const bbox = g.getBBox();
          const transform = g.getAttribute("transform");
          console.log(transform);
          const [tx, ty] = transform?.match(/translate\(([^,]+),\s*([^)]+)\)/)?.slice(1).map(Number) || [0, 0];
          x1 = tx;
          y1 = ty;
          console.log(start);
          console.log(next)
          console.log(y1);
          console.log(gmain.width)
          console.log(bbox.width)
          if (reswidth - (gmain.width + tx + 20 + bbox.width) >= 0) {
            console.log("gm",gmain.width)
            reswidth -= gmain.width + tx + 20 + bbox.width;
            x2 = tx + bbox.width;
            y2 = ty;
            positions.push({ start:start, end:next, x1, y1, x2, y2, residue : reswidth, status:"done" });
        //    end = next;
          } else {
            x2 = tx + bbox.width;
            y2 = ty;
            positions.push({ start:next-1, end:next-1, x1, y1, x2, y2, residue: reswidth - (gmain.width + tx + 20 + bbox.width), status:"nill" });
            break;
          }
        }
        start = next;
      }

      console.log("positions", positions);
    }
  }, [legends_ref.current, legendBoxWidth, eachLegendGap]);


  useEffect(()=>{
    if (eachLegendGap && data && generatedLegendHeight){
      generatedLegendHeight(data.length * eachLegendGap)
    }
  },[data,generatedLegendHeight])

  return (
    <g ref={legends_ref} transform={positionStyles}>
      <>
            {data.map((label, index) => {
              if (index > data.length - 1) {
                return null;
              }
              if (index === data.length - 1 && isLegendRendered) {
                wrapLegendsText();
                isLegendRendered(true);
              }
              const isHidden = hideIndex?.includes(index);
              const lb = {index:index,label:label.label,value:String(label.value),datum:label.label,text:label.label}
              const isHoveredOther = hovered && !(hovered === lb.label);
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
                  markerColor={colorScale(label.label)}
                  onArrowClick={() => {
                    if (onClick && data) {
                      onClick(data, lb.text, index);
                    }
                  }}
                  eachLegendGap={eachLegendGap}
                  generateAxis={generateAxis}
                  showIcon={showicon}
                  hideLegendLableClick={hideLegendLableClick}
                  showArrow={showArrow}
                />
              );
            })}
        </>
    </g>
  );
}

Legends.displayName = 'Legends';
Legends.Position = LegendPosition;
Legends.Variant = LegendVariant;

export default Legends;
