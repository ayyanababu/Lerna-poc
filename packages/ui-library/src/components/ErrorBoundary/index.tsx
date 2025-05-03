import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box } from "@mui/material";

import useTheme from "../../hooks/useTheme";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

function ErrorFallback() {
  const { theme } = useTheme();
  return (
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
          d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z"
          stroke={theme.colors.common.text}
          strokeWidth="2"
        />
        <path
          d="M12 8V12"
          stroke={theme.colors.common.text}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle
          cx="12"
          cy="15"
          r="1"
          fill={theme.colors.common.text}
        />
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
        Something went wrong
      </span>
    </Box>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by error boundary:", {
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;