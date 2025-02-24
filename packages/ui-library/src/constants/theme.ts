export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  axis: string;
  grid: string;
  tooltipBackground: string;
  tooltipText: string;
  legend: string;
  subtext: string;
  categorical: string[]; // For categorical data visualizations
  sequential: string[]; // For sequential/heatmap visualizations
  diverging: string[]; // For diverging data visualizations
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: string;
  subtextSize: string;
  axisLabelSize: string;
  tooltipSize: string;
  legendSize: string;
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
}

export const defaultLightTheme: Theme = {
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    background: '#ffffff',
    axis: '#6b6b6b',
    grid: '#e0e0e0',
    tooltipBackground: '#212121',
    tooltipText: '#ffffff',
    legend: '#424242',
    subtext: '#757575',
    categorical: [
      '#9bc5ef',
      '#50c1c2',
      '#fad176',
      '#407abc',
      '#93a3bc',
      '#f9804e',
      '#fed8cc',
    ],
    sequential: [
      '#fff7ec',
      '#fee8c8',
      '#fdd49e',
      '#fdbb84',
      '#fc8d59',
      '#ef6548',
      '#d7301f',
      '#990000',
    ],
    diverging: ['#d7191c', '#fdae61', '#ffffbf', '#abd9e9', '#2c7bb6'],
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '14px',
    subtextSize: '12px',
    axisLabelSize: '13px',
    tooltipSize: '14px',
    legendSize: '13px',
  },
};

export const defaultDarkTheme: Theme = {
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    background: '#ffffff',
    axis: '#6b6b6b',
    grid: '#e0e0e0',
    tooltipBackground: '#212121',
    tooltipText: '#ffffff',
    legend: '#424242',
    subtext: '#757575',
    categorical: [
      '#9bc5ef',
      '#50c1c2',
      '#fad176',
      '#407abc',
      '#93a3bc',
      '#f9804e',
      '#fed8cc',
    ],
    sequential: [
      '#0b0d17',
      '#13182a',
      '#1e2540',
      '#2c3458',
      '#3d4572',
      '#51588e',
      '#686db0',
      '#8282d2',
    ],
    diverging: ['#d7191c', '#fdae61', '#ffffbf', '#abd9e9', '#2c7bb6'],
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '14px',
    subtextSize: '12px',
    axisLabelSize: '13px',
    tooltipSize: '14px',
    legendSize: '13px',
  },
};
