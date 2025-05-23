import { ReactNode } from "react";

export interface SortableProps {
  children: ReactNode;
  className?: string;
  styles?: Record<number, React.CSSProperties>;
}
