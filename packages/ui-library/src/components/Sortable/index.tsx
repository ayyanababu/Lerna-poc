import { Box } from '@mui/material';
import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import Sortable from 'sortablejs';
import { SortableProps } from './types.d';

export default function SortableComponent({ children, className }: SortableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ id: number }[]>([]);
  const childrenArray = useMemo(() => React.Children.toArray(children), [children]);

  useEffect(() => {
    setState(childrenArray.map((_, index) => ({ id: index })));
  }, [childrenArray]);

  useEffect(() => {
    if (!containerRef.current) return;

    const sortable = Sortable.create(containerRef.current, {
      handle: '.drag-handle',
      animation: 200,
      easing: 'cubic-bezier(1, 0, 0, 1)',
      delay: 2,
      onUpdate: (event) => {
        const nodes = Array.from(containerRef.current?.children || []);
        const newIds = nodes.map((node) => parseInt(node.getAttribute('data-id') || '0'));
        setState(newIds.map((id) => ({ id })));
      },
    });

    return () => sortable.destroy();
  }, []);

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        gap: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        '& .sortable-ghost': {
          backgroundColor: '#8fc5ff',
          borderRadius: '8px',
          '& *': {
            opacity: 0,
          },
        },
      }}
    >
      {state.map((item) => (
        <div key={item.id} data-id={item.id}>
          {childrenArray[item.id]}
        </div>
      ))}
    </Box>
  );
}
