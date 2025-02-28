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
