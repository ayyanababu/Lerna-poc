import { scaleOrdinal } from '@visx/scale';
import React, { SetStateAction } from 'react';

export enum LegendVariant {
    COMPACT = 'compact',
    EXPANDED = 'expanded'
}

export enum LegendPosition {
    TOP = 'top',
    BOTTOM = 'bottom',
    LEFT = 'left',
    RIGHT = 'right'
}

export type LegendVariantType = LegendVariant | 'compact' | 'expanded';
export type LegendPositionType = LegendPosition | 'top' | 'bottom' | 'left' | 'right';

export type LegendItem = {
    label: string;
    value: number;
    color?: string;
};

export type LegendData = LegendItem[];

export interface LegendLabel {
    text: string;
    value?: string;
    datum: string;
    index: number;
}

export interface LegendsProps {
    colorScale?: ReturnType<typeof scaleOrdinal<string, string>>;
    data?: LegendData;
    hideIndex?: number[];
    setHideIndex?: React.Dispatch<SetStateAction<number[]>>;
    hovered?: string | null | undefined;
    setHovered?: React.Dispatch<SetStateAction<string | null | undefined>>;
    position?: LegendPositionType;
    onClick?: (data: LegendData, legend: string, index: number) => void;
    isLoading?: boolean;
    doStrike?: boolean;
    isVisible?: boolean;
    variant?: LegendVariantType;
    hideValues?: boolean;
}

export interface LegendItemProps {
    label?: LegendLabel;
    index?: number;
    data?: LegendData;
    isHidden?: boolean;
    isHoveredOther?: boolean;
    isLoading?: boolean;
    doStrike?: boolean;
    variant?: LegendVariantType;
    onToggle?: () => void;
    onMouseOver?: () => void;
    onMouseLeave?: () => void;
    hideValues?: boolean;
}