import { Box, Typography } from '@mui/material';
import { scaleOrdinal } from '@visx/scale';
import { Tooltip } from '@visx/tooltip';
import React, { forwardRef, ReactNode } from 'react';
import { Legends } from '../Legends/Legends';
import { TimeStamp } from '../TimeStamp/TimeStamp';
import { Title } from '../Title/Title';

export interface TooltipData {
  label: string;
  value: number;
  color: string;
}

interface ChartWrapperProps {
  children: ReactNode;
  title?: string;
  timestamp?: string;
  legendData?: { label: string; value: number; color: string }[];
  colorScale?: ReturnType<typeof scaleOrdinal<string, string>>;
  hideIndex?: number[];
  setHideIndex?: React.Dispatch<React.SetStateAction<number[]>>;
  setHovered?: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  tooltipOpen?: boolean;
  tooltipTop?: number | null;
  tooltipLeft?: number | null;
  tooltipData?: TooltipData;
  titleProps?: Parameters<typeof Title>[0];
}

export const ChartWrapper = forwardRef<HTMLDivElement, ChartWrapperProps>(
  (
    {
      children,
      title,
      timestamp,
      legendData,
      colorScale,
      hideIndex,
      setHideIndex,
      setHovered,
      tooltipOpen,
      tooltipTop,
      tooltipLeft,
      tooltipData,
      titleProps,
    },
    ref,
  ) => {
    return (
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
        <Title title={title} {...titleProps} />

        {/* Legend */}
        {legendData && colorScale && setHideIndex && setHovered && (
          <Legends
            colorScale={colorScale}
            data={legendData}
            hideIndex={hideIndex || []}
            setHideIndex={setHideIndex}
            setHovered={setHovered}
          />
        )}

        <Box
          ref={ref}
          sx={{
            position: 'relative',
            height: '100%',
            width: '100%',
            display: 'flex',
            flex: '1 1 100%',
          }}>
          {children}
        </Box>

        {tooltipOpen &&
          tooltipData &&
          tooltipTop !== null &&
          tooltipLeft !== null && (
            <Tooltip
              top={tooltipTop}
              left={tooltipLeft}
              style={{
                position: 'fixed',
                backgroundColor: 'white',
                color: '#333',
                padding: '10px',
                borderRadius: '6px',
                boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                border: '1px solid #ddd',
                fontSize: '12px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                transform: 'translate(-50%, -100%)',
                whiteSpace: 'nowrap',
                transition: 'all 0.250s ease-in-out',
              }}>
              <Typography sx={{ marginBottom: '5px', textAlign: 'center' }}>
                {tooltipData.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                {tooltipData.value}
              </Typography>
            </Tooltip>
          )}

        <TimeStamp date={timestamp} />
      </Box>
    );
  },
);
