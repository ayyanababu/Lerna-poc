import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LegendOrdinal } from '@visx/legend';
import { scaleOrdinal } from '@visx/scale';
import React, { SetStateAction } from 'react';

export function Legends({
  colorScale,
  data,
  hideIndex,
  setHideIndex,
  setHovered,
}: {
  colorScale: ReturnType<typeof scaleOrdinal<string, string>>;
  data: { label: string; value: number; color: string }[];
  hideIndex: number[];
  setHideIndex: React.Dispatch<SetStateAction<number[]>>;
  setHovered: React.Dispatch<SetStateAction<string | null | undefined>>;
}) {
  return (
    <Box
      className="legends"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <LegendOrdinal scale={colorScale} direction="row" labelMargin="0 0 0 0">
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
                  }}
                  tabIndex={1}
                  onMouseOver={() => {
                    setHovered(label.text);
                  }}
                  onMouseLeave={() => {
                    setHovered(null);
                  }}
                  className="legend-item"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: 'auto',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: (colorScale(label) as string) || '#fff',
                      marginRight: '7px', // Keep pixel value for fine control if needed
                      marginTop: '2px', // Keep pixel value for fine control if needed
                      marginBottom: 'auto',
                      borderRadius: '20px',
                      width: '12px', // Keep pixel value for fine control if needed
                      height: '12px', // Keep pixel value for fine control if needed
                    }}
                    className="legend-dot"
                  />
                  <Box className="legend-label-container" sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, alignItems: 'flex-start' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        margin: 0,
                        fontWeight: 'normal',
                        textDecoration: hideIndex.includes(index)
                          ? 'line-through'
                          : 'none',
                        fontSize: '0.75rem', // Roughly half of h5 default
                      }}
                    >
                      {label.datum}
                    </Typography>
                    {data?.[label.index]?.value && (
                      <Typography
                        variant="body2"
                        sx={{ margin: 0, fontWeight: 'normal', fontSize: '1.5rem' }} // Roughly half of h3 default
                      >
                        {data?.[label?.index]?.value}
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