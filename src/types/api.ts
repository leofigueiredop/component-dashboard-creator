
export interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface ComparisonData {
  periodA: {
    startDate: string;
    endDate: string;
    value: number;
  };
  periodB: {
    startDate: string;
    endDate: string;
    value: number;
  };
  percentageChange: number;
}

export interface BarChartData {
  source: string;
  data: DataPoint[];
}

export interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type ChartType = 'comparison' | 'bar' | 'candlestick';

export interface ComponentConfig {
  id: string;
  type: ChartType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sources: string[];
  settings: Record<string, any>;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  components: ComponentConfig[];
}
