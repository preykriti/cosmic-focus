import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { globalStyles } from '../styles/global';
import Ionicon from '@react-native-vector-icons/ionicons';
import StreakHeatmap from '../components/StreakHeatmap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';

const { height } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);

  const getColor = (value: number) => {
    switch (value) {
      case 0:
        return '#e5e7eb';
      case 1:
        return '#93c5fd';
      case 2:
        return '#60a5fa';
      case 3:
        return '#3b82f6';
      case 4:
        return '#1d4ed8';
      default:
        return '#e5e7eb';
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
          <Ionicon name="person-outline" size={40} color="#3b82f6" />
        </View>
        <Text style={styles.username}>{'username'}</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      {/* stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicon name="flame-outline" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicon name="star-outline" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.statNumber}>340</Text>
            <Text style={styles.statLabel}>Stars</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicon name="time-outline" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.statNumber}>42h</Text>
            <Text style={styles.statLabel}>Focus Hours</Text>
          </View>
        </View>
      </View>

      {/* streak*/}
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

      {/* logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicon name="log-out-outline" size={18} color="#ffffff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    elevation: 2,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 1,
  },
  emailText: {
    fontSize: 14,
    color: '#64748b',
  },
  statsContainer: {
    backgroundColor: '#fff',
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
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  progressNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  
  logoutButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#1e3a8a',
    // marginTop: 16,
    marginBottom: 40,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
});
