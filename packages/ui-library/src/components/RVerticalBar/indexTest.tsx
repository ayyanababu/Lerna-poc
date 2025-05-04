/**
 * Helper function to determine how to display x-axis labels based on available space
 * This improved version automatically handles different chart widths and label lengths
 */
// const getXAxisLabelDisplay = (innerWidth: number, labels: string[]) => {
//     // For very small charts or single label, show flat
//     if (innerWidth < 100 || labels.length <= 1) {
//         return {
//             tickValues: null,
//             formatLabel: (label: string) => label,
//             rotate: false,
//             angle: 0,
//             verticalAnchor: 'middle',
//             textAnchor: 'middle',
//             extraBottomMargin: 15,
//         };
//     }

//     // Calculate average characters we can fit per label at 8px per character (approximate)
//     const avgCharWidth = 8;
//     const spacePerLabel = innerWidth / labels.length;
//     const charsPerLabel = Math.floor(spacePerLabel / avgCharWidth);

//     // Calculate average label length
//     const totalLabelLength = labels.reduce((sum, label) => sum + String(label).length, 0);
//     const avgLabelLength = totalLabelLength / labels.length;

//     // Get the longest label length for consideration
//     const maxLabelLength = Math.max(...labels.map((label) => String(label).length));

//     // Calculate total space needed for all labels if flat
//     const totalSpaceNeeded = totalLabelLength * avgCharWidth;
//     const spaceRatio = totalSpaceNeeded / innerWidth;

//     // Determine which labels to show based on available space
//     let tickValues = null;
//     let shouldRotate = false;
//     let truncateLength = 12;
//     let angle = 0;

//     // 1. If we have enough space for all labels at full length (with padding), show them flat
//     if (spaceRatio < 0.7 && charsPerLabel >= avgLabelLength) {
//         shouldRotate = false;
//         tickValues = null; // Show all
//     }
//     // 2. If labels are short but there are many of them, show a subset
//     else if (maxLabelLength <= 10 && labels.length > innerWidth / 80) {
//         shouldRotate = false;
//         // Show first, last, and evenly distributed middle labels
//         const labelCount = Math.max(2, Math.floor(innerWidth / 80));
//         tickValues = getDistributedLabels(labels, labelCount);
//     }
//     // 3. If labels are long but there's still reasonable space, rotate them
//     else if (maxLabelLength > charsPerLabel || spaceRatio > 0.7) {
//         shouldRotate = true;
//         angle = -45;

//         // If we have too many labels even when rotated, show a subset
//         if (labels.length > innerWidth / 40) {
//             const labelCount = Math.max(2, Math.floor(innerWidth / 40));
//             tickValues = getDistributedLabels(labels, labelCount);
//         }

//         // Adjust truncation length based on available space
//         truncateLength = Math.max(8, Math.min(16, charsPerLabel * 1.4));
//     }

//     return {
//         tickValues,
//         formatLabel: (label: string) => {
//             if (typeof label !== 'string') return label;
//             if (String(label).length > truncateLength) {
//                 return `${String(label).substring(0, truncateLength)}...`;
//             }
//             return label;
//         },
//         rotate: shouldRotate,
//         angle,
//         verticalAnchor: shouldRotate ? 'start' : 'middle',
//         textAnchor: shouldRotate ? 'end' : 'middle',
//         extraBottomMargin: shouldRotate ? 35 : 15,
//     };
// };

/**
 * Helper function to select evenly distributed labels including first and last
 */
// const getDistributedLabels = (labels: string[], count: number) => {
//     if (count >= labels.length) return null; // Show all

//     const selectedLabels = [labels[0]]; // Always include first label

//     // If we can show more than just first and last
//     if (count > 2) {
//         const step = (labels.length - 2) / (count - 2);

//         // Add middle labels at evenly spaced intervals
//         for (let i = 1; i < count - 1; i++) {
//             const index = Math.round(1 + step * i);
//             if (index > 0 && index < labels.length - 1) {
//                 selectedLabels.push(labels[index]);
//             }
//         }
//     }

//     // Always include last label
//     if (labels.length > 1) {
//         selectedLabels.push(labels[labels.length - 1]);
//     }

//     return selectedLabels;
// };
