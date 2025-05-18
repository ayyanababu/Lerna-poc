import React, { useEffect, useMemo, useRef } from "react";
import { Box } from "@mui/material";
import Sortable from "sortablejs";

import { SortableProps } from "./types";

export default function SortableComponent({
  children,
  className,
  styles,
  sx,
  onEnd,
  onStart,
}: SortableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const childrenArray = useMemo(
    () => React.Children.toArray(children),
    [children],
  );

  useEffect(() => {
    if (!containerRef.current) return () => {};

    const sortable = Sortable.create(containerRef.current, {
      group: "shared",
      handle: ".drag-handle",
      animation: 200,
      easing: "cubic-bezier(1, 0, 0, 1)",
      delay: 0,
      onStart: (evt) => {
        const draggedItem = evt.item;
        const draggedItemId = draggedItem.getAttribute("data-id");

        document.querySelectorAll(".drag-handle").forEach((child) => {
          if (child.getAttribute("data-id") !== draggedItemId) {
            child.classList.add("jiggle-animation");
          }
        });

        if (onStart) {
          onStart(evt);
        }
      },
      onEnd: (evt) => {
        document.querySelectorAll(".drag-handle").forEach((child) => {
          child.classList.remove("jiggle-animation");
        });

        if (onEnd) {
          onEnd(evt);
        }
      },
      scrollSensitivity: 100,
      scrollSpeed: 10,
      scroll: true,
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
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        transition: "all 0.3s ease-in-out",
        "& .sortable-ghost": {
          backgroundColor: "#8fc5ff",
          borderRadius: "8px",
          "& *": {
            opacity: 0,
          },
        },
        "@keyframes jiggle": {
          "0%": {
            transform: "rotate(0deg) scale(0.95)",
          },
          "25%": {
            transform: "rotate(-1deg) scale(0.95)",
          },
          "75%": {
            transform: "rotate(1deg) scale(0.95)",
          },
          "100%": {
            transform: "rotate(0deg) scale(0.95)",
          },
        },
        "& .jiggle-animation": {
          animation: "jiggle 0.3s infinite ease-in-out",
        },
        ...(sx || {}),
      }}
    >
      {childrenArray.map((_, index) => (
        <div
          key={index}
          data-id={index}
          className="drag-handle"
          style={{
            ...styles?.[index],
          }}
        >
          {childrenArray[index]}
        </div>
      ))}
    </Box>
  );
}
