import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { FocusSession } from './focusSession';
import { DailyStats, WeeklyStats, MonthlyStats } from '../../types/reports';

const firestore = getFirestore();

const getDateRange = (
  timeframe: 'daily' | 'weekly' | 'monthly',
  periods: number,
) => {
  const now = new Date();
  const ranges: { start: Date; end: Date }[] = [];

  for (let i = 0; i < periods; i++) {
    let start: Date, end: Date;

    if (timeframe === 'daily') {
      start = new Date(now);
      start.setDate(now.getDate() - i);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    }
    // else if (timeframe === 'weekly') {
    //   const base = new Date(now);
    //   const dayOfWeek = base.getDay();
    //   start = new Date(base);
    //   start.setDate(base.getDate() - dayOfWeek - (i * 7));
    //   start.setHours(0, 0, 0, 0);
    //   end = new Date(start);
    //   end.setDate(start.getDate() + 6);
    //   end.setHours(23, 59, 59, 999);
    // }
    else if (timeframe === 'weekly') {
      end = new Date(now); // latest day = today
      end.setHours(23, 59, 59, 999);

      start = new Date(end);
      start.setDate(end.getDate() - 6); // 7-day week ending today
      start.setHours(0, 0, 0, 0);

      // previous weeks
      if (i > 0) {
        start.setDate(start.getDate() - i * 7);
        end.setDate(end.getDate() - i * 7);
      }
    } else {
      // monthly
      start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      end = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
        999,
      );
    }

    ranges.unshift({ start, end });
  }

  return ranges;
};

export const fetchUserSessions = async (
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<FocusSession[]> => {
  const sessionsRef = collection(firestore, 'focusSessions');
  const q = query(
    sessionsRef,
    where('userId', '==', userId),
    where('startTime', '>=', Timestamp.fromDate(startDate)),
    where('startTime', '<=', Timestamp.fromDate(endDate)),
    orderBy('startTime', 'desc'),
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as FocusSession),
  );
};

const calculateSessionStats = (sessions: FocusSession[]) => {
  const stats = {
    totalSessions: sessions.length,
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    abandonedSessions: sessions.filter(s => s.status === 'abandoned').length,
    totalFocusMinutes: 0,
    starsEarned: 0,
    deadStars: 0,
  };

  sessions.forEach(session => {
    if (session.status === 'completed' && session.sessionType === 'pomodoro') {
      stats.totalFocusMinutes += Math.floor(session.duration / 60);
      stats.starsEarned += session.duration === 25 * 60 ? 5 : 10;
    }
    if (session.status === 'abandoned' && session.sessionType === 'pomodoro') {
      stats.deadStars += 1;
    }
  });

  return stats;
};

export const getDailyStats = async (
  userId: string,
  days: number = 7,
): Promise<DailyStats[]> => {
  const ranges = getDateRange('daily', days);
  const dailyStats: DailyStats[] = [];

  for (const range of ranges) {
    const sessions = await fetchUserSessions(userId, range.start, range.end);
    const stats = calculateSessionStats(sessions);

    dailyStats.push({
      ...stats,
      date: range.start.toISOString().split('T')[0],
    });
  }

  return dailyStats;
};

export const getWeeklyStats = async (
  userId: string,
  weeks: number = 4,
): Promise<WeeklyStats[]> => {
  const ranges = getDateRange('weekly', weeks);
  const weeklyStats: WeeklyStats[] = [];

  for (const range of ranges) {
    const sessions = await fetchUserSessions(userId, range.start, range.end);
    const stats = calculateSessionStats(sessions);

    weeklyStats.push({
      ...stats,
      weekStart: range.start.toISOString().split('T')[0],
      weekEnd: range.end.toISOString().split('T')[0],
    });
  }

  return weeklyStats;
};

export const getMonthlyStats = async (
  userId: string,
  months: number = 6,
): Promise<MonthlyStats[]> => {
  const ranges = getDateRange('monthly', months);
  const monthlyStats: MonthlyStats[] = [];

  for (const range of ranges) {
    const sessions = await fetchUserSessions(userId, range.start, range.end);
    const stats = calculateSessionStats(sessions);

    monthlyStats.push({
      ...stats,
      month: range.start.toLocaleDateString('en-US', { month: 'short' }),
      year: range.start.getFullYear(),
    });
  }

  return monthlyStats;
};
