export interface Theme {
    colors: {
        common: {
            background: string;
            text: string;
            border: string;
        };
        axis: {
            line: string;
            label: string;
            grid: string;
        };
        tooltip: {
            background: string;
            text: string;
            border: string;
        };
        legend: {
            text: string;
            background: string;
        };
        charts: {
            gradient: {
                from: string;
                to: string;
            };
            bar: string[];
            stackedBar: string[];
            line: string[];
            area: string[];
            treemap: string[];
            donut: string[];
            pie: string[];
            scatter: string[];
        };
    };
}
