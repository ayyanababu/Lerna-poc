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
import DotLoader from "../DotLoader/DotLoader";
import useTheme from "../../hooks/useTheme";

const defaultColorScale = scaleOrdinal<string, string>({
  domain: ["default"],
  range: [common.black],
});

export const ChartWrapper = forwardRef<HTMLDivElement, ChartWrapperProps>(
  (
    {
      children,
      isLoading,
      title,
      titleProps,
      legendsProps,
      tooltipProps,
      timestampProps,
      minRenderHeight = 200,
    },
    ref,
  ) => {
    const { theme } = useTheme()
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
          <>
            {/* Only render title if it exists */}
            {!isLoading && title && <Title title={title} {...titleProps} />}
            
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
                        position === LegendPosition.LEFT
                          ? "row"
                          : "row-reverse",
                    }
                  : {
                      flexDirection:
                        position === LegendPosition.TOP
                          ? "column"
                          : "column-reverse",
                    }),
              }}
            >
              {!isLoading && (
                <Legends
                  {...legendsProps}
                  position={position}
                  colorScale={colorScale}
                  data={legendData}
                />
              )}
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
                {isLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      width: "100%",
                      // backgroundColor: `${theme.colors.common.text}08`,
                      // borderRadius: "8px",
                    }}
                  >
                    <DotLoader />
                  </Box>
                ) : legendData.length > 0 ? (
                  children
                ) : (
                  <div>No data to display.</div>
                )}
              </Box>
            </Box>
            {timestampProps?.timestamp && <Timestamp {...timestampProps} />}
          </>
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
