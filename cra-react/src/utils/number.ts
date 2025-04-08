export const formatNumberWithSuffix = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}B`;
  } else if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
  } else if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K`;
  }
  return value.toLocaleString();
};

export const isNumeric = (value: string | number): boolean => {
  if (typeof value === "number") return true;
  if (typeof value !== "string") return false;
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
};
