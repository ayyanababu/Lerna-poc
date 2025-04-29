import { useLayoutEffect, useState } from "react";
import { ResizeObserver } from "@visx/responsive/lib/types";

const bottomHeightAddOnSpace = 0;
const titleHeightAddOnSpace = 0;

export default function useLegendAndTitleMeasurement(
  parentRef: React.RefObject<HTMLDivElement>,
  activatesizing: boolean,
) {
  const [bottomHeight, setBottomHeight] = useState(0);
  const [titleHeight, setTitleHeight] = useState(0);

  useLayoutEffect(() => {
    if (!parentRef.current || !activatesizing) return;

    const parentNode = parentRef.current?.parentNode as HTMLElement;
    if (!parentNode) return;

    const legendDiv = parentNode.querySelector("div"); // Legend div
    const titleElement = parentNode?.parentNode?.querySelector(
      ".MuiTypography-h6",
    ) as HTMLElement; // Title

    if (!legendDiv || !titleElement) return;

    const resizeLegendObserver = new ResizeObserver(() => {
      const spans =
        parentRef.current?.parentNode?.parentNode?.querySelectorAll<HTMLSpanElement>(
          "span",
        ) || [];
      const lastSpan = spans.length ? spans[spans.length - 1] : null;
      const extraHeight = lastSpan ? lastSpan.offsetHeight : 0;

      setBottomHeight(
        legendDiv.offsetHeight + extraHeight + bottomHeightAddOnSpace,
      );
    });

    const resizeTitleObserver = new ResizeObserver(() => {
      setTitleHeight(titleElement.offsetHeight + titleHeightAddOnSpace);
    });

    resizeLegendObserver.observe(legendDiv);
    resizeTitleObserver.observe(titleElement);

    return () => {
      resizeLegendObserver.disconnect();
      resizeTitleObserver.disconnect();
    };
  }, [parentRef, activatesizing]);

  return { bottomHeight, titleHeight };
}
