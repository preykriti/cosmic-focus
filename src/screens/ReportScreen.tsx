import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';
import { colors } from '../constants/colors';
import { ReportTabNavigator } from '../components/reports/TabNavigator';
import StatsCard  from '../components/reports/StatsCard';
import ChartContainer  from '../components/reports/ChartContainer';
import { ReportTimeframe, DailyStats, WeeklyStats, MonthlyStats } from '../types/reports';
import { getDailyStats, getWeeklyStats, getMonthlyStats } from '../firebase/firestore/reports'

export default function ReportScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<ReportTimeframe>('daily');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyStats[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, activeTab]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      switch (activeTab) {
        case 'daily':
          if (dailyData.length === 0) {
            const data = await getDailyStats(user.id, 7);
            setDailyData(data);
          }
          break;
        case 'weekly':
          if (weeklyData.length === 0) {
            const data = await getWeeklyStats(user.id, 4);
            setWeeklyData(data);
          }
          break;
        case 'monthly':
          if (monthlyData.length === 0) {
            const data = await getMonthlyStats(user.id, 6);
            setMonthlyData(data);
          }
          break;
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!user?.id) return;
    
    setRefreshing(true);
    try {
      switch (activeTab) {
        case 'daily':
          const dailyData = await getDailyStats(user.id, 7);
          setDailyData(dailyData);
          break;
        case 'weekly':
          const weeklyData = await getWeeklyStats(user.id, 4);
          setWeeklyData(weeklyData);
          break;
        case 'monthly':
          const monthlyData = await getMonthlyStats(user.id, 6);
          setMonthlyData(monthlyData);
          break;
      }
    } catch (error) {
      console.error('Error refreshing report data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'daily':
        return dailyData;
      case 'weekly':
        return weeklyData;
      case 'monthly':
        return monthlyData;
      default:
        return [];
    }
  };

  const formatLabels = (data: any[]) => {
    if (activeTab === 'daily') {
      return data.map((item: DailyStats) => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
    } else if (activeTab === 'weekly') {
      return data.map((item: WeeklyStats, index: number) => `W${index + 1}`);
    } else {
      return data.map((item: MonthlyStats) => `${item.month} ${item.year.toString().slice(-2)}`);
    }
  };

  const getCurrentPeriodHeading = (): string => {
    const currentData = getCurrentData();
    if (currentData.length === 0) return '';

    const latestPeriod = currentData[currentData.length - 1];
    // const latestPeriod = currentData[0];
    // 
    switch (activeTab) {
      case 'daily':
        if ('date' in latestPeriod) {
          const date = new Date((latestPeriod as DailyStats).date);
          return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        }
        break;
      
      case 'weekly':
        if ('weekStart' in latestPeriod && 'weekEnd' in latestPeriod) {
          const weekStart = new Date((latestPeriod as WeeklyStats).weekStart);
          const weekEnd = new Date((latestPeriod as WeeklyStats).weekEnd);
          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        break;
      
      case 'monthly':
        if ('month' in latestPeriod && 'year' in latestPeriod) {
          const monthly = latestPeriod as MonthlyStats;
          // convert month name to month number
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthIndex = monthNames.indexOf(monthly.month);
          if (monthIndex !== -1) {
            const monthName = new Date(monthly.year, monthIndex).toLocaleDateString('en-US', { month: 'long' });
            return `${monthName} ${monthly.year}`;
          }
          return `${monthly.month} ${monthly.year}`;
        }
        break;
      
      default:
        return '';
    }
    
    return '';
  };

  const currentData = getCurrentData();
  const chartLabels = formatLabels(currentData);

  const focusMinutesData = {
    labels: chartLabels,
    datasets: [{
      data: currentData.map(item => item.totalFocusMinutes),
      color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    }],
  };

  const sessionsData = {
    labels: chartLabels,
    datasets: [{
      data: currentData.map(item => item.completedSessions),
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    }],
  };

  const starsData = {
    labels: chartLabels,
    datasets: [{
      data: currentData.map(item => item.starsEarned),
      color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
    }],
  };

  const currentPeriodStats = currentData.length > 0 ? currentData[currentData.length - 1] : null;
  // const currentPeriodStats = currentData.length > 0 ? currentData[0] : null;
  const periodHeading = getCurrentPeriodHeading();

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text>Please log in to view reports</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Focus Reports</Text>
      </View>

      <ReportTabNavigator
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.light.primary} />
          <Text style={styles.loadingText}>Loading report data...</Text>
        </View>
      ) : (
        <>
          {currentPeriodStats && (
            <View style={styles.periodSection}>
              <Text style={styles.periodHeading}>{periodHeading}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statsColumn}>
                  <StatsCard
                    title="Focus Minutes"
                    value={currentPeriodStats.totalFocusMinutes}
                    subtitle="minutes focused"
                    color={colors.light.success}
                  />
                  <StatsCard
                    title="Completed Sessions"
                    value={currentPeriodStats.completedSessions}
                    subtitle={`of ${currentPeriodStats.totalSessions} total`}
                    color={colors.light.primary}
                  />
                </View>
                <View style={styles.statsColumn}>
                  <StatsCard
                    title="Stars Earned"
                    value={currentPeriodStats.starsEarned}
                    subtitle="productivity stars"
                    color={colors.light.warning}
                  />
                  <StatsCard
                    title="Success Rate"
                    value={`${Math.round((currentPeriodStats.completedSessions / Math.max(currentPeriodStats.totalSessions, 1)) * 100)}%`}
                    subtitle="completion rate"
                    color={currentPeriodStats.completedSessions > currentPeriodStats.abandonedSessions ? colors.light.success : colors.light.error}
                  />
                </View>
              </View>
            </View>
          )}

          <ChartContainer
            title={`Focus Minutes (${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)})`}
            data={focusMinutesData}
            type="line"
            yAxisSuffix="m"
          />

          <ChartContainer
            title={`Completed Sessions (${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)})`}
            data={sessionsData}
            type="bar"
            showValues
          />

          <ChartContainer
            title={`Stars Earned (${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)})`}
            data={starsData}
            type="line"
          />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.light.textSecondary,
  },
  periodSection: {
    marginBottom: 24,
  },
  periodHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.light.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statsColumn: {
    flex: 1,
  },
});