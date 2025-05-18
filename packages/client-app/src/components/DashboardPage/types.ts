
export type DonutDataItem = {
    label: string;
    value: number;
    color: string;
};

export type TreeMapNode = {
    id: string;
    name: string;
    value: number;
    children?: TreeMapNode[];
};

export type StackedBarItem = {
    label: string;
    data: Record<string, number>;
};


export type VerticalBarItem = {
    label: string;
    value: number;
};