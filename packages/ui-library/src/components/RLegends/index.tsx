import React, { useCallback, useMemo } from 'react';
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
}: LegendsProps) {
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
      console.log(labelText)
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
  console.log("labele",data);
  return (
    <g transform={positionStyles}>
      <>
            {data.map((label, index) => {
              if (index > data.length - 1) {
                return null;
              }
              if (index === data.length - 1 && isLegendRendered) {
                isLegendRendered(true);
              }           
              const isHidden = hideIndex?.includes(index);
              const isHoveredOther = hovered && !hovered.includes(label.label);
              let lb = {index:index,label:label.label,value:String(label.value),datum:label.label,text:label.label}
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
                  onToggle={() => handleToggleItem(index)}
                  onMouseOver={() => handleMouseOver(lb.text)}
                  onMouseLeave={handleMouseLeave}
                  hideValues={hideValues}
                  markerColor={colorScale(label.label)}
                  onArrowClick={() => {
                    if (onClick && data) {
                      onClick(data, lb.text, index);
                    }
                  }}
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
