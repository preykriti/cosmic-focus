import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

const { height } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);

  const getColor = (value: number) => {
    switch (value) {
      case 0:
        return colors.light.border;
      case 1:
        return '#E0E7FF';
      case 2:
        return '#A5B4FC';
      case 3:
        return '#6366F1';
      case 4:
        return '#4F46E5';
      default:
        return colors.light.border;
    }
  };

  useEffect(() => {
    const weeks = 18;
    const days = 7;
    const data: number[][] = [];
    for (let w = 0; w < weeks; w++) {
      const week: number[] = [];
      for (let d = 0; d < days; d++) {
        week.push(Math.floor(Math.random() * 5));
      }
      data.push(week);
    }
    setHeatmapData(data);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error: any) {
      console.log('Logout failed:', error.message);
    }
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
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
            <Text style={styles.statNumber}>12</Text>
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
            <Text style={styles.statNumber}>340</Text>
            <Text style={styles.statLabel}>Stars</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicon
                name="time-outline"
                size={20}
                color={colors.light.warning}
              />
            </View>
            <Text style={styles.statNumber}>42h</Text>
            <Text style={styles.statLabel}>Focus Hours</Text>
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
            <Text style={styles.progressNumber}>128</Text>
            <Text style={styles.progressLabel}>Tasks Done</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>256</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    height: height - 50,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 10,
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
    marginBottom: 40,
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
    marginVertical: 12,
  },
});
