// import { common } from '@arcesium/react-mui-commons/theme/colors';
import { alpha } from '@mui/material/styles';

import { Theme } from './types';

export const common = {
    white: '#FFFFFF',
    black: '#000000',
};

const colors = [
    '#4277ce',
    '#99c7ef',
    '#f97f50',
    '#FAD173',
    '#4bc4c2',
    '#fa8cf8',
    '#a3296e',
    '#01866E',
    '#349E8B',
    '#4f135e',
];

export const defaultLightTheme: Theme = {
    colors: {
        common: {
            background: common.white,
            text: '#0F172A',
            border: 'transparent',
        },
        axis: {
            line: '#94A3B8',
            label: '#475569',
            grid: '#94A3B8',
            title: '#475569',
        },
        tooltip: {
            background: common.white,
            text: '#0F172A',
            border: '#E2E8F0',
        },
        legend: {
            text: '#475569',
            background: common.white,
        },
        charts: {
            bar: [...colors],
            stackedBar: [...colors],
            line: [...colors],
            area: [...colors],
            treemap: [...colors],
            donut: [...colors],
            pie: [...colors],
            scatter: [...colors],
        },
    },
};

export const defaultDarkTheme: Theme = {
    colors: {
        common: {
            background: '#1B2025',
            text: '#E4E7EB',
            border: alpha('#3E4C59', 0.6),
        },
        axis: {
            line: '#7B8695',
            label: '#acbbc7',
            grid: '#7B8695',
            title: '#acbbc7',
        },
        tooltip: {
            background: '#1E293B',
            text: '#E4E7EB',
            border: '#3E4C59',
        },
        legend: {
            text: '#ACBBC7',
            background: '#1B2025',
        },
        charts: {
            bar: [...colors],
            stackedBar: [...colors],
            line: [...colors],
            area: [...colors],
            treemap: [...colors],
            donut: [...colors],
            pie: [...colors],
            scatter: [...colors],
        },
    },
};
