import React from 'react';
import { Box, Typography } from '@mui/material';
import { capitalize, lowerCase } from 'lodash-es';
import { formatNumberWithCommas } from '../../utils/number';
import { LegendItemProps, LegendVariant } from './types';
import useTheme from "../../hooks/useTheme";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";


function LegendItem({
  label,
  index = 0,
  data,
  isHidden = false,
  isHoveredOther = false,
  isLoading = false,
  doStrike = false,
  variant = LegendVariant.COMPACT,
  onToggle,
  onMouseOver,
  onMouseLeave,
  hideValues = false, 
  markerColor,
  onArrowClick
}: LegendItemProps) {
 // const markerColor =
 //   (data && index !== undefined && data[index]?.color) ||
 //   label?.value ||
 //   '#fff';
console.log("lbl",label)
  const theme = useTheme();
  let displayText = '';
  if (isLoading) {
    displayText = 'loading';
  } else if (label?.datum) {
    displayText = capitalize(lowerCase(label.datum));
  }

  const valueText =
    data && label?.index !== undefined ? data[label.index]?.value : undefined;

  const renderMarker = () => (
    <circle
      cx={6}
      cy={6}
      r={6}
      fill={markerColor}
      onClick={() => onToggle?.()}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      style={{
        cursor: 'pointer',
        opacity: isHoveredOther ? 0.5 : 1,
        filter: !doStrike && isHidden ? 'grayscale(100%) opacity(0.5)' : 'none',
      }}
    />
  );
  const renderText = () => (
    <text
      x={20}
      y={6}
      dy=".35em"
      fill={theme.theme.colors.legend.text}
      className='MuiTypography-root MuiTypography-caption css-19buuys-MuiTypography-root'
      style={{
        textDecoration: doStrike && isHidden ? 'line-through' : 'none',
      }}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      {displayText}
      {!hideValues &&
        (isLoading
          ? 'loadingloading'
          : ` (${valueText?formatNumberWithCommas(valueText):''})`)}
    </text>
  );

  return (
    <g
      transform={`translate(0, ${index * 20})`}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      style={{
        pointerEvents: "fill",
        cursor: 'pointer',
        opacity: isHoveredOther ? 0.5 : 1,
        filter: !doStrike && isHidden ? 'grayscale(100%) opacity(0.5)' : 'none',
      }}
    >
      {renderMarker()}
      <foreignObject x = "200" width="16" height="16">
         {
          React.createElement('div', {
            xmlns: 'http://www.w3.org/1999/xhtml',
            style: { width: '100%', height: '100%' }
            }, <ArrowOutwardIcon
             sx={{
             height: "16px",
             width: "16px",
             color: theme.theme.colors.legend.text,
             opacity: 0,
             transition: "opacity 0.250s ease-in-out",
           }}
           className="arrow-icon"
           onClick={() => onArrowClick?.()}/> 
        )}        
      </foreignObject>          
      {renderText()}
    </g>
  );
}

export { LegendItem };
export default LegendItem;
