import React from "react";

import useTheme from "../hooks/useTheme";
import { FontFamilyImportProps } from "./types.d";

function FontFamilyImport({ uniqueId = "" }: FontFamilyImportProps) {
  const { theme } = useTheme();
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@300;400;500;700&family=Roboto:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />
      <style>
        {`
        ${uniqueId} * {
          font-family: 'Roboto', 'Open Sans', sans-serif;
          color: ${theme.colors.common.text};
        }
      `}
      </style>
    </>
  );
}
export default FontFamilyImport;
