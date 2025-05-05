import { Box } from "@mui/material";
import useTheme from "../../hooks/useTheme";
import React from "react";

export default function ErrorFallback({
  message,
  description,
  ...props
}: {
  message?: string;
  description?: string;
} & React.ComponentProps<typeof Box>) {
  const { theme } = useTheme();
  return (
    <Box
      {...props}
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
        color: theme.colors.common.text,
        ...props.sx,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="#f5b686"
        viewBox="0 0 256 256"
      >
        <path d="M160,40A88.09,88.09,0,0,0,81.29,88.67,64,64,0,1,0,72,216h88a88,88,0,0,0,0-176Zm0,160H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.11A88,88,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,72,72Zm29.66-82.34L171.31,136l18.35,18.34a8,8,0,0,1-11.32,11.32L160,147.31l-18.34,18.35a8,8,0,0,1-11.32-11.32L148.69,136l-18.35-18.34a8,8,0,0,1,11.32-11.32L160,124.69l18.34-18.35a8,8,0,0,1,11.32,11.32Z"></path>
      </svg>

      <span
        style={{
          color: theme.colors.common.text,
          fontFamily: "Roboto",
          fontStyle: "normal",
          fontWeight: 400,
          fontSize: "12px",
          letterSpacing: "0.4px",
        }}
      >
        {message || "We're having trouble getting the latest data"}
      </span>

      <span
        style={{
          fontFamily: 'Roboto',
          fontStyle: 'normal',
          fontWeight: 400,
          fontSize: '10px',
          letterSpacing: '0.4px',
          color: theme.colors.axis.line
        }}
      >
        {description || "Check your connection or try refreshing"}
      </span>
    </Box>
  );
}
