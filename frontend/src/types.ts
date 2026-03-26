export interface Metrics {
  session_duration_sec: number;
  blink_count: number;
  bpm: number;
  distance_cm: number;
  risk_level: string;
  ear: number;
  alert?: {
    title: string;
    message: string;
  };
  last_water_intake: number;
}

export interface ChartData {
  time: string;
  bpm: number;
  ear: number;
}
