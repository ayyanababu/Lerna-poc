import { Box } from '@mui/material';
import React, { forwardRef, ReactNode, useEffect, useRef } from 'react';
import { Legends, LegendsProps } from '../Legends/Legends';
import { TimeStamp } from '../TimeStamp/TimeStamp';
import { Title, TitleProps } from '../Title/Title';
import { Tooltip, TooltipProps } from '../Tooltip/Tooltip';

export interface TooltipData {
  label: string;
  value: number;
}

interface ChartWrapperProps {
  children: ReactNode;
  title?: string;
  timestamp?: string;
  titleProps?: TitleProps;
  legendsProps?: LegendsProps;
  tooltipProps?: TooltipProps;
}

export const ChartWrapper = forwardRef<HTMLDivElement, ChartWrapperProps>(
  (
    { children, title, timestamp, titleProps, legendsProps, tooltipProps },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [canRender, setCanRender] = React.useState(true);

    useEffect(() => {
      const checkCanRender = () => {
        const parentElement = containerRef?.current?.parentElement;
        if (!parentElement) {
          setCanRender(false);
          return;
        }
        const isParentElementAvailable = !!parentElement;
        const parentRect = parentElement?.getBoundingClientRect();
        const isParentSizeValid =
          parentRect?.width > 200 && parentRect?.height > 200;

        setCanRender(isParentElementAvailable && isParentSizeValid);
      };

      checkCanRender();

      window.addEventListener('resize', checkCanRender);

      return () => {
        window.removeEventListener('resize', checkCanRender);
      };
    }, []);

    return (
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
        ref={containerRef}>
        {canRender ? (
          <>
            <Title title={title} {...titleProps} />

            <Legends {...legendsProps} />

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

            <Tooltip {...tooltipProps} />

            <TimeStamp date={timestamp} />
          </>
        ) : (
          <p> Cannot Render the chart under this size</p>
        )}
      </Box>
    );
  },
);
