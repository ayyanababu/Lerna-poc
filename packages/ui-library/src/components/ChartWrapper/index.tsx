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
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const [canRender, setCanRender] = React.useState(true);

    const isHorizontal = legendsProps?.position === LegendPosition.LEFT || legendsProps?.position === LegendPosition.RIGHT;

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
                gap: position === LegendPosition.BOTTOM ? "12px" : "20px",
                marginTop: title ? "12px" : "0px",
                width: "100%",
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
                <Box
                  sx={{
                    flex: isHorizontal ? "0 0 calc(50% - 10px)" : "1 1 auto",
                    width: isHorizontal ? "calc(50% - 10px)" : "100%",
                    minWidth: isHorizontal ? "calc(50% - 10px)" : "100%",
                    display: "flex",
                    flexDirection: 'column',
                    justifyContent: "center",
                    alignItems: "baseline",
                  }}
                >
                  <Legends
                    {...legendsProps}
                    position={position}
                    colorScale={colorScale}
                    data={legendData}
                  />
                </Box>
              )}
              <Box
                ref={ref}
                sx={{
                  position: "relative",
                  height: "100%",
                  width: !isLoading && isHorizontal ? "calc(50% - 10px)" : "100%",
                  minWidth: !isLoading && isHorizontal ? "calc(50% - 10px)" : "100%",
                  maxWidth: !isLoading && isHorizontal ? "calc(50% - 10px)" : "100%",
                  display: "flex",
                  flex: !isLoading && isHorizontal ? "0 0 calc(50% - 10px)" : "1 1 auto",
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
                ) : (legendData?.length > 0 && children) ? (
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
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        opacity="0.2"
                        d="M20.25 7.5C20.25 9.98531 16.5562 12 12 12C7.44375 12 3.75 9.98531 3.75 7.5C3.75 5.01469 7.44375 3 12 3C16.5562 3 20.25 5.01469 20.25 7.5Z"
                        fill={theme.colors.common.text}
                      />
                      <path
                        d="M12 2.25C6.95344 2.25 3 4.55625 3 7.5V16.5C3 19.4438 6.95344 21.75 12 21.75C17.0466 21.75 21 19.4438 21 16.5V7.5C21 4.55625 17.0466 2.25 12 2.25ZM19.5 12C19.5 12.9019 18.7612 13.8216 17.4741 14.5238C16.0247 15.3141 14.0803 15.75 12 15.75C9.91969 15.75 7.97531 15.3141 6.52594 14.5238C5.23875 13.8216 4.5 12.9019 4.5 12V10.44C6.09938 11.8463 8.83406 12.75 12 12.75C15.1659 12.75 17.9006 11.8425 19.5 10.44V12ZM6.52594 4.97625C7.97531 4.18594 9.91969 3.75 12 3.75C14.0803 3.75 16.0247 4.18594 17.4741 4.97625C18.7612 5.67844 19.5 6.59812 19.5 7.5C19.5 8.40188 18.7612 9.32156 17.4741 10.0237C16.0247 10.8141 14.0803 11.25 12 11.25C9.91969 11.25 7.97531 10.8141 6.52594 10.0237C5.23875 9.32156 4.5 8.40188 4.5 7.5C4.5 6.59812 5.23875 5.67844 6.52594 4.97625ZM17.4741 19.0238C16.0247 19.8141 14.0803 20.25 12 20.25C9.91969 20.25 7.97531 19.8141 6.52594 19.0238C5.23875 18.3216 4.5 17.4019 4.5 16.5V14.94C6.09938 16.3463 8.83406 17.25 12 17.25C15.1659 17.25 17.9006 16.3425 19.5 14.94V16.5C19.5 17.4019 18.7612 18.3216 17.4741 19.0238Z"
                        fill={theme.colors.common.text}
                      />
                    </svg>

                    <span
                      style={{
                        color: theme.colors.common.text,
                        fontFamily: 'Roboto',
                        fontStyle: 'normal', 
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '143%',
                        letterSpacing: '0.4px',
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
