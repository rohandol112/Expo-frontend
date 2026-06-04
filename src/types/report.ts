export interface ReportMetric {
  label: string;
  value: string | number;
}

export interface ChartPoint {
  name: string;
  views?: number;
  users?: number;
}

export interface ReportRow {
  id: string;
  name: string;
  value: number;
  change: string;
}

export interface DayWiseReport {
  id: string;
  date: string;
  news: number;
  users: number;
  notifications: number;
  views: number;
}
