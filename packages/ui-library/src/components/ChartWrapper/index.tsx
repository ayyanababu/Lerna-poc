import React, { forwardRef, useEffect, useRef } from "react";
import { Box, Box, Stack } from "@mui/material";
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
      isDataEmpty,
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const [canRender, setCanRender] = React.useState(true);

    const isHorizontal =
      legendsProps?.position === LegendPosition.LEFT ||
      legendsProps?.position === LegendPosition.RIGHT;

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
                ...(isHorizontal
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
                  width: isHorizontal ? "50%" : "100%",
                  display: "flex",
                  flex: isHorizontal ? "1 1 50%" : "1 1 100%",
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
                ) : !isDataEmpty ? (
                  children
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      textAlign: "center",
                      gap: "12px",
                      alignItems: "center",
                      height: "100%",
                      width: "100%",
                      backgroundColor: `${theme.colors.common.text}08`,
                      borderRadius: "8px",
                      margin: "auto",
                      padding: "16px",
                      boxSizing: "border-box",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      fill={theme.colors.common.text}
                      viewBox="0 0 256 256"
                    >
                      <path
                        d="M216,80c0,26.51-39.4,48-88,48S40,106.51,40,80s39.4-48,88-48S216,53.49,216,80Z"
                        opacity="0.2"
                      ></path>
                      <path d="M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64ZM69.61,53.08C85.07,44.65,105.81,40,128,40s42.93,4.65,58.39,13.08C200.12,60.57,208,70.38,208,80s-7.88,19.43-21.61,26.92C170.93,115.35,150.19,120,128,120s-42.93-4.65-58.39-13.08C55.88,99.43,48,89.62,48,80S55.88,60.57,69.61,53.08ZM186.39,202.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z"></path>
                    </svg>

                    <span
                      style={{
                        color: theme.colors.common.text,
                        fontFamily: "Roboto",
                        fontStyle: "normal",
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "143%",
                        letterSpacing: "0.4px",
                      }}
                    >
                      There are no {title} data available
                    </span>
                  </Box>
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
