import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { globalStyles } from '../styles/global';
import { StarBackground } from '../components/StarBackground';
import Ionicon from '@react-native-vector-icons/ionicons';
import StreakHeatmap from '../components/StreakHeatmap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);

  const getColor = (value: number) => {
    switch (value) {
      case 0:
        return 'rgba(255,255,255,0.05)';
      case 1:
        return 'rgba(59, 130, 246, 0.3)';
      case 2:
        return 'rgba(59, 130, 246, 0.5)';
      case 3:
        return 'rgba(59, 130, 246, 0.7)';
      case 4:
        return '#3b82f6';
      default:
        return 'rgba(255,255,255,0.05)';
    }
  };

  useEffect(() => {
    const weeks = 12;
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

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error: any) {
      console.log('Logout failed:', error.message);
    }
  };

  return (
    <View style={[globalStyles.container, styles.spaceContainer]}>
      <StarBackground count={40} />

      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* user info */}
        <Animated.View
          style={[
            styles.avatarContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={styles.avatarCircle}>
            <Ionicon name="planet-outline" size={50} color="#94a3b8" />
          </View>
          <Text style={styles.spaceTitle}>username</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </Animated.View>

        {/* stats */}
        <View style={styles.holographicPanel}>
          <View style={styles.panelBorder}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <View style={styles.statValueContainer}>
                  <Ionicon name="flame-outline" size={22} color="#f59e0b" />
                  <Text style={styles.statNumber}>12</Text>
                </View>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statBox}>
                <View style={styles.statValueContainer}>
                  <Ionicon name="star-outline" size={22} color="#f59e0b" />
                  <Text style={styles.statNumber}>340</Text>
                </View>
                <Text style={styles.statLabel}>Stars</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.holographicPanel}>
          <Text style={styles.sectionTitle}>Focus Streak</Text>
          <StreakHeatmap data={heatmapData} getColor={getColor} />
        </View>

        {/* progress overview */}
        <View style={styles.holographicPanel}>
          <Text style={styles.sectionTitle}>Progress Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>42h</Text>
              <Text style={styles.statLabel}>Focus Hours</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>128</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>256</Text>
              <Text style={styles.statLabel}>Pomodoros</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.spaceButton, { marginTop: 30 }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.spaceButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  spaceContainer: {
    flex: 1,
    backgroundColor: '#0f132cff',
  },

  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },

  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginBottom: 15,
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)',
  },

  spaceTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(96, 165, 250, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  emailText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },

  holographicPanel: {
    width: '94%',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    padding: 24,
    marginBottom: 24,
    boxShadow: `
      0 0 10px rgba(255, 255, 255, 0.15),
      0 4px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
  },

  panelBorder: {
    position: 'relative',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },

  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },

  statLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },

  spaceButton: {
    width: '94%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    boxShadow: `
      0 4px 16px rgba(30, 64, 175, 0.25),
      0 0 0 1px rgba(59, 130, 246, 0.1)
    `,
  },

  spaceButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
