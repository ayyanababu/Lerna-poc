import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import Sortable from "sortablejs";

import { SortableProps } from "./types";

export default function SortableComponent({
  children,
  className,
}: SortableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ id: number }[]>([]);
  const childrenArray = useMemo(
    () => React.Children.toArray(children),
    [children],
  );

  useEffect(() => {
    setState(childrenArray.map((_, index) => ({ id: index })));
  }, [childrenArray]);

  useEffect(() => {
    if (!containerRef.current) return () => { };

    const sortable = Sortable.create(containerRef.current, {
      handle: ".drag-handle",
      animation: 200,
      easing: "cubic-bezier(1, 0, 0, 1)",
      delay: 2,
      onStart: (evt) => {
        const draggedItem = evt.item;
        const draggedItemId = draggedItem.getAttribute("data-id");

        if (containerRef.current) {
          Array.from(containerRef.current.children).forEach((child) => {
            if (child.getAttribute("data-id") !== draggedItemId) {
              child.classList.add("jiggle-animation");
            }
          });
        }
      },
      onEnd: () => {
        if (containerRef.current) {
          Array.from(containerRef.current.children).forEach((child) => {
            child.classList.remove("jiggle-animation");
          });
        }
      },
      onUpdate: () => {
        const nodes = Array.from(containerRef.current?.children || []);
        const newIds = nodes.map((node) =>
          parseInt(node.getAttribute("data-id") || "0", 10),
        );
        setState(newIds.map((id) => ({ id })));
      },
    });

    return () => {
      sortable.destroy();
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        gap: "16px",
        display: "grid",
        gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
        "& .sortable-ghost": {
          backgroundColor: "#8fc5ff",
          borderRadius: "8px",
          "& *": {
            opacity: 0,
          },
        },
        "@keyframes jiggle": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "25%": {
            transform: "rotate(-1deg)",
          },
          "75%": {
            transform: "rotate(1deg)",
          },
          "100%": {
            transform: "rotate(0deg)",
          },
        },
        "& .jiggle-animation": {
          animation: "jiggle 0.3s infinite ease-in-out",
        },
      }}
    >
      {state.map((item) => (
        <div key={item.id} data-id={item.id} className="drag-handle">
          {childrenArray[item.id]}
        </div>
      ))}
    </Box>
  );
}
