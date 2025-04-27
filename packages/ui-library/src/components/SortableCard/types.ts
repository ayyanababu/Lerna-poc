import { ReactNode } from "react";
import type { CardProps } from "@mui/material/Card";
import type { CardContentProps } from "@mui/material/CardContent";

export interface SortableCardProps extends CardProps {
  children: ReactNode;
  title?: string;
  height: number | string;
  width: number | string;
  childrenProps?: CardContentProps;
}
