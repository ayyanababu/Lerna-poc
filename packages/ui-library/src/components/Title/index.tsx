import React from "react";
import Typography from "@mui/material/Typography";

import useTheme from "../../hooks/useTheme";
import { TitleProps } from "./types";

export default function Title({ title, ...props }: TitleProps) {
  const { theme } = useTheme();

  if (!title) return null;
  return (
    <Typography
      variant="subtitle2"
      gutterBottom
      color={theme.colors.common.text}
      fontSize="13px"
      fontStyle="normal"
      fontWeight={500}
      lineHeight="150%"
      letterSpacing="0.25px"
      {...props}
    >
      {title}
    </Typography>
  );
}
