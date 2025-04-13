// import { common } from '@arcesium/react-mui-commons/theme/colors';
import React, { forwardRef, useEffect, useRef } from "react";
import { Box, Stack } from "@mui/material";
import { scaleOrdinal } from "@visx/scale";

import { common } from "../../theme/theme";
import Legends from "../Legends";
import { LegendPosition } from "../Legends/types";
import Timestamp from "../Timestamp";
import Title from "../Title";
import { Tooltip } from "../Tooltip";
import { ChartWrapperProps } from "./types";

const defaultColorScale = scaleOrdinal<string, string>({
  domain: ["default"],
  range: [common.black],
});

export const ChartWrapper = forwardRef<HTMLDivElement, ChartWrapperProps>(
  (
    {
      children,
      title,
      titleProps,
      legendsProps,
      tooltipProps,
      timestampProps,
      minRenderHeight = 200,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [canRender, setCanRender] = React.useState(true);

    const {
      colorScale = defaultColorScale,
      data: legendData,
      position = LegendPosition.BOTTOM,
    } = legendsProps || {};
    const { data: toolTipData } = tooltipProps || {};

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
          parentRect?.width > minRenderHeight &&
          parentRect?.height > minRenderHeight;
        setCanRender(isParentElementAvailable && isParentSizeValid);
      };
      checkCanRender();
      window.addEventListener("resize", checkCanRender);
      return () => {
        window.removeEventListener("resize", checkCanRender);
      };
    }, []);

    const renderContent = React.useCallback(
      () => (
        <>
          {/* Only render title if it exists */}
          {title && <Title title={title} {...titleProps} />}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flex: "1 1 auto",
              minHeight: 0,
              // Gap between chart and legends based on position
              // commented by VNS
              gap: position === LegendPosition.BOTTOM ? "12px" : "20px",
              marginTop: title ? "12px" : "0px", // Add 12px gap only if title exists
              ...(position === LegendPosition.LEFT ||
                position === LegendPosition.RIGHT
                ? {
                  flexDirection:
                    position === LegendPosition.LEFT ? "row" : "row-reverse",
                }
                : {
                  flexDirection:
                    position === LegendPosition.TOP
                      ? "column"
                      : "column-reverse",
                }),
            }}
          >
            <Legends
              {...legendsProps}
              position={position}
              colorScale={colorScale}
              data={legendData}
            />
            <Box
              ref={ref}
              sx={{
                position: "relative",
                height: "100%",
                width: "100%",
                display: "flex",
                flex: "1 1 100%",
                minHeight: 0,
              }}
            >
              {children}
            </Box>
          </Box>
          {timestampProps?.timestamp && <Timestamp {...timestampProps} />}
        </>
      ),
      [
        title,
        titleProps,
        legendsProps,
        tooltipProps,
        timestampProps,
        position,
        colorScale,
        legendData,
        toolTipData,
        children,
        ref,
      ],
    );

    return (
      <Stack
        sx={{
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "0px", // Removed parent gap to control internal gaps more precisely
          flex: 1,
        }}
        ref={containerRef}
      >
        {canRender ? (
          renderContent()
        ) : (
          <p> Cannot Render the chart under this size</p>
        )}
        {toolTipData && (
          <Tooltip
            {...tooltipProps}
            data={toolTipData}
            containerRef={containerRef}
          />
        )}
      </Stack>
    );
  },
);

export default ChartWrapper;
