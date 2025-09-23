export type ReportTimeframe = 'daily' | 'weekly' | 'monthly';

export interface ReportData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  totalFocusMinutes: number;
  starsEarned: number;
  deadStars: number;
}

export interface DailyStats extends SessionStats {
  date: string;
}

export interface WeeklyStats extends SessionStats {
  weekStart: string;
  weekEnd: string;
}

export interface MonthlyStats extends SessionStats {
  month: string;
  year: number;
}
