import { Theme } from './types.d';

export const defaultLightTheme: Theme = {
  colors: {
    common: {
      background: '#fff',
      text: '#0f172a',
      border: 'transparent',
    },
    axis: {
      line: '#94a3b8',
      label: '#64748b',
      grid: '#e2e8f0',
    },
    tooltip: {
      background: '#ffffff',
      text: '#0f172a',
      border: '#e2e8f0',
    },
    legend: {
      text: '#64748b',
      background: '#ffffff',
    },
    charts: {
      bar: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
        '#fed8cc',
      ],
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
      treemap: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
        '#fed8cc',
      ],
      donut: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
        '#fed8cc',
      ],
      pie: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
        '#fed8cc',
      ],
      scatter: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
      ],
    },
  },
  typography: {
    fontFamily: '"Roboto", "Open Sans", sans-serif',
    fontSize: {
      small: '12px',
      medium: '16px',
      large: '20px',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      bold: 700,
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
      line: '#64748b',
      label: '#94a3b8',
      grid: '#334155',
    },
    tooltip: {
      background: '#1e293b',
      text: '#f1f5f9',
      border: '#45556b',
    },
    legend: {
      text: '#94a3b8',
      background: '#1e293b',
    },
    charts: {
      bar: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
        '#fed8cc',
      ],
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
      treemap: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
        '#fed8cc',
      ],
      donut: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
        '#fed8cc',
      ],
      pie: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
        '#fed8cc',
      ],
      scatter: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
      ],
    },
  },
  typography: {
    fontFamily: '"Roboto", "Open Sans", sans-serif',
    fontSize: {
      small: '12px',
      medium: '16px',
      large: '20px',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      bold: 700,
    },
  },
};
