import { ReactNode } from "react";
import { Box } from "@mui/material";

export interface SortableProps {
  children: ReactNode;
  className?: string;
  styles?: Record<number, React.CSSProperties>;
  sx?: Parameters<typeof Box>[0]["sx"];
}
