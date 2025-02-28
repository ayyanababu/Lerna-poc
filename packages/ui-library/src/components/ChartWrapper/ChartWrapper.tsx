import { Box } from '@mui/material';
import React, { forwardRef, useEffect, useRef } from 'react';
import { Legends } from '../Legends/Legends';
import { Timestamp } from '../Timestamp/Timestamp';
import { Title } from '../Title/Title';
import { Tooltip } from '../Tooltip/Tooltip';
import { ChartWrapperProps } from './types';


export const ChartWrapper = forwardRef<HTMLDivElement, ChartWrapperProps>(
  (
    { children, title, titleProps, legendsProps, tooltipProps, timestampProps },
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

            <Timestamp {...timestampProps} />
          </>
        ) : (
          <p> Cannot Render the chart under this size</p>
        )}
      </Box>
    );
  },
);
