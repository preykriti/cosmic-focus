import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { globalStyles } from '../styles/global';
import Ionicon from '@react-native-vector-icons/ionicons';
import StreakHeatmap from '../components/StreakHeatmap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import { colors } from '../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import {
  aggregateSessionsByWeek,
  fetchUserSessions,
} from '../firebase/firestore/focusSession';

const { height } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const stars = user?.stars ? user.stars : 0;
  const streak = user?.streak ? user.streak : 0;
  const minutes = user?.totalFocusMinutes ? user.totalFocusMinutes : 0;
  const totalTaskDone = user?.totalTasksDone ? user.totalTasksDone : 0;
  const deadStars = user?.deadStars ? user.deadStars : 0;
  const totalPomodoro = user?.totalPomodoros ? user.totalPomodoros : 0;

  const [heatmapData, setHeatmapData] = useState<number[][]>([]);

  const getColor = (value: number) => {
    if (value === 0) return colors.light.border;
    if (value >= 1 && value <= 5) return '#C7D2FE';
    if (value >= 6 && value <= 10) return '#8B5CF6';
    if (value >= 11 && value <= 15) return '#5B21B6';
    if (value >= 16) return '#3B0CA3';
    return colors.light.border;
  };

  const onRefresh = async () => {
    if (!user?.id) return;

    setRefreshing(true);
    try {
      console.log('Refreshing heatmap data...');
      const sessions = await fetchUserSessions(user.id);
      const data = aggregateSessionsByWeek(sessions, 18);
      setHeatmapData(data);
    } catch (error) {
      console.error('Failed to refresh heatmap data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadHeatmapData = async () => {
      if (!user?.id) {
        console.log('No user ID available');
        return;
      }

      try {
        console.log('Fetching sessions for user:', user.id);
        const sessions = await fetchUserSessions(user.id);
        console.log('Fetched sessions:', sessions.length);
        console.log(
          'Sessions details:',
          sessions.map(s => ({
            id: s.id,
            createdAt: s.createdAt,
            sessionMode: s.sessionMode,
            status: s.status,
          })),
        );

        const data = aggregateSessionsByWeek(sessions, 18);
        console.log('Heatmap data:', data);

        // Check if today has any data
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        console.log('Today:', todayStr);

        setHeatmapData(data);
      } catch (error) {
        console.error('Failed to load heatmap data:', error);
      }
    };

    loadHeatmapData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error: any) {
      console.log('Logout failed:', error.message);
    }
  };

  const convertMinutesToHour = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.light.primary]}
          progressBackgroundColor={colors.light.surface}
        />
      }
    >
      {/* user info */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Ionicon
            name="person-outline"
            size={40}
            color={colors.light.primary}
          />
        </View>
        <Text style={styles.username}>{user?.username || 'username'}</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      {/* stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicon
                name="flame-outline"
                size={20}
                color={colors.light.warning}
              />
            </View>
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicon
                name="star-outline"
                size={20}
                color={colors.light.warning}
              />
            </View>
            <Text style={styles.statNumber}>{stars}</Text>
            <Text style={styles.statLabel}>Stars</Text>
          </View>

          {/* 🔄 moved Dead Stars here */}
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicon
                name="skull-outline"
                size={20}
                color={colors.light.warning}
              />
            </View>
            <Text style={styles.statNumber}>{deadStars}</Text>
            <Text style={styles.statLabel}>Dead Stars</Text>
          </View>
        </View>
      </View>

      {/* streak + progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Streak</Text>
        <StreakHeatmap data={heatmapData} getColor={getColor} />
        <View style={styles.separator} />
        <Text style={styles.sectionTitle}>Progress Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>
              {convertMinutesToHour(minutes)}
            </Text>
            <Text style={styles.progressLabel}>Focus Hours</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{totalPomodoro}</Text>
            <Text style={styles.progressLabel}>Pomodoros</Text>
          </View>
        </View>
      </View>

      {/* logout button */}
      <TouchableOpacity
        style={styles.logoutButtonWrapper}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.light.gradientStart, colors.light.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoutButton}
        >
          <Ionicon name="log-out-outline" size={18} color={colors.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  contentContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingBottom: 55, 
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
    marginBottom: 10,
    elevation: 2,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 1,
  },
  emailText: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  statsContainer: {
    backgroundColor: colors.light.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 28,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.light.textSecondary,
    fontWeight: '500',
  },
  section: {
    backgroundColor: colors.light.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 16,
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  progressNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.light.textSecondary,
    fontWeight: '500',
  },
  logoutButtonWrapper: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  logoutButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: 13,
  },
});
