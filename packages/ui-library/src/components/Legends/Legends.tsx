import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LegendOrdinal } from '@visx/legend';
import { scaleOrdinal } from '@visx/scale';
import { capitalize, lowerCase } from 'lodash-es';
import React, { SetStateAction } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { shimmerClassName } from '../Shimmer/Shimmer';

export type LegendData = { label: string; value: number }[];

export interface LegendsProps {
  colorScale: ReturnType<typeof scaleOrdinal<string, string>>;
  data: LegendData;
  hideIndex: number[];
  setHideIndex: React.Dispatch<SetStateAction<number[]>>;
  hovered: string | null | undefined;
  setHovered: React.Dispatch<SetStateAction<string | null | undefined>>;
  direction?: 'row' | 'column';
  onClick?: (data: LegendData, legend: string, index: number) => void;
  isLoading?: boolean;
}

export function Legends({
  colorScale,
  data,
  hideIndex,
  setHideIndex,
  hovered,
  setHovered,
  direction = 'row',
  onClick = (data, legend, index) => {
    console.log(data, legend, index);
  },
  isLoading = false,
}: LegendsProps) {
  const { theme } = useTheme();

  if (!data || !colorScale || !setHideIndex || !setHovered) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        width: '100%',
        flexWrap: 'wrap',
        gap: 1,
      }}>
      <LegendOrdinal
        scale={colorScale}
        direction={direction}
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
                    marginRight: 'auto',
                    cursor: 'pointer',
                    userSelect: 'none',
                    opacity:
                      hovered && !hovered?.includes(label.text) ? 0.5 : 1,
                    transition: 'all 0.3s ease',
                  }}>
                  <Box
                    sx={{
                      // @ts-ignore
                      backgroundColor: label.value || '#fff',
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
                      gap: '4px',
                      alignItems: 'flex-start',
                    }}>
                    <Typography
                      variant="body2"
                      sx={{
                        margin: 0,
                        fontWeight: 400,
                        textDecoration: hideIndex.includes(index)
                          ? 'line-through'
                          : 'none',
                        color: theme.colors.common.text,
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
                          fontWeight: 700,
                          color: theme.colors.common.text,
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