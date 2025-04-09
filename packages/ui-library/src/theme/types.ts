export interface Theme {
  colors: {
    common: {
      background: string;
      text: string;
      border: string;
      stroke: string;
    };
    axis: {
      line: string;
      label: string;
      grid: string;
      title: string;
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
