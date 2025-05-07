import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
//import { SxProps, Theme } from '@mui/material';
//import { LegendOrdinal } from '@visx/legend';
import { LegendPosition, LegendsProps, LegendVariant } from './types';
import LegendItem from './LegendItem';
import { gt } from 'lodash-es';

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
  const [showIcon,setShowIcon] = useState(false);
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
    if (generateAxis && hideIndex){
      generateAxis(hideIndex);
    }
  },[hideIndex])


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
    if (legends_ref.current && legendBoxWidth && legendBoxWidth > 0) {
      const gs = legends_ref.current.querySelectorAll(".legendItems");
      const donestatus: { [key: number]: { element: SVGGElement, status: boolean } } = {};
      gs.forEach((gt,index)=>{
        donestatus[index] = {
          element: gt as SVGGElement,
          status: false
        };
      });
      const positions = {};
      let start = 0;
      let row = 0;
      let addwidth = 0;
      let newwidth = 0;
      console.log("lwidth",legendBoxWidth)
      while (start < gs.length) {
         if (legendBoxWidth > 600){
           addwidth += (gs[start] as SVGGElement).getBBox().width - 20;
         }else{
           addwidth += (gs[start] as SVGGElement).getBBox().width;
         }   
         console.log("w",(gs[start] as SVGGElement).getBBox().width)
         console.log("addwidth",addwidth)
         if (addwidth > legendBoxWidth){                
             row++;
             addwidth = 0;
             newwidth = 0;     
             if (!positions[row]){
               positions[row] = [];
             }             
             if (eachLegendGap){             
               positions[row].push({object:gs[start],row:row,x:newwidth,y:row * eachLegendGap,cwidth:newwidth+(gs[start] as SVGGElement).getBoundingClientRect().width,width:(gs[start] as SVGGElement).getBoundingClientRect().width})
               newwidth += (gs[start] as SVGGElement).getBBox().width;
               addwidth += (gs[start] as SVGGElement).getBBox().width;
             }      
             console.log("row",row);
             console.log("cwidth",addwidth);                               
         }else{
           if (!positions[row]){
             positions[row] = [];
           }
           if (eachLegendGap){
             positions[row].push({object:gs[start],row:row,x:newwidth,y:row * eachLegendGap,cwidth:newwidth+(gs[start] as SVGGElement).getBoundingClientRect().width,width:(gs[start] as SVGGElement).getBoundingClientRect().width})
             newwidth += (gs[start] as SVGGElement).getBBox().width;
           }  
         }
         start++;
      }
      console.log("positions",positions);
      Object.keys(positions).forEach((positionkey:string)=>{
        positions[positionkey].forEach((rowitem)=>{
           rowitem.object.setAttribute('transform',`translate(${rowitem.x},${rowitem.y})`)
        });
      });
      if (generatedLegendHeight){
        generatedLegendHeight(legends_ref.current.getBBox().height) 
      }  
    }  
  }, [legends_ref.current, legendBoxWidth, eachLegendGap]);


  useEffect(()=>{
    if (eachLegendGap && data && generatedLegendHeight){
      generatedLegendHeight(((data.length-1) * eachLegendGap)-10) 
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
                  showIcon={showIcon}
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
