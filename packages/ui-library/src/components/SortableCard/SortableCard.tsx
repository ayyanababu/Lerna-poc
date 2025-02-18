import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import React, { forwardRef, ReactNode } from 'react';
import { RxDragHandleDots2 } from 'react-icons/rx';
import { Title } from '../Title/Title';

export const SortableCard = forwardRef<
  HTMLDivElement,
  { children: ReactNode; title?: string }
>(({ children, title }, ref) => {
  return (
    <Card
      ref={ref}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        borderRadius: '8px',
        padding: 1,
        backgroundColor: 'white',
        boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.05)',
        border: '1px solid #bfc6ca1f',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          padding: '8px'
        }}
      >
        <Title title={title} />
        <Box
          sx={{
            display: 'flex',
            cursor: 'pointer',
            marginLeft: 'auto',
            fontSize: '24px',
          }}
          className="drag-handle"
        >
          <RxDragHandleDots2 />
        </Box>
      </Box>

      <CardContent sx={{ display: 'flex', padding: '8px', height: 800, width: 200 }}>{children}</CardContent>
    </Card>
  );
});