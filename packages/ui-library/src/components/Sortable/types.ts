import { ReactNode } from "react";
import { Box } from "@mui/material";
import Sortable from "sortablejs";

export interface SortableProps {
  children: ReactNode;
  className?: string;
  styles?: Record<number, React.CSSProperties>;
  sx?: Parameters<typeof Box>[0]["sx"];
  onEnd?: (evt: Sortable.SortableEvent) => void;
  onStart?: (evt: Sortable.SortableEvent) => void;
}
