import React, { forwardRef } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import useTheme from "../../hooks/useTheme";
import Title from "../Title";
import { SortableCardProps } from "./types";

const SortableCard = forwardRef<HTMLDivElement, SortableCardProps>(
  ({ children, title, height, width, ...props }, ref) => {
    const { theme } = useTheme();
    return (
      <Card
        ref={ref}
        {...props}
        sx={{
          backgroundColor: theme.colors.common.background,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          borderRadius: "8px",
          padding: 1,
          boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.05)",
          border: `1px solid ${theme.colors.common.border}`,
          transition: "all 0.2s ease-in-out",
          minHeight: "400px",
          "&:hover": {
            transform: "translateY(-2px)",
          },
          ...(props?.sx || {}),
        }}
      >
        {title && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1,
              padding: "8px",
            }}
          >
            <Title title={title} />
            {/* <Box
                        sx={{
                            display: 'flex',
                            cursor: 'pointer',
                            marginLeft: 'auto',
                            fontSize: '24px',
                            '&:active': {
                                cursor: 'grabbing',
                            },
                        }}
                        color={theme.colors.common.text}
                        className="drag-handle"
                    >
                        <RxDragHandleDots2 />
                    </Box> */}
          </Box>
        )}

        <CardContent
          {...props?.childrenProps}
          sx={{
            display: "flex",
            padding: "4px",
            height,
            width,
            ...(props?.sx || {}),
          }}
        >
          {children}
        </CardContent>
      </Card>
    );
  },
);

export default SortableCard;
