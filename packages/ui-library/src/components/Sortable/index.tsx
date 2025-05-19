import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import Sortable from "sortablejs";

import { SortableProps } from "./types";

export default function SortableComponent({
  children,
  className,
  styles,
  paginatedData
}: SortableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1); // Track current page


  const [updatedPaginatedData, setUpdatedPaginatedData] = useState({});

  useEffect(() => {
    setUpdatedPaginatedData(paginatedData)
  }, [paginatedData])

console.log(updatedPaginatedData, 'updatedPaginatedData')

  const [droppedData, setDroppedData] = useState(undefined)
  useEffect(() => {
    if (droppedData) {
      // sortableRef?.destroy?.()
      console.log(containerRef.current)
       const temp = {...updatedPaginatedData}
      if (Number(currentPage) != droppedData.clone.dataset.currentpage) {
        const itemIndexAtPage = temp[`page${Number(droppedData.clone.dataset.currentpage)}`].findIndex((item) => item.id === Number(droppedData.clone.dataset.id))
        temp[`page${Number(currentPage)}`].splice(droppedData.newIndex, 0, temp[`page${Number(droppedData.clone.dataset.currentpage)}`][itemIndexAtPage]);

        delete temp[`page${Number(droppedData.clone.dataset.currentpage)}`][itemIndexAtPage];
        temp[`page${Number(droppedData.clone.dataset.currentpage)}`] = temp[`page${Number(droppedData.clone.dataset.currentpage)}`]?.filter(Boolean)
        const element = document.querySelector(`[data-id="${droppedData.clone.dataset.id}"]`);
        if (element) {
          element.remove();
        }
      } else {
        // draggedItem index
        const draggedIndex = temp[`page${currentPage}`][Number(droppedData.oldIndex)];
        console.log(draggedIndex, 'draggedIndex')
        temp[`page${currentPage}`].splice(droppedData.oldIndex, 1);

        let insertIndex = droppedData.newIndex;
        if (droppedData.oldIndex < droppedData.newIndex) {
          insertIndex -= 1; // Because we removed earlier element
        }
        temp[`page${currentPage}`].splice(insertIndex, 0, draggedIndex)
      }

      setUpdatedPaginatedData(temp)
      console.log( droppedData, 'lastDraggedIndex')
    }
  }, [droppedData])

  // Pagination Functions
  const goToNextPage = () => {
    console.log(currentPage, 'currentPage')
    if (Object.entries(paginatedData).length >= currentPage + 1) {
      setCurrentPage(prev => currentPage + 1);
      setDirection('right');
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => currentPage - 1);
    }
  };

  // Sortable initialization
  useEffect(() => {
    if (!containerRef.current) return () => {};

    const sortable = Sortable.create(containerRef.current, {
      handle: ".drag-handle",
      animation: 200,
      easing: "cubic-bezier(1, 0, 0, 1)",
      delay: 2,
      group: {
        pull: false,
        put: false,
      },
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
      onEnd: (event) => {
        if (containerRef.current) {
          Array.from(containerRef.current.children).forEach((child) => {
            child.classList.remove("jiggle-animation");
          });
        }
        
        setDroppedData(event)
      },
    });
    return () => {
        
    };
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let isDragging = false;
  
    const dragOverListener = (e: MouseEvent) => {
      if (!containerRef.current) return;
  
      const draggedItem = containerRef.current.querySelector(".sortable-chosen");
      const container = document.getElementsByClassName('main-container')[0];
  
      if (!draggedItem) {
        isDragging = false;
        return;
      }
  
      isDragging = true;
      const rect = draggedItem.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const threshold = 500; // Updated to 100 pixels
      const initialDelay = 500; // 500ms for first page change
      const continuousDelay = 300; // 300ms for subsequent page changes
  
      // Clear any existing timeout to reset the timer
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
  
      // Check if item is near right edge (next page)
      if (rect.right >= containerRect.right - threshold) {
        timeoutId = setTimeout(() => {
          goToNextPage();
          // If still in trigger zone after page change, set up continuous page changes
          if (isDragging && draggedItem.getBoundingClientRect().right >= containerRect.right - threshold) {
            timeoutId = setTimeout(() => goToNextPage(), continuousDelay);
          }
        }, initialDelay);
      }
      // Check if item is near left edge (previous page)
      else if (rect.left <= containerRect.left + 100) {
        timeoutId = setTimeout(() => {
          goToPrevPage();
          // If still in trigger zone after page change, set up continuous page changes
          if (isDragging && draggedItem.getBoundingClientRect().left <= containerRect.left + 100) {
            timeoutId = setTimeout(() => goToPrevPage(), continuousDelay);
          }
        }, initialDelay);
      }
    };
  
    // Listen for dragover event to check if page change should happen
    window.addEventListener("dragover", dragOverListener);
  
    return () => {
      // Clean up event listener and any pending timeout
      window.removeEventListener("dragover", dragOverListener);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentPage, goToNextPage, goToPrevPage]);

const [direction, setDirection] = useState<'left' | 'right' | ''>('');
useEffect(() => {
  if (direction) {
    // This function runs after the transition ends
    const transitionEndHandler = () => {
      setDirection(''); // Reset the transition direction
    };
    
    containerRef.current?.addEventListener("transitionend", transitionEndHandler);

    return () => {
      containerRef.current?.removeEventListener("transitionend", transitionEndHandler);
    };
  }
}, [direction]);

  return (
    <Box
      className={`${direction}`}
      sx={{
        ".sortable-page-content": {
          transform: direction === 'right'
            ? 'translateX(-100%)'
            : direction === 'left'
            ? 'translateX(100%)'
            : 'translateX(0)',
          transition: direction ? 'transform 0.5s ease-in' : 'none',
        },
      }}
      onTransitionEnd={() => setDirection('')}
    >
    <Box
      ref={containerRef}
      className={`${className} sortable-page-content`}
      sx={{
        gap: "16px",
        display: "grid",
        width: '100%',
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
      {/* {paginatedItems.map((item, index) => (
        <div
          key={paginatedItems.length * (currentPage - 1) + index}
          data-id={paginatedItems.length * (currentPage - 1) + index}
          className="drag-handle"
          style={{
            ...styles?.[index],
          }}
        >
          {item} {currentPage}
        </div>
      ))} */}

      {updatedPaginatedData[`page${currentPage}`]?.map((item, index) => {
        return (
          <div
          key={item?.id}
          data-id={item?.id}
          data-currentpage={currentPage}
          className="drag-handle"
          style={{
            ...styles?.[index], 
          }}
        >
          {item?.component}
        </div>
        )
      })}
    </Box>
    <Box sx={{
      display: "flex",
      gap: "5px",
      marginTop: "15px",
      justifyContent: "center"
    }}>
      {Object.keys(paginatedData).map((page: string, index: number) => (
        <Box sx={{
          border: "1px soldi black",
          width: page === `page${currentPage}` ? "75px" : "10px",
          height: "10px",
          background: page === `page${currentPage}` ? "#475569" : "#E2E8F0",
          borderRadius: page === `page${currentPage}` ? "15px" : "50%",
        }}
          onClick={() => setCurrentPage(index + 1)}>
        </Box>
      ))}
    </Box>
    </Box>
  );
}
