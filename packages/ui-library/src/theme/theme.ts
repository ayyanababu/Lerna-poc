import { Theme } from './types';

export const defaultLightTheme: Theme = {
    colors: {
        common: {
            background: '#fff',
            text: '#0f172a',
            border: 'transparent',
        },
        axis: {
            line: '#94a3bb',
            label: '#64748b',
            grid: '#94a3bb',
        },
        tooltip: {
            background: '#ffffff',
            text: '#0f172a',
            border: '#e2e8f0',
        },
        legend: {
            text: '#475569',
            background: '#ffffff',
        },
        charts: {
            gradient: {
                from: '#9bc5ef',
                to: '#9bc5ef',
            },
            bar: ['#9bc5ef'],
            stackedBar: [
                '#9bc5ef',
                '#50c1c2',
                '#fad176',
                '#407abc',
                '#93a3bc',
                '#f9804e',
                '#fed8cc',
            ],
            line: ['#407abc', '#50c1c2', '#f9804e', '#fad176', '#93a3bc'],
            area: ['#9bc5ef', '#50c1c2', '#fad176', '#407abc', '#93a3bc', '#f9804e'],
            treemap: ['#9bc5ef', '#50c1c2', '#fad176', '#407abc', '#93a3bc', '#f9804e', '#fed8cc'],
            donut: ['#9bc5ef', '#50c1c2', '#fad176', '#407abc', '#93a3bc', '#f9804e', '#fed8cc'],
            pie: ['#9bc5ef', '#50c1c2', '#fad176', '#407abc', '#93a3bc', '#f9804e', '#fed8cc'],
            scatter: ['#9bc5ef', '#50c1c2', '#fad176', '#407abc', '#93a3bc', '#f9804e'],
        },
    },
};

export const defaultDarkTheme: Theme = {
    colors: {
        common: {
            background: '#0f172a',
            text: '#f1f5f9',
            border: '#45556b',
        },
        axis: {
            line: '#94a3bb',
            label: '#94a3b8',
            grid: '#94a3bb',
        },
        tooltip: {
            background: '#1e293b',
            text: '#f1f5f9',
            border: '#45556b',
        },
        legend: {
            text: '#f1f5f9',
            background: '#0f172a',
        },
        charts: {
            gradient: {
                from: '#9bc5ef',
                to: '#9bc5ef',
            },
            bar: ['#9bc5ef'],
            stackedBar: [
                '#9bc5ef',
                '#50c1c2',
                '#fad176',
                '#407abc',
                '#93a3bc',
                '#f9804e',
                '#fed8cc',
            ],
            line: ['#407abc', '#50c1c2', '#f9804e', '#fad176', '#93a3bc'],
            area: ['#9bc5ef', '#50c1c2', '#fad176', '#407abc', '#93a3bc', '#f9804e'],
            treemap: ['#9bc5ef', '#50c1c2', '#fad176', '#407abc', '#93a3bc', '#f9804e', '#fed8cc'],
            donut: ['#9bc5ef', '#50c1c2', '#fad176', '#407abc', '#93a3bc', '#f9804e', '#fed8cc'],
            pie: ['#9bc5ef', '#50c1c2', '#fad176', '#407abc', '#93a3bc', '#f9804e', '#fed8cc'],
            scatter: ['#9bc5ef', '#50c1c2', '#fad176', '#407abc', '#93a3bc', '#f9804e'],
        },
    },
};
