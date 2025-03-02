import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LegendOrdinal } from '@visx/legend';
import { capitalize, lowerCase } from 'lodash-es';
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { shimmerClassName } from '../Shimmer/Shimmer';
import { LegendsProps } from './types.d';

export function Legends({
  colorScale,
  data,
  hideIndex,
  setHideIndex,
  hovered,
  setHovered,
  direction = 'row',
  position = 'top',
  onClick = () => {},
  isLoading = false,
  doStrike = false,
}: LegendsProps) {
  const { theme } = useTheme();

  if (!data || !colorScale || !setHideIndex || !setHovered) return null;

  const getFlexDirection = () => {
    if (position === 'left' || position === 'right') return 'column';
    return 'row';
  };

  const getPosition = () => {
    switch (position) {
      case 'left':
        return {
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          maxWidth: '150px',
        };
      case 'right':
        return {
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          maxWidth: '150px',
        };
      case 'bottom':
        return {};
      default: // top
        return {};
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: getFlexDirection(),
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: theme.colors.legend.background,
        borderRadius: '4px',
        ...getPosition(),
      }}>
      <LegendOrdinal
        scale={colorScale}
        direction={getFlexDirection()}
        labelMargin="0 0 0 0">
        {(labels) => (
          <>
            {labels.map((label, index) => {
              if (index > data.length - 1) {
                return null;
              }

              return (
                <Box
                  key={index}
                  onClick={() => {
                    setHideIndex((prev) =>
                      prev.includes(index)
                        ? prev.filter((idx) => idx !== index)
                        : [...prev, index],
                    );

                    if (onClick) {
                      onClick(data, label.text, index);
                    }
                  }}
                  tabIndex={1}
                  onMouseOver={() => {
                    setHovered(label.text);
                  }}
                  onMouseLeave={() => {
                    setHovered(null);
                  }}
                  sx={{
                    gap: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    opacity:
                      hovered && !hovered?.includes(label.text) ? 0.5 : 1,
                    transition: 'all 0.3s ease',
                  }}>
                  <Box
                    sx={{
                      backgroundColor:
                        data?.[index]?.color || label.value || '#fff',
                      marginTop: '4px',
                      marginBottom: 'auto',
                      borderRadius: '20px',
                      width: '12px',
                      height: '12px',
                    }}
                    className={`${isLoading ? shimmerClassName : ''}`}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      alignItems: 'flex-start',
                    }}>
                    <Typography
                      variant="body2"
                      sx={{
                        margin: 0,
                        fontWeight: theme.typography.fontWeight.regular,
                        textDecoration:
                          doStrike && hideIndex.includes(index)
                            ? 'line-through'
                            : 'none',
                        color: theme.colors.legend.text,
                      }}
                      className={`${isLoading ? shimmerClassName : ''}`}>
                      {isLoading
                        ? `${'loading'.repeat(1)}`
                        : capitalize(lowerCase(label.datum))}
                    </Typography>
                    {data?.[label.index]?.value && (
                      <Typography
                        variant="h6"
                        sx={{
                          margin: 0,
                          fontWeight: theme.typography.fontWeight.bold,
                          color: theme.colors.legend.text,
                          fontSize: theme.typography.fontSize.medium,
                        }}
                        className={`${isLoading ? shimmerClassName : ''}`}>
                        {isLoading
                          ? `${'loading'.repeat(2)}`
                          : data?.[label?.index]?.value}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </>
        )}
      </LegendOrdinal>
    </Box>
  );
}
