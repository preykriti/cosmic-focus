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
import { useAuth } from '../context/AuthContext';
import { StarBackground } from '../components/StarBackground';
import Ionicon from '@react-native-vector-icons/ionicons';
import StreakHeatmap from '../components/StreakHeatmap';


export default function ProfileScreen({ navigation }: any) {
  const {user, logout} = useAuth();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);

  const getColor = (value: number) => {
    switch (value) {
      case 0:
        return 'rgba(255,255,255,0.08)';
      case 1:
        return '#1a5f7a';
      case 2:
        return '#2081ac';
      case 3:
        return '#36b2d6';
      case 4:
        return '#64c8ff';
      default:
        return 'rgba(255,255,255,0.1)';
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
      await logout();
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
            <Ionicon name="planet-outline" size={50} color="#64c8ff" />
          </View>
          <Text style={styles.spaceTitle}>username</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </Animated.View>

        {/* stats */}
        <View style={styles.holographicPanel}>
          <View style={styles.panelBorder}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  <Ionicon name="flame-outline" size={22} color="#d3ac20ff" />
                  12
                </Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  <Ionicon name="star-outline" size={22} color="#d3ac20ff" />
                  340
                </Text>
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
    backgroundColor: '#111633',
  },

  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
    opacity: 0.8,
  },

  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },

  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(15, 40, 90, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.4)',
    marginBottom: 15,
    boxShadow: '0 0 6px rgba(0, 212, 255, 0.3)',
  },
  spaceTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: '#64c8ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  emailText: {
    fontSize: 14,
    color: '#ccc',
  },

  holographicPanel: {
    width: '90%',
    backgroundColor: 'rgba(10, 25, 60, 0.55)',
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 212, 255, 0.6)',
    padding: 25,
    marginBottom: 25,
    boxShadow: `
      0 0 10px rgba(0, 212, 255, 0.6), 
      0 0 20px rgba(138, 43, 226, 0.4), 
      inset 0 0 4px rgba(0, 212, 255, 0.5),
      inset 0 0 10px rgba(138, 43, 226, 0.3)
    `,
  },

  panelBorder: {
    position: 'relative',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // backgroundColor: "red"
  },

  statBox: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#64c8ff',
  },

  statLabel: {
    fontSize: 14,
    color: '#aaa',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: '#64c8ff',
    textShadowRadius: 8,
  },

  spaceButton: {
    width: '90%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 140, 180, 0.8)',
    boxShadow: `
      0 0 10px rgba(0, 212, 255, 0.7),
      0 0 20px rgba(138, 43, 226, 0.4)
    `,
  },

  spaceButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
