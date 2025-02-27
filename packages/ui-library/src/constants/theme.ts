export interface Theme {
  colors: {
    common: {
      background: string;
      text: string;
      border: string;
    };
    charts: {
      barChart: string[];
      donutChart: string[];
    };
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
  };
}

export const defaultLightTheme: Theme = {
  colors: {
    common: {
      background: '#f1f5f9',
      text: '#0f172a',
      border: '#e2e8f0',
    },
    charts: {
      barChart: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
        '#fed8cc',
      ],
      donutChart: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
        '#fed8cc',
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
  },
};

export const defaultDarkTheme: Theme = {
  colors: {
    common: {
      background: '#0f172a',
      text: '#f1f5f9',
      border: '#45556b',
    },
    charts: {
      barChart: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
        '#fed8cc',
      ],
      donutChart: [
        '#9bc5ef',
        '#50c1c2',
        '#fad176',
        '#407abc',
        '#93a3bc',
        '#f9804e',
        '#fed8cc',
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
  },
};
